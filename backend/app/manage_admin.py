"""
FruitWeb - Safe Admin Management Utility
CLI helper to inspect admin accounts or bootstrap initial admin from environment variables safely.
Does NOT hardcode any credentials or passwords.
"""

import os
import sys
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole


def inspect_users_summary():
    """Print statistical summary of users by role without revealing credentials."""
    db = SessionLocal()
    try:
        total_users = db.query(User).count()
        admin_count = db.query(User).filter(User.role == UserRole.ADMIN.value).count()
        active_admin_count = (
            db.query(User)
            .filter(User.role == UserRole.ADMIN.value, User.is_active == True)
            .count()
        )
        regular_user_count = (
            db.query(User).filter(User.role == UserRole.USER.value).count()
        )

        print("=== User Role Statistics ===")
        print(f"Total Users:         {total_users}")
        print(f"Total Admins:        {admin_count} (Active: {active_admin_count})")
        print(f"Standard Users:      {regular_user_count}")
        print("============================")
        return admin_count, active_admin_count, regular_user_count
    finally:
        db.close()


def bootstrap_admin_if_needed():
    """
    Safely bootstrap an admin account ONLY IF no active admin currently exists.
    Reads credentials from FRUITWEB_ADMIN_EMAIL and FRUITWEB_ADMIN_PASSWORD.
    """
    db = SessionLocal()
    try:
        existing_admin = (
            db.query(User)
            .filter(User.role == UserRole.ADMIN.value, User.is_active == True)
            .first()
        )
        if existing_admin:
            print(
                f"[INFO] An active ADMIN account already exists (ID: {existing_admin.id}). No new admin needed."
            )
            return False

        email = os.getenv("FRUITWEB_ADMIN_EMAIL")
        password = os.getenv("FRUITWEB_ADMIN_PASSWORD")
        full_name = os.getenv("FRUITWEB_ADMIN_NAME", "System Administrator")

        if not email or not password:
            print(
                "[WARN] No active admin exists, but FRUITWEB_ADMIN_EMAIL or FRUITWEB_ADMIN_PASSWORD environment variables are not set."
            )
            print("To bootstrap an admin, set these environment variables.")
            return False

        if len(password) < 8:
            print(
                "[ERROR] FRUITWEB_ADMIN_PASSWORD must be at least 8 characters for security.",
                file=sys.stderr,
            )
            return False

        existing_user = db.query(User).filter(User.email == email.strip().lower()).first()
        if existing_user:
            existing_user.role = UserRole.ADMIN.value
            existing_user.is_active = True
            existing_user.password_hash = hash_password(password)
            db.commit()
            print(f"[SUCCESS] Upgraded existing user (ID: {existing_user.id}) to ADMIN.")
            return True

        admin_user = User(
            email=email.strip().lower(),
            password_hash=hash_password(password),
            full_name=full_name,
            role=UserRole.ADMIN.value,
            is_active=True,
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"[SUCCESS] Successfully created bootstrap ADMIN account (ID: {admin_user.id}).")
        return True
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to bootstrap admin: {e}", file=sys.stderr)
        return False
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "bootstrap":
        bootstrap_admin_if_needed()
    else:
        inspect_users_summary()
