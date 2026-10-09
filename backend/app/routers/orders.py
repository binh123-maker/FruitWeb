import math
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_active_user, require_admin
from app.models.user import User
from app.models.product import Product
from app.models.cart import CartItem
from app.models.order import Order, OrderItem
from app.models.coupon import Coupon
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderItemResponse,
    OrderStatusUpdate,
    PaginatedOrderResponse,
)
from app.routers.coupons import calculate_coupon_discount

router = APIRouter(prefix="/orders", tags=["Orders"])

VALID_STATUSES = ["pending", "confirmed", "shipping", "delivered", "cancelled"]

ALLOWED_TRANSITIONS = {
    "pending": ["confirmed", "cancelled"],
    "confirmed": ["shipping", "cancelled"],
    "shipping": ["delivered", "cancelled"],
    "delivered": [],
    "cancelled": [],
}


def _calculate_product_price(product: Product) -> float:
    if product.sale_price is not None and float(product.sale_price) > 0:
        return float(product.sale_price)
    return float(product.price)


def _build_order_response(order: Order) -> OrderResponse:
    item_responses = []
    for item in order.items:
        prod = item.product
        item_responses.append(
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                product_name=prod.name if prod else "Sản phẩm",
                product_slug=prod.slug if prod else None,
                product_image=prod.image if prod else None,
                quantity=item.quantity,
                unit_price=float(item.unit_price),
                subtotal=round(float(item.unit_price) * item.quantity, 2),
            )
        )

    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        status=order.status,
        subtotal=float(order.subtotal) if order.subtotal is not None else float(order.total_amount),
        discount_amount=float(order.discount_amount) if order.discount_amount else 0.0,
        coupon_code=order.coupon_code,
        total_amount=float(order.total_amount),
        shipping_address=order.shipping_address,
        customer_name=order.customer_name,
        phone=order.phone,
        payment_method=order.payment_method,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=item_responses,
    )


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """
    Tạo đơn hàng mới:
    - Nếu items không được truyền, tự động tạo từ giỏ hàng hiện tại.
    - Lấy thông tin giá và tồn kho hoàn toàn từ database.
    - Hỗ trợ mã giảm giá coupon.
    - Trừ tồn kho và xóa giỏ hàng trong cùng transaction an toàn.
    """
    items_to_order: list[tuple[Product, int]] = []
    from_cart = False

    if payload.items and len(payload.items) > 0:
        # Nhận danh sách sản phẩm từ client payload
        for item_in in payload.items:
            product = db.query(Product).filter(Product.id == item_in.product_id).with_for_update().first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Sản phẩm với ID {item_in.product_id} không tồn tại",
                )
            if not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Sản phẩm '{product.name}' hiện đang ngưng bán",
                )
            if item_in.quantity > product.stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Sản phẩm '{product.name}' không đủ số lượng tồn kho (khả dụng: {product.stock}, yêu cầu: {item_in.quantity})",
                )
            items_to_order.append((product, item_in.quantity))
    else:
        # Lấy từ giỏ hàng của user
        cart_items = (
            db.query(CartItem)
            .filter(CartItem.user_id == current_user.id)
            .all()
        )
        if not cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng.",
            )
        from_cart = True
        for cart_item in cart_items:
            product = db.query(Product).filter(Product.id == cart_item.product_id).with_for_update().first()
            if not product or not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Sản phẩm '{product.name if product else ''}' không còn khả dụng",
                )
            if cart_item.quantity > product.stock:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Sản phẩm '{product.name}' không đủ tồn kho (khả dụng: {product.stock})",
                )
            items_to_order.append((product, cart_item.quantity))

    # Tính tổng phụ
    subtotal = 0.0
    for product, qty in items_to_order:
        unit_price = _calculate_product_price(product)
        subtotal += unit_price * qty
    subtotal = round(subtotal, 2)

    # Xử lý mã giảm giá (nếu có)
    discount_amount = 0.0
    applied_coupon_code = None
    if payload.coupon_code:
        coupon_code = payload.coupon_code.strip().upper()
        coupon = db.query(Coupon).filter(Coupon.code == coupon_code).with_for_update().first()
        if not coupon:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mã giảm giá '{coupon_code}' không tồn tại",
            )
        valid, discount, msg = calculate_coupon_discount(coupon, subtotal)
        if not valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=msg,
            )
        discount_amount = discount
        applied_coupon_code = coupon.code
        coupon.usage_count += 1

    total_amount = max(0.0, round(subtotal - discount_amount, 2))

    # Tạo Order
    order = Order(
        user_id=current_user.id,
        status="pending",
        total_amount=total_amount,
        subtotal=subtotal,
        discount_amount=discount_amount,
        coupon_code=applied_coupon_code,
        customer_name=payload.customer_name or current_user.full_name or current_user.email,
        phone=payload.phone or current_user.phone,
        payment_method=payload.payment_method or "COD",
        shipping_address=payload.shipping_address,
    )
    db.add(order)
    db.flush()  # Sinh order.id

    # Tạo OrderItems và trừ tồn kho
    for product, qty in items_to_order:
        unit_price = _calculate_product_price(product)
        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=unit_price,
        )
        db.add(order_item)
        product.stock -= qty
        product.sold_count += qty

    # Xóa giỏ hàng nếu đặt từ giỏ hàng
    if from_cart:
        db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()

    db.commit()
    db.refresh(order)
    return _build_order_response(order)


@router.get("", response_model=List[OrderResponse])
def get_user_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Lấy danh sách đơn hàng của người dùng hiện tại."""
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return [_build_order_response(o) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order_detail(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Xem chi tiết một đơn hàng (chỉ chủ đơn hoặc Admin)."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đơn hàng không tồn tại",
        )

    if order.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập đơn hàng này",
        )

    return _build_order_response(order)


@router.put("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Hủy đơn hàng và hoàn trả lại số lượng tồn kho sản phẩm."""
    order = db.query(Order).filter(Order.id == order_id).with_for_update().first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đơn hàng không tồn tại",
        )

    if order.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền hủy đơn hàng này",
        )

    if order.status not in ["pending", "confirmed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Không thể hủy đơn hàng ở trạng thái '{order.status}'",
        )

    # Hoàn trả lại tồn kho
    for item in order.items:
        prod = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if prod:
            prod.stock += item.quantity
            prod.sold_count = max(0, prod.sold_count - item.quantity)

    # Hoàn trả lượt sử dụng coupon (nếu có)
    if order.coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == order.coupon_code).with_for_update().first()
        if coupon and coupon.usage_count > 0:
            coupon.usage_count -= 1

    order.status = "cancelled"
    db.commit()
    db.refresh(order)
    return _build_order_response(order)


# ==========================================
# ADMIN ENDPOINTS FOR ORDERS
# ==========================================

@router.get("/admin/all", response_model=PaginatedOrderResponse)
def admin_get_all_orders(
    status_filter: Optional[str] = Query(None, alias="status", description="Lọc theo trạng thái"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin xem danh sách toàn bộ đơn hàng trong hệ thống (phân trang)."""
    query = db.query(Order)
    if status_filter:
        query = query.filter(Order.status == status_filter)

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1

    orders = (
        query.order_by(Order.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return PaginatedOrderResponse(
        items=[_build_order_response(o) for o in orders],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.put("/admin/{order_id}/status", response_model=OrderResponse)
def admin_update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin cập nhật trạng thái đơn hàng theo luồng chuyển trạng thái hợp lệ."""
    order = db.query(Order).filter(Order.id == order_id).with_for_update().first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Đơn hàng không tồn tại",
        )

    new_status = payload.status.lower()
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Trạng thái '{payload.status}' không hợp lệ. Phải là một trong {VALID_STATUSES}",
        )

    if new_status == order.status:
        return _build_order_response(order)

    allowed = ALLOWED_TRANSITIONS.get(order.status, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Không thể chuyển trạng thái từ '{order.status}' sang '{new_status}'. Các trạng thái cho phép: {allowed}",
        )

    # Nếu chuyển sang cancelled, hoàn lại tồn kho
    if new_status == "cancelled":
        for item in order.items:
            prod = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if prod:
                prod.stock += item.quantity
                prod.sold_count = max(0, prod.sold_count - item.quantity)
        if order.coupon_code:
            coupon = db.query(Coupon).filter(Coupon.code == order.coupon_code).with_for_update().first()
            if coupon and coupon.usage_count > 0:
                coupon.usage_count -= 1

    order.status = new_status
    db.commit()
    db.refresh(order)
    return _build_order_response(order)
