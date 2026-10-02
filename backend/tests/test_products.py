def test_create_product_admin_success(client, admin_headers):
    cat_res = client.post("/api/categories", json={"name": "Trái cây nhập khẩu"}, headers=admin_headers)
    cat_id = cat_res.json()["id"]

    product_payload = {
        "name": "Táo Fuji Nhật Bản",
        "description": "Táo giòn ngọt mọng nước",
        "price": 95000,
        "sale_price": 79000,
        "image": "https://example.com/tao.jpg",
        "category_id": cat_id,
        "origin": "Nhật Bản",
        "unit": "kg",
        "stock": 50,
        "rating": 4.8,
        "review_count": 10,
        "sold_count": 100,
        "is_featured": True,
        "is_best_seller": True,
        "is_active": True,
    }

    response = client.post("/api/products", json=product_payload, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Táo Fuji Nhật Bản"
    assert data["slug"] == "tao-fuji-nhat-ban"
    assert data["price"] == 95000
    assert data["sale_price"] == 79000
    assert data["category_id"] == cat_id
    assert data["category_name"] == "Trái cây nhập khẩu"


def test_create_product_user_forbidden(client, user_headers):
    payload = {
        "name": "Cam Sành",
        "price": 50000,
    }
    response = client.post("/api/products", json=payload, headers=user_headers)
    assert response.status_code == 403


def test_get_products_pagination_format(client, admin_headers):
    client.post("/api/products", json={"name": "Sản phẩm 1", "price": 10000}, headers=admin_headers)

    response = client.get("/api/products?page=1&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "page" in data
    assert "limit" in data
    assert "total" in data
    assert "total_pages" in data
    assert data["page"] == 1
    assert data["limit"] == 10
    assert isinstance(data["items"], list)
    assert data["total"] >= 1


def test_get_products_filter_and_search(client, admin_headers):
    client.post(
        "/api/products",
        json={"name": "Dâu Tây Đà Lạt", "price": 150000, "origin": "Đà Lạt"},
        headers=admin_headers,
    )
    client.post(
        "/api/products",
        json={"name": "Xoài Cát Hòa Lộc", "price": 50000, "origin": "Tiền Giang"},
        headers=admin_headers,
    )

    # Search filter
    search_res = client.get("/api/products?search=Dâu")
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert search_data["total"] == 1
    assert search_data["items"][0]["name"] == "Dâu Tây Đà Lạt"

    # Min price filter
    price_res = client.get("/api/products?min_price=100000")
    assert price_res.status_code == 200
    price_data = price_res.json()
    assert all(item["price"] >= 100000 for item in price_data["items"])


def test_get_product_by_id(client, admin_headers):
    create_res = client.post("/api/products", json={"name": "Cam Úc", "price": 80000}, headers=admin_headers)
    prod_id = create_res.json()["id"]

    response = client.get(f"/api/products/{prod_id}")
    assert response.status_code == 200
    assert response.json()["id"] == prod_id


def test_update_product_admin(client, admin_headers):
    create_res = client.post("/api/products", json={"name": "Cam Úc", "price": 80000}, headers=admin_headers)
    prod_id = create_res.json()["id"]

    update_payload = {"price": 88000, "stock": 99}
    response = client.put(f"/api/products/{prod_id}", json=update_payload, headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["price"] == 88000
    assert response.json()["stock"] == 99


def test_delete_product_admin(client, admin_headers):
    create_res = client.post(
        "/api/products",
        json={"name": "Temp Product", "price": 10000},
        headers=admin_headers,
    )
    prod_id = create_res.json()["id"]

    del_res = client.delete(f"/api/products/{prod_id}", headers=admin_headers)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    get_res = client.get(f"/api/products/{prod_id}")
    assert get_res.status_code == 404
