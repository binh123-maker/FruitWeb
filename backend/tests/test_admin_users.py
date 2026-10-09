import pytest
from app.models.user import User, UserRole


@pytest.fixture
def test_users(db_session):
    u1 = User(
        email="user_a@fruitweb.com",
        full_name="User A",
        role=UserRole.USER.value,
        password_hash="secret_hash_a",
        is_active=True,
    )
    u2 = User(
        email="user_b@fruitweb.com",
        full_name="User B",
        role=UserRole.USER.value,
        password_hash="secret_hash_b",
        is_active=False,
    )
    db_session.add_all([u1, u2])
    db_session.commit()
    db_session.refresh(u1)
    db_session.refresh(u2)
    return u1, u2


def test_admin_get_users_list(client, admin_headers, test_users):
    res = client.get("/api/admin/users", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 3  # admin + 2 test users
    assert len(data["items"]) >= 3

    # Ensure password_hash is NEVER exposed in response
    for item in data["items"]:
        assert "password_hash" not in item
        assert "password" not in item


def test_user_cannot_access_admin_users(client, user_headers):
    res = client.get("/api/admin/users", headers=user_headers)
    assert res.status_code == 403


def test_admin_get_user_detail(client, admin_headers, test_users):
    u1, _ = test_users
    res = client.get(f"/api/admin/users/{u1.id}", headers=admin_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == "user_a@fruitweb.com"
    assert "password_hash" not in data


def test_admin_promote_user_to_admin(client, admin_headers, test_users):
    u1, _ = test_users
    res = client.put(f"/api/admin/users/{u1.id}/role", json={"role": "ADMIN"}, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["role"] == "ADMIN"


def test_admin_cannot_demote_themselves(client, admin_headers, db_session):
    # Retrieve current admin id from email
    admin = db_session.query(User).filter(User.email == "admin_test@fruitweb.com").first()
    res = client.put(f"/api/admin/users/{admin.id}/role", json={"role": "USER"}, headers=admin_headers)
    assert res.status_code == 400
    assert "tự hạ quyền" in res.json()["message"] or "tự hạ quyền" in str(res.json())


def test_admin_toggle_user_status(client, admin_headers, test_users):
    u1, _ = test_users
    # Lock user
    res = client.put(f"/api/admin/users/{u1.id}/status", json={"is_active": False}, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["is_active"] is False

    # Unlock user
    res = client.put(f"/api/admin/users/{u1.id}/status", json={"is_active": True}, headers=admin_headers)
    assert res.status_code == 200
    assert res.json()["is_active"] is True


def test_admin_cannot_lock_themselves(client, admin_headers, db_session):
    admin = db_session.query(User).filter(User.email == "admin_test@fruitweb.com").first()
    res = client.put(f"/api/admin/users/{admin.id}/status", json={"is_active": False}, headers=admin_headers)
    assert res.status_code == 400
    assert "tự khóa" in res.json()["message"] or "tự khóa" in str(res.json())
