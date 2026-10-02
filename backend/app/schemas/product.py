from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.category import CategoryResponse


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    price: float = Field(..., ge=0)
    sale_price: Optional[float] = Field(None, ge=0)
    image: Optional[str] = None
    category_id: Optional[int] = None
    origin: Optional[str] = ""
    unit: str = "kg"
    stock: int = Field(0, ge=0)
    rating: float = Field(5.0, ge=0, le=5.0)
    review_count: int = Field(0, ge=0)
    sold_count: int = Field(0, ge=0)
    is_featured: bool = False
    is_best_seller: bool = False
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    sale_price: Optional[float] = Field(None, ge=0)
    image: Optional[str] = None
    category_id: Optional[int] = None
    origin: Optional[str] = None
    unit: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    rating: Optional[float] = Field(None, ge=0, le=5.0)
    review_count: Optional[int] = Field(None, ge=0)
    sold_count: Optional[int] = Field(None, ge=0)
    is_featured: Optional[bool] = None
    is_best_seller: Optional[bool] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    price: float
    sale_price: Optional[float] = None
    image: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    category_slug: Optional[str] = None
    category: Optional[CategoryResponse] = None
    origin: Optional[str] = ""
    unit: str = "kg"
    stock: int = 0
    rating: float = 5.0
    review_count: int = 0
    sold_count: int = 0
    is_featured: bool = False
    is_best_seller: bool = False
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedProductResponse(BaseModel):
    items: List[ProductResponse]
    page: int
    limit: int
    total: int
    total_pages: int
