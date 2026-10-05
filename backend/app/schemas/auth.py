from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserRegisterSchema(BaseModel):
    email: EmailStr = Field(..., description="Email đăng ký", json_schema_extra={"example": "user@example.com"})
    password: str = Field(..., min_length=6, description="Mật khẩu (tối thiểu 6 ký tự)")
    confirm_password: str = Field(..., description="Xác nhận mật khẩu")
    full_name: Optional[str] = Field(None, description="Họ và tên")
    phone: Optional[str] = Field(None, description="Số điện thoại")

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Mật khẩu xác nhận không khớp")
        return v


class UserLoginSchema(BaseModel):
    email: EmailStr = Field(..., description="Email đăng nhập")
    password: str = Field(..., description="Mật khẩu")


class RefreshTokenSchema(BaseModel):
    refresh_token: str = Field(..., description="Refresh Token JWT")


class UserResponseSchema(BaseModel):
    id: int
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TokenResponseSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponseSchema
