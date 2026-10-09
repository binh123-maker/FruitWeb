from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_active_user, require_admin
from app.models.user import User
from app.models.coupon import Coupon
from app.schemas.coupon import (
    CouponCreate,
    CouponUpdate,
    CouponResponse,
    CouponValidateRequest,
    CouponValidateResponse,
)

router = APIRouter(prefix="/coupons", tags=["Coupons"])


def calculate_coupon_discount(coupon: Coupon, order_amount: float) -> tuple[bool, float, str]:
    now = datetime.now(timezone.utc)
    if not coupon.is_active:
        return False, 0.0, "Mã giảm giá đã bị vô hiệu hóa"

    start_date = coupon.start_date
    if start_date and start_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=timezone.utc)

    end_date = coupon.end_date
    if end_date and end_date.tzinfo is None:
        end_date = end_date.replace(tzinfo=timezone.utc)

    if start_date and start_date > now:
        return False, 0.0, "Mã giảm giá chưa đến thời gian áp dụng"

    if end_date and end_date < now:
        return False, 0.0, "Mã giảm giá đã hết hạn"

    if coupon.usage_limit is not None and coupon.usage_count >= coupon.usage_limit:
        return False, 0.0, "Mã giảm giá đã hết lượt sử dụng"

    if order_amount < float(coupon.min_order_amount):
        return (
            False,
            0.0,
            f"Đơn hàng tối thiểu phải từ {float(coupon.min_order_amount):,.0f}đ để áp dụng mã này",
        )

    if coupon.discount_type == "percentage":
        discount = order_amount * (float(coupon.discount_value) / 100.0)
        if coupon.max_discount_amount is not None:
            discount = min(discount, float(coupon.max_discount_amount))
    else:  # fixed
        discount = float(coupon.discount_value)

    discount = max(0.0, min(discount, order_amount))
    return True, round(discount, 2), "Áp dụng mã giảm giá thành công"


@router.post("/validate", response_model=CouponValidateResponse)
def validate_coupon(
    payload: CouponValidateRequest,
    db: Session = Depends(get_db),
    _current_user: User = Depends(get_current_active_user),
):
    """Kiểm tra và tính toán giảm giá của coupon đối với tổng tiền đơn hàng."""
    code = payload.code.strip().upper()
    coupon = db.query(Coupon).filter(Coupon.code == code).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mã giảm giá không tồn tại",
        )

    valid, discount_amount, message = calculate_coupon_discount(coupon, payload.order_amount)
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message,
        )

    return CouponValidateResponse(
        valid=True,
        code=coupon.code,
        discount_type=coupon.discount_type,
        discount_value=float(coupon.discount_value),
        discount_amount=discount_amount,
        message=message,
    )


@router.get("", response_model=List[CouponResponse])
def get_coupons(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Lấy danh sách mã giảm giá (Admin thấy tất cả, User thấy mã đang hoạt động)."""
    query = db.query(Coupon)
    if current_user.role != "ADMIN":
        now = datetime.now(timezone.utc)
        query = query.filter(Coupon.is_active == True)
    elif is_active is not None:
        query = query.filter(Coupon.is_active == is_active)

    return query.order_by(Coupon.created_at.desc()).all()


@router.get("/{coupon_id}", response_model=CouponResponse)
def get_coupon_detail(
    coupon_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Xem chi tiết mã giảm giá (Admin only)."""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mã giảm giá không tồn tại",
        )
    return coupon


@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(
    payload: CouponCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Tạo mã giảm giá mới (Admin only)."""
    code = payload.code.strip().upper()
    existing = db.query(Coupon).filter(Coupon.code == code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã giảm giá này đã tồn tại",
        )

    coupon = Coupon(
        code=code,
        discount_type=payload.discount_type,
        discount_value=payload.discount_value,
        min_order_amount=payload.min_order_amount,
        max_discount_amount=payload.max_discount_amount,
        usage_limit=payload.usage_limit,
        usage_count=0,
        start_date=payload.start_date,
        end_date=payload.end_date,
        is_active=payload.is_active,
    )
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon


@router.put("/{coupon_id}", response_model=CouponResponse)
def update_coupon(
    coupon_id: int,
    payload: CouponUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Cập nhật mã giảm giá (Admin only)."""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mã giảm giá không tồn tại",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(coupon, field, value)

    db.commit()
    db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}")
def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Xóa mã giảm giá (Admin only)."""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mã giảm giá không tồn tại",
        )

    db.delete(coupon)
    db.commit()
    return {"success": True, "message": "Xóa mã giảm giá thành công"}
