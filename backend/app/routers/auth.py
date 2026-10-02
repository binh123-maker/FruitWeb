from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.dependencies.auth import get_current_active_user, require_admin
from app.models.user import User
from app.schemas.auth import (
    UserRegisterSchema,
    UserLoginSchema,
    RefreshTokenSchema,
    UserResponseSchema,
    TokenResponseSchema,
)
from app.schemas.common import ApiResponse, success_response
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=ApiResponse[TokenResponseSchema],
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản người dùng mới",
)
def register(
    data: UserRegisterSchema,
    db: Session = Depends(get_db),
):
    """Đăng ký tài khoản mới và trả về thông tin token đăng nhập."""
    user = auth_service.register_user(db=db, data=data)
    token_payload = auth_service.generate_user_tokens(user=user)
    return success_response(
        data=token_payload,
        message="Đăng ký tài khoản thành công",
    )


@router.post(
    "/login",
    response_model=ApiResponse[TokenResponseSchema],
    summary="Đăng nhập hệ thống",
)
def login(
    data: UserLoginSchema,
    db: Session = Depends(get_db),
):
    """Đăng nhập bằng Email và Password."""
    user = auth_service.authenticate_user(db=db, data=data)
    token_payload = auth_service.generate_user_tokens(user=user)
    return success_response(
        data=token_payload,
        message="Đăng nhập thành công",
    )


@router.get(
    "/me",
    response_model=ApiResponse[UserResponseSchema],
    summary="Lấy thông tin người dùng hiện tại",
)
def get_me(
    current_user: User = Depends(get_current_active_user),
):
    """Trả về thông tin chi tiết của người dùng đang đăng nhập."""
    return success_response(
        data=UserResponseSchema.model_validate(current_user),
        message="Lấy thông tin người dùng thành công",
    )


@router.post(
    "/refresh",
    response_model=ApiResponse[TokenResponseSchema],
    summary="Làm mới Access Token",
)
def refresh_token(
    data: RefreshTokenSchema,
    db: Session = Depends(get_db),
):
    """Cấp Access Token và Refresh Token mới từ Refresh Token cũ hợp lệ."""
    token_payload = auth_service.refresh_tokens(db=db, refresh_token=data.refresh_token)
    return success_response(
        data=token_payload,
        message="Làm mới token thành công",
    )


@router.get(
    "/admin-only",
    response_model=ApiResponse[dict],
    summary="Endpoint thử nghiệm quyền Admin",
)
def admin_only_route(
    admin_user: User = Depends(require_admin),
):
    """Endpoint chỉ dành riêng cho tài khoản có vai trò ADMIN."""
    return success_response(
        data={"user_id": admin_user.id, "email": admin_user.email, "role": admin_user.role},
        message="Quyền truy cập Admin đã được xác thực thành công",
    )
