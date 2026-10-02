from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core import security
from app.models.user import User, UserRole
from app.schemas.auth import UserRegisterSchema, UserLoginSchema


def register_user(db: Session, data: UserRegisterSchema) -> User:
    """Register a new user after verifying uniqueness and valid input."""
    # Check if email exists
    existing_user = db.query(User).filter(User.email == data.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã được đăng ký trên hệ thống",
        )

    # Hash password
    hashed_pwd = security.hash_password(data.password)

    # Create user
    user = User(
        email=data.email.lower(),
        password_hash=hashed_pwd,
        full_name=data.full_name,
        phone=data.phone,
        role=data.role if data.role in [UserRole.USER.value, UserRole.ADMIN.value] else UserRole.USER.value,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, data: UserLoginSchema) -> User:
    """Authenticate user with email and password."""
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email hoặc mật khẩu không chính xác",
        )

    if not security.verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email hoặc mật khẩu không chính xác",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tài khoản đã bị khóa",
        )

    return user


def generate_user_tokens(user: User) -> dict:
    """Generate access and refresh tokens for user."""
    access_token = security.create_access_token(subject=user.id, role=user.role)
    refresh_token = security.create_refresh_token(subject=user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
    }


def refresh_tokens(db: Session, refresh_token: str) -> dict:
    """Validate refresh token and issue new access token and refresh token."""
    try:
        payload = security.decode_token(refresh_token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không đúng loại refresh token",
        )

    user_id_str = payload.get("sub")
    if not user_id_str or not user_id_str.isdigit():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Payload token không hợp lệ",
        )

    user = db.query(User).filter(User.id == int(user_id_str)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản không tồn tại hoặc đã bị khóa",
        )

    return generate_user_tokens(user)
