from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.user import UserRole


class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    username: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AdminUserRoleUpdate(BaseModel):
    role: UserRole = Field(..., description="Vai trò mới (USER hoặc ADMIN)")


class AdminUserStatusUpdate(BaseModel):
    is_active: bool = Field(..., description="Trạng thái kích hoạt (true = mở khóa, false = khóa)")


class PaginatedUserResponse(BaseModel):
    items: List[AdminUserResponse] = []
    total: int = 0
    page: int = 1
    limit: int = 10
    total_pages: int = 1
