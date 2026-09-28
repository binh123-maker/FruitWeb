from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Thành công"
    data: Optional[T] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str = "Thông tin không hợp lệ"
    errors: Optional[Any] = None


def success_response(data: Any = None, message: str = "Thành công") -> dict:
    return {
        "success": True,
        "message": message,
        "data": data,
    }


def error_response(message: str = "Đã xảy ra lỗi", errors: Any = None) -> dict:
    return {
        "success": False,
        "message": message,
        "errors": errors or {},
    }
