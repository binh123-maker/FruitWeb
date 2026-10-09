from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_active_user
from app.models.user import User
from app.models.product import Product
from app.models.cart import CartItem
from app.schemas.cart import (
    CartItemAdd,
    CartItemUpdate,
    CartItemResponse,
    CartItemProductResponse,
    CartResponse,
)

router = APIRouter(prefix="/cart", tags=["Cart"])


def _calculate_unit_price(product: Product) -> float:
    if product.sale_price is not None and float(product.sale_price) > 0:
        return float(product.sale_price)
    return float(product.price)


def _build_cart_response(cart_items: list[CartItem]) -> CartResponse:
    item_responses = []
    total_price = 0.0
    total_items = 0

    for item in cart_items:
        product = item.product
        unit_price = _calculate_unit_price(product)
        subtotal = round(unit_price * item.quantity, 2)
        total_price += subtotal
        total_items += item.quantity

        prod_resp = CartItemProductResponse(
            id=product.id,
            name=product.name,
            slug=product.slug,
            price=float(product.price),
            sale_price=float(product.sale_price) if product.sale_price else None,
            image=product.image,
            stock=product.stock,
            unit=product.unit,
            is_active=product.is_active,
        )

        item_responses.append(
            CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                product=prod_resp,
                unit_price=unit_price,
                subtotal=subtotal,
            )
        )

    return CartResponse(
        items=item_responses,
        total_items=total_items,
        total_price=round(total_price, 2),
    )


@router.get("", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Lấy giỏ hàng của người dùng hiện tại."""
    items = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id)
        .join(CartItem.product)
        .order_by(CartItem.created_at.asc())
        .all()
    )
    return _build_cart_response(items)


@router.post("/items", response_model=CartResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    payload: CartItemAdd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Thêm sản phẩm vào giỏ hàng."""
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sản phẩm không tồn tại",
        )

    if not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sản phẩm hiện đang ngưng bán",
        )

    existing_item = (
        db.query(CartItem)
        .filter(
            CartItem.user_id == current_user.id,
            CartItem.product_id == payload.product_id,
        )
        .first()
    )

    requested_qty = payload.quantity
    if existing_item:
        new_qty = existing_item.quantity + requested_qty
        if new_qty > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Số lượng yêu cầu ({new_qty}) vượt quá tồn kho khả dụng ({product.stock})",
            )
        existing_item.quantity = new_qty
    else:
        if requested_qty > product.stock:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Số lượng yêu cầu ({requested_qty}) vượt quá tồn kho khả dụng ({product.stock})",
            )
        new_item = CartItem(
            user_id=current_user.id,
            product_id=product.id,
            quantity=requested_qty,
        )
        db.add(new_item)

    db.commit()

    items = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id)
        .join(CartItem.product)
        .order_by(CartItem.created_at.asc())
        .all()
    )
    return _build_cart_response(items)


@router.put("/items/{item_id}", response_model=CartResponse)
def update_cart_item(
    item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Cập nhật số lượng của một sản phẩm trong giỏ hàng."""
    item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sản phẩm trong giỏ hàng không tồn tại",
        )

    product = item.product
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sản phẩm không còn khả dụng",
        )

    if payload.quantity > product.stock:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Số lượng yêu cầu ({payload.quantity}) vượt quá tồn kho ({product.stock})",
        )

    item.quantity = payload.quantity
    db.commit()

    items = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id)
        .join(CartItem.product)
        .order_by(CartItem.created_at.asc())
        .all()
    )
    return _build_cart_response(items)


@router.delete("/items/{item_id}", response_model=CartResponse)
def delete_cart_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Xóa một sản phẩm khỏi giỏ hàng."""
    item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sản phẩm trong giỏ hàng không tồn tại",
        )

    db.delete(item)
    db.commit()

    items = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id)
        .join(CartItem.product)
        .order_by(CartItem.created_at.asc())
        .all()
    )
    return _build_cart_response(items)


@router.delete("", response_model=CartResponse)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Xóa toàn bộ sản phẩm trong giỏ hàng."""
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return CartResponse(items=[], total_items=0, total_price=0.0)
