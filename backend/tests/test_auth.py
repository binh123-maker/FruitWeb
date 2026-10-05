def test_register_user_success(client):
    payload = {
        "email": "user1@fruitweb.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "full_name": "FruitWeb Customer",
        "phone": "0987654321",
        "role": "USER",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]
    assert data["data"]["user"]["email"] == "user1@fruitweb.com"
    assert data["data"]["user"]["role"] == "USER"


def test_register_duplicate_email(client):
    payload = {
        "email": "user1@fruitweb.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "full_name": "FruitWeb Customer",
    }
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False
    assert "Email đã được đăng ký" in data["message"]


def test_register_password_mismatch(client):
    payload = {
        "email": "user2@fruitweb.com",
        "password": "Password123!",
        "confirm_password": "WrongPassword!",
        "full_name": "Test User",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422


def test_login_success(client):
    client.post(
        "/api/auth/register",
        json={
            "email": "user1@fruitweb.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "full_name": "FruitWeb Customer",
        },
    )
    payload = {
        "email": "user1@fruitweb.com",
        "password": "Password123!",
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]


def test_login_wrong_password(client):
    client.post(
        "/api/auth/register",
        json={
            "email": "user1@fruitweb.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "full_name": "FruitWeb Customer",
        },
    )
    payload = {
        "email": "user1@fruitweb.com",
        "password": "WrongPassword!",
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False


def test_get_me_success_and_unauthorized(client):
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": "user1@fruitweb.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "full_name": "FruitWeb Customer",
        },
    )
    access_token = reg_res.json()["data"]["access_token"]

    # Call /me without token
    no_auth_res = client.get("/api/auth/me")
    assert no_auth_res.status_code in [401, 403]

    # Call /me with valid Bearer token
    headers = {"Authorization": f"Bearer {access_token}"}
    auth_res = client.get("/api/auth/me", headers=headers)
    assert auth_res.status_code == 200
    assert auth_res.json()["data"]["email"] == "user1@fruitweb.com"


def test_refresh_token_flow(client):
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": "user1@fruitweb.com",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "full_name": "FruitWeb Customer",
        },
    )
    refresh_token = reg_res.json()["data"]["refresh_token"]

    # Call refresh endpoint
    refresh_res = client.post("/api/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_res.status_code == 200
    data = refresh_res.json()
    assert data["success"] is True
    assert "access_token" in data["data"]


def test_admin_authorization(client, db_session):
    from app.models.user import User, UserRole
    from app.core.security import create_access_token, hash_password

    # Setup Admin directly in database (safe seed/test fixture)
    admin_user = User(
        email="admin@fruitweb.com",
        password_hash=hash_password("AdminPassword123!"),
        full_name="FruitWeb Admin",
        role=UserRole.ADMIN.value,
        is_active=True,
    )
    db_session.add(admin_user)
    db_session.commit()
    db_session.refresh(admin_user)
    admin_token = create_access_token(subject=str(admin_user.id), role=admin_user.role)

    # Register Regular User through public register endpoint
    user_payload = {
        "email": "regular@fruitweb.com",
        "password": "UserPassword123!",
        "confirm_password": "UserPassword123!",
        "full_name": "FruitWeb Regular",
    }
    user_reg_res = client.post("/api/auth/register", json=user_payload)
    assert user_reg_res.status_code == 201
    assert user_reg_res.json()["data"]["user"]["role"] == "USER"
    user_token = user_reg_res.json()["data"]["access_token"]

    # Regular User tries to access admin-only endpoint -> 403 Forbidden
    forbidden_res = client.get(
        "/api/auth/admin-only",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert forbidden_res.status_code == 403

    # Admin User accesses admin-only endpoint -> 200 OK
    allowed_res = client.get(
        "/api/auth/admin-only",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert allowed_res.status_code == 200
    assert allowed_res.json()["data"]["role"] == "ADMIN"


def test_public_register_prevents_privilege_escalation(client):
    """Verify that an attacker attempting to register with role=ADMIN is strictly assigned role=USER."""
    attacker_payload = {
        "email": "attacker@fruitweb.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "full_name": "Attacker",
        "role": "ADMIN",
    }
    res = client.post("/api/auth/register", json=attacker_payload)
    assert res.status_code == 201
    data = res.json()["data"]
    # Role must strictly be USER, never ADMIN
    assert data["user"]["role"] == "USER"

    # Attacker's token must be rejected at admin endpoints
    attacker_token = data["access_token"]
    admin_check_res = client.get(
        "/api/auth/admin-only",
        headers={"Authorization": f"Bearer {attacker_token}"},
    )
    assert admin_check_res.status_code == 403


def test_public_register_defaults_to_user_role(client):
    """Verify that normal public registration always defaults to role=USER."""
    normal_payload = {
        "email": "normaluser@fruitweb.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "full_name": "Normal User",
    }
    res = client.post("/api/auth/register", json=normal_payload)
    assert res.status_code == 201
    data = res.json()["data"]
    assert data["user"]["role"] == "USER"
