def test_get_categories_empty(client):
    response = client.get("/api/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_category_admin_success(client, admin_headers):
    payload = {
        "name": "Trái cây Việt Nam",
        "description": "Trái cây mùa hè Việt Nam",
        "image": "https://example.com/vn.jpg",
        "is_active": True,
    }
    response = client.post("/api/categories", json=payload, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Trái cây Việt Nam"
    assert data["slug"] == "trai-cay-viet-nam"
    assert data["id"] is not None


def test_create_category_duplicate_name(client, admin_headers):
    payload = {"name": "Trái cây Việt Nam"}
    client.post("/api/categories", json=payload, headers=admin_headers)

    response = client.post("/api/categories", json=payload, headers=admin_headers)
    assert response.status_code == 400
    assert "Tên danh mục đã tồn tại" in response.json()["message"]


def test_create_category_user_forbidden(client, user_headers):
    payload = {"name": "Trái cây Hữu Cơ"}
    response = client.post("/api/categories", json=payload, headers=user_headers)
    assert response.status_code == 403


def test_create_category_unauthorized(client):
    payload = {"name": "Trái cây Hữu Cơ"}
    response = client.post("/api/categories", json=payload)
    assert response.status_code in [401, 403]


def test_get_category_by_id(client, admin_headers):
    create_res = client.post("/api/categories", json={"name": "Trái cây Việt Nam"}, headers=admin_headers)
    cat_id = create_res.json()["id"]

    response = client.get(f"/api/categories/{cat_id}")
    assert response.status_code == 200
    assert response.json()["id"] == cat_id


def test_update_category_admin(client, admin_headers):
    create_res = client.post("/api/categories", json={"name": "Trái cây Việt Nam"}, headers=admin_headers)
    cat_id = create_res.json()["id"]

    update_payload = {"name": "Trái cây Việt Nam Cao Cấp"}
    response = client.put(f"/api/categories/{cat_id}", json=update_payload, headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Trái cây Việt Nam Cao Cấp"
    assert response.json()["slug"] == "trai-cay-viet-nam-cao-cap"


def test_delete_category_admin(client, admin_headers):
    create_res = client.post("/api/categories", json={"name": "Temp Cat"}, headers=admin_headers)
    cat_id = create_res.json()["id"]

    del_res = client.delete(f"/api/categories/{cat_id}", headers=admin_headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    get_res = client.get(f"/api/categories/{cat_id}")
    assert get_res.status_code == 404
