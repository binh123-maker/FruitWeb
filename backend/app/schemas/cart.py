from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


class CartItemAdd(BaseModel):
    product_id: int = Field(..., description="ID sản phẩm")
    quantity: int = Field(1, ge=1, description="Số lượng (tối thiểu 1)")


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, description="Số lượng cập nhật (tối thiểu 1)")


class CartItemProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    price: float
    sale_price: Optional[float] = None
    image: Optional[str] = None
    stock: int
    unit: str = "kg"
    is_active: bool = True


class CartItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    product: CartItemProductResponse
    unit_price: float
    subtotal: float


class CartResponse(BaseModel):
    items: List[CartItemResponse] = []
    total_items: int = 0
    total_price: float = 0.0
