import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.models.user import User, UserRole
from app.schemas.admin_user import (
    AdminUserResponse,
    AdminUserRoleUpdate,
    AdminUserStatusUpdate,
    PaginatedUserResponse,
)

router = APIRouter(prefix="/admin/users", tags=["Admin User Management"])


@router.get("", response_model=PaginatedUserResponse)
def get_users_list(
    search: Optional[str] = Query(None, description="Tìm theo email, tên hoặc username"),
    role: Optional[str] = Query(None, description="Lọc theo role (USER, ADMIN)"),
    is_active: Optional[bool] = Query(None, description="Lọc theo trạng thái hoạt động"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin xem danh sách người dùng hệ thống (có tìm kiếm, lọc, phân trang)."""
    query = db.query(User)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.email.ilike(search_term),
                User.full_name.ilike(search_term),
                User.username.ilike(search_term),
            )
        )

    if role:
        query = query.filter(User.role == role.upper())

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    total = query.count()
    total_pages = math.ceil(total / limit) if total > 0 else 1

    users = (
        query.order_by(User.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return PaginatedUserResponse(
        items=[AdminUserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.get("/{user_id}", response_model=AdminUserResponse)
def get_user_detail(
    user_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Admin xem thông tin chi tiết của một người dùng."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại",
        )
    return AdminUserResponse.model_validate(user)


@router.put("/{user_id}/role", response_model=AdminUserResponse)
def update_user_role(
    user_id: int,
    payload: AdminUserRoleUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Admin cập nhật role của người dùng:
    - Không cho phép Admin tự hạ quyền chính mình.
    - Không cho phép hạ quyền nếu là Admin duy nhất trong hệ thống.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại",
        )

    new_role = payload.role.value

    # Bảo vệ: Không cho phép Admin tự hạ quyền chính mình
    if target_user.id == admin.id and new_role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn không thể tự hạ quyền quản trị (ADMIN) của chính mình",
        )

    # Bảo vệ: Không cho phép hạ quyền Admin cuối cùng trong hệ thống
    if target_user.role == UserRole.ADMIN.value and new_role != UserRole.ADMIN.value:
        admin_count = (
            db.query(User)
            .filter(User.role == UserRole.ADMIN.value, User.is_active == True)
            .count()
        )
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể hạ quyền Admin cuối cùng đang hoạt động trong hệ thống",
            )

    target_user.role = new_role
    db.commit()
    db.refresh(target_user)
    return AdminUserResponse.model_validate(target_user)


@router.put("/{user_id}/status", response_model=AdminUserResponse)
def update_user_status(
    user_id: int,
    payload: AdminUserStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """
    Admin khóa hoặc mở khóa tài khoản người dùng:
    - Không cho phép Admin tự khóa tài khoản của chính mình.
    - Không cho phép khóa Admin đang hoạt động cuối cùng.
    """
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Người dùng không tồn tại",
        )

    # Bảo vệ: Không cho phép Admin tự khóa tài khoản chính mình
    if target_user.id == admin.id and not payload.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn không thể tự khóa tài khoản của chính mình",
        )

    # Bảo vệ: Không cho phép khóa Admin hoạt động cuối cùng
    if target_user.role == UserRole.ADMIN.value and not payload.is_active:
        active_admins = (
            db.query(User)
            .filter(User.role == UserRole.ADMIN.value, User.is_active == True)
            .count()
        )
        if active_admins <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể khóa Admin đang hoạt động cuối cùng trong hệ thống",
            )

    target_user.is_active = payload.is_active
    db.commit()
    db.refresh(target_user)
    return AdminUserResponse.model_validate(target_user)
