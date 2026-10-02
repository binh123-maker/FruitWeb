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


def test_admin_authorization(client):
    admin_payload = {
        "email": "admin@fruitweb.com",
        "password": "AdminPassword123!",
        "confirm_password": "AdminPassword123!",
        "full_name": "FruitWeb Admin",
        "role": "ADMIN",
    }
    reg_res = client.post("/api/auth/register", json=admin_payload)
    admin_token = reg_res.json()["data"]["access_token"]

    user_payload = {
        "email": "regular@fruitweb.com",
        "password": "UserPassword123!",
        "confirm_password": "UserPassword123!",
        "full_name": "FruitWeb Regular",
        "role": "USER",
    }
    user_reg_res = client.post("/api/auth/register", json=user_payload)
    user_token = user_reg_res.json()["data"]["access_token"]

    forbidden_res = client.get(
        "/api/auth/admin-only",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert forbidden_res.status_code == 403

    allowed_res = client.get(
        "/api/auth/admin-only",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert allowed_res.status_code == 200
    assert allowed_res.json()["data"]["role"] == "ADMIN"
