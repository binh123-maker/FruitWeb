-- ====================================================================
-- FruitWeb Database Clean & Seed Script
-- ====================================================================

-- 1. Làm sạch dữ liệu cũ và reset sequence an toàn với CASCADE
TRUNCATE TABLE cart_items, order_items, orders, products, categories RESTART IDENTITY CASCADE;

-- 2. Chèn 6 danh mục chính
INSERT INTO categories (id, name, slug, description, image, is_active, created_at, updated_at) VALUES
(1, 'Trái cây theo mùa', 'trai-cay-theo-mua', 'Các loại trái cây tươi ngon theo từng mùa vụ', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80', true, NOW(), NOW()),
(2, 'Combo trái cây', 'combo-trai-cay', 'Hộp quà và gói trái cây phối hợp tiện lợi', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80', true, NOW(), NOW()),
(3, 'Trái cây hữu cơ', 'trai-cay-huu-co', 'Trái cây canh tác tự nhiên không hóa chất', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', true, NOW(), NOW()),
(4, 'Trái Cây Nhập Khẩu', 'trai-cay-nhap-khau', 'Trái cây nhập khẩu chính ngạch chuẩn quốc tế', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80', true, NOW(), NOW()),
(5, 'Trái Cây Việt Nam', 'trai-cay-viet-nam', 'Đặc sản trái cây nhiệt đới tươi sạch trong nước', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80', true, NOW(), NOW()),
(6, 'Nho', 'nho', 'Các dòng nho giòn ngọt cao cấp', 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80', true, NOW(), NOW());

-- Reset auto-increment sequence cho categories
SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE(MAX(id), 1), true) FROM categories;

-- 3. Chèn 6 sản phẩm mẫu với đầy đủ trường ảnh chính và thư viện ảnh JSON
INSERT INTO products (
    id, category_id, name, slug, description, price, sale_price, stock,
    image, images, origin, unit, rating, review_count, sold_count,
    is_featured, is_best_seller, is_active, created_at, updated_at
) VALUES
(1, 5, 'Xoài Cát Hòa Lộc', 'xoai-cat-hoa-loc', 'Xoài cát Hòa Lộc Tiền Giang loại 1 thơm ngọt đậm đà, thịt quả vàng mịn không xơ.', 95000, 85000, 50,
 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
 '["https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80"]'::json,
 'Việt Nam', 'kg', 4.9, 12, 45, true, true, true, NOW(), NOW()),

(2, 5, 'Cam Sành Tiền Giang', 'cam-sanh-tien-giang', 'Cam sành mọng nước, tép cam vàng tươi giàu vitamin C tự nhiên, vỏ xanh ruột vàng.', 50000, 45000, 100,
 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80',
 '["https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80"]'::json,
 'Việt Nam', 'kg', 4.8, 8, 30, true, false, true, NOW(), NOW()),

(3, 4, 'Táo Envy New Zealand', 'tao-envy-new-zealand', 'Táo Envy nhập khẩu trực tiếp size lớn, thịt giòn đanh, ngọt đậm thơm nức mũi.', 140000, 120000, 40,
 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
 '["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80"]'::json,
 'New Zealand', 'kg', 5.0, 25, 80, true, true, true, NOW(), NOW()),

(4, 6, 'Nho Mẫu Đơn Shine Muscat', 'nho-mau-don-shine-muscat', 'Nho mẫu đơn chuẩn vị thơm hương sữa cao cấp, quả to tròn mọng nước không hạt.', 280000, 250000, 30,
 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80',
 '["https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80"]'::json,
 'Hàn Quốc', 'chùm', 4.9, 19, 50, true, true, true, NOW(), NOW()),

(5, 3, 'Dưa Lưới Huỳnh Long', 'dua-luoi-huynh-long', 'Dưa lưới vỏ vàng ruột cam giòn ngọt mát, canh tác hữu cơ chuẩn VietGAP an toàn.', 80000, 70000, 60,
 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
 '["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80"]'::json,
 'Việt Nam', 'kg', 4.7, 10, 22, true, false, true, NOW(), NOW()),

(6, 2, 'Combo Trái Cây Thanh Nhiệt', 'combo-trai-cay-thanh-nhiet', 'Hộp quà phối hợp bưởi da xanh, cam sành mọng nước, táo Envy tươi mát sang trọng.', 230000, 199000, 25,
 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
 '["https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80"]'::json,
 'FreshFruit', 'hộp', 4.8, 15, 38, true, true, true, NOW(), NOW());

-- Reset auto-increment sequence cho products
SELECT setval(pg_get_serial_sequence('products', 'id'), COALESCE(MAX(id), 1), true) FROM products;
