from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator


class CouponCreate(BaseModel):
    code: str = Field(..., min_length=3, max_length=50, description="Mã giảm giá (viết hoa)")
    discount_type: Literal["percentage", "fixed"] = Field(..., description="Loại giảm giá: percentage hoặc fixed")
    discount_value: float = Field(..., gt=0, description="Giá trị giảm giá (phần trăm hoặc số tiền)")
    min_order_amount: float = Field(0.0, ge=0, description="Đơn hàng tối thiểu để áp dụng")
    max_discount_amount: Optional[float] = Field(None, gt=0, description="Giảm tối đa (đối với percentage)")
    usage_limit: Optional[int] = Field(None, gt=0, description="Giới hạn số lượt dùng")
    start_date: Optional[datetime] = Field(None, description="Thời gian bắt đầu áp dụng")
    end_date: Optional[datetime] = Field(None, description="Thời gian kết thúc áp dụng")
    is_active: bool = Field(True, description="Trạng thái kích hoạt")

    @field_validator("code")
    @classmethod
    def uppercase_code(cls, v: str) -> str:
        return v.strip().upper()

    @field_validator("discount_value")
    @classmethod
    def validate_discount_value(cls, v: float, info) -> float:
        d_type = info.data.get("discount_type")
        if d_type == "percentage" and (v <= 0 or v > 100):
            raise ValueError("Tỷ lệ giảm giá percentage phải từ 1 đến 100")
        return v


class CouponUpdate(BaseModel):
    discount_type: Optional[Literal["percentage", "fixed"]] = None
    discount_value: Optional[float] = Field(None, gt=0)
    min_order_amount: Optional[float] = Field(None, ge=0)
    max_discount_amount: Optional[float] = Field(None, gt=0)
    usage_limit: Optional[int] = Field(None, gt=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class CouponResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    discount_type: str
    discount_value: float
    min_order_amount: float
    max_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    usage_count: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime


class CouponValidateRequest(BaseModel):
    code: str = Field(..., description="Mã giảm giá cần kiểm tra")
    order_amount: float = Field(..., ge=0, description="Tổng giá trị đơn hàng trước giảm giá")


class CouponValidateResponse(BaseModel):
    valid: bool
    code: str
    discount_type: str
    discount_value: float
    discount_amount: float
    message: str
