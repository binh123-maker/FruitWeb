from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., description="ID sản phẩm")
    quantity: int = Field(1, ge=1, description="Số lượng sản phẩm")


class OrderCreate(BaseModel):
    items: Optional[List[OrderItemCreate]] = Field(
        None, description="Danh sách sản phẩm (nếu để trống sẽ lấy từ giỏ hàng)"
    )
    shipping_address: str = Field(..., min_length=5, max_length=500, description="Địa chỉ giao hàng")
    customer_name: Optional[str] = Field(None, max_length=255, description="Tên người nhận")
    phone: Optional[str] = Field(None, max_length=20, description="Số điện thoại người nhận")
    coupon_code: Optional[str] = Field(None, max_length=50, description="Mã giảm giá nếu có")
    payment_method: str = Field("COD", max_length=50, description="Phương thức thanh toán")


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    product_slug: Optional[str] = None
    product_image: Optional[str] = None
    quantity: int
    unit_price: float
    subtotal: float


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    status: str
    subtotal: Optional[float] = None
    discount_amount: float = 0.0
    coupon_code: Optional[str] = None
    total_amount: float
    shipping_address: Optional[str] = None
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    payment_method: Optional[str] = "COD"
    payment_status: Optional[str] = "unpaid"
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., description="Trạng thái đơn hàng mới")


class OrderPaymentStatusUpdate(BaseModel):
    payment_status: str = Field(..., description="Trạng thái thanh toán mới (unpaid, paid, paid_mock, refunded)")


class PaginatedOrderResponse(BaseModel):
    items: List[OrderResponse] = []
    total: int = 0
    page: int = 1
    limit: int = 10
    total_pages: int = 1
