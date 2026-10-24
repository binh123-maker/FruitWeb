"""Idempotent seed script for FruitWeb database.
Populates initial categories, products, and coupons from curated store data.
Guarantees:
- Safe to re-run multiple times (idempotent, checks existing records by normalized unique slug)
- Preserves existing database records, orders, and sequences
- Never deletes or overwrites existing records
Usage:
    python -m app.seed
"""
import sys
from app.core.database import SessionLocal
from app.models.coupon import Coupon
from app.models.category import Category
from app.models.product import Product

CATEGORIES_SEED_DATA = [
    {
        "name": "Trái cây Việt Nam",
        "slug": "trai-cay-viet-nam",
        "description": "Trái cây đặc sản tươi ngon từ các vùng miền Việt Nam",
        "image": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80",
        "is_active": True
    },
    {
        "name": "Trái cây nhập khẩu",
        "slug": "trai-cay-nhap-khau",
        "description": "Trái cây cao cấp nhập khẩu trực tiếp từ Mỹ, Úc, New Zealand, Hàn Quốc",
        "image": "https://images.unsplash.com/photo-1560155016-bd4879ae8f21?auto=format&fit=crop&w=600&q=80",
        "is_active": True
    },
    {
        "name": "Trái cây theo mùa",
        "slug": "trai-cay-theo-mua",
        "description": "Những loại trái cây đang vào mùa thu hoạch chín mọng ngọt lịm",
        "image": "https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=600&q=80",
        "is_active": True
    },
    {
        "name": "Combo trái cây",
        "slug": "combo-trai-cay",
        "description": "Giỏ quà và combo trái cây tổng hợp cao cấp cho gia đình & biếu tặng",
        "image": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80",
        "is_active": True
    },
    {
        "name": "Trái cây hữu cơ",
        "slug": "trai-cay-huu-co",
        "description": "Trái cây sạch chuẩn Organic VietGAP/GlobalGAP an toàn tuyệt đối",
        "image": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
        "is_active": True
    }
]

PRODUCTS_SEED_DATA = [
    {
        "name": "Táo Fuji Nhật Bản / Nam Phi",
        "slug": "tao-fuji",
        "category_slug": "trai-cay-nhap-khau",
        "description": "Táo Fuji giòn ngọt, mọng nước, vỏ đỏ hồng tự nhiên. Giàu vitamin C và chất xơ, hỗ trợ tim mạch và đẹp da.",
        "price": 95000.0,
        "sale_price": 79000.0,
        "image": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
        "origin": "Nam Phi",
        "unit": "kg",
        "stock": 50,
        "rating": 4.8,
        "review_count": 42,
        "sold_count": 156,
        "is_featured": True,
        "is_best_seller": True,
        "is_active": True
    },
    {
        "name": "Cam Vàng Úc mọng nước",
        "slug": "cam-uc",
        "category_slug": "trai-cay-nhap-khau",
        "description": "Cam vàng Úc tép mọng, vị ngọt thanh tự nhiên, không hạt. Thích hợp vắt nước hoặc ăn trực tiếp.",
        "price": 85000.0,
        "sale_price": 69000.0,
        "image": "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80",
        "origin": "Úc",
        "unit": "kg",
        "stock": 40,
        "rating": 4.7,
        "review_count": 38,
        "sold_count": 210,
        "is_featured": True,
        "is_best_seller": True,
        "is_active": True
    },
    {
        "name": "Dâu Tây Đà Lạt Giống Mỹ (Hộp 500g)",
        "slug": "dau-tay-da-lat",
        "category_slug": "trai-cay-viet-nam",
        "description": "Dâu tây tươi hái tận vườn Đà Lạt trong ngày. Trái to đỏ mọng, vị chua ngọt hài hòa chứa nhiều chống oxy hóa.",
        "price": 130000.0,
        "sale_price": 115000.0,
        "image": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80",
        "origin": "Đà Lạt",
        "unit": "hộp 500g",
        "stock": 25,
        "rating": 4.9,
        "review_count": 56,
        "sold_count": 340,
        "is_featured": True,
        "is_best_seller": True,
        "is_active": True
    },
    {
        "name": "Xoài Cát Hòa Lộc Tiền Giang",
        "slug": "xoai-cat-hoa-loc",
        "category_slug": "trai-cay-viet-nam",
        "description": "Xoài Cát Hòa Lộc loại 1. Thịt dày mịn không xơ, hạt nhỏ, mùi thơm lừng đậm đà chuẩn vị miền Tây.",
        "price": 110000.0,
        "sale_price": 89000.0,
        "image": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
        "origin": "Tiền Giang",
        "unit": "kg",
        "stock": 30,
        "rating": 4.9,
        "review_count": 88,
        "sold_count": 450,
        "is_featured": True,
        "is_best_seller": True,
        "is_active": True
    },
    {
        "name": "Nho Đỏ Không Hạt Mỹ",
        "slug": "nho-do-my",
        "category_slug": "trai-cay-nhap-khau",
        "description": "Nho đỏ không hạt nhập khẩu từ Mỹ. Quả cứng giòn, vị ngọt đậm thanh mát, giàu Resveratrol tốt cho tim.",
        "price": 220000.0,
        "sale_price": 185000.0,
        "image": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80",
        "origin": "Mỹ",
        "unit": "kg",
        "stock": 20,
        "rating": 4.8,
        "review_count": 29,
        "sold_count": 130,
        "is_featured": False,
        "is_best_seller": True,
        "is_active": True
    },
    {
        "name": "Nho Xanh Autumn Crisp Mỹ / Úc",
        "slug": "nho-xanh-my",
        "category_slug": "trai-cay-nhap-khau",
        "description": "Nho xanh Autumn Crisp siêu giòn tan, vị ngọt ngào lưu lại ở cổ họng, chùm to đẹp không đốm vết.",
        "price": 260000.0,
        "sale_price": 229000.0,
        "image": "https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80",
        "origin": "Mỹ",
        "unit": "kg",
        "stock": 15,
        "rating": 5.0,
        "review_count": 64,
        "sold_count": 290,
        "is_featured": True,
        "is_best_seller": True,
        "is_active": True
    },
    {
        "name": "Chuối Cavendish Nam Mỹ Organic",
        "slug": "chuoi-cavendish",
        "category_slug": "trai-cay-huu-co",
        "description": "Chuối già Nam Mỹ dẻo thơm, ngọt tự nhiên, cung cấp năng lượng dồi dào cho người tập luyện và gia đình.",
        "price": 35000.0,
        "sale_price": 29000.0,
        "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
        "origin": "Đồng Nai",
        "unit": "nải (~1.5kg)",
        "stock": 60,
        "rating": 4.6,
        "review_count": 19,
        "sold_count": 180,
        "is_featured": False,
        "is_best_seller": False,
        "is_active": True
    },
    {
        "name": "Bơ 034 Lâm Đồng Hạt Lép",
        "slug": "bo-034",
        "category_slug": "trai-cay-viet-nam",
        "description": "Bơ 034 Lâm Đồng trứ danh, dẻo quánh ngậy béo, hạt cực lép. Chuẩn sạch VietGAP.",
        "price": 75000.0,
        "sale_price": 59000.0,
        "image": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80",
        "origin": "Lâm Đồng",
        "unit": "kg",
        "stock": 35,
        "rating": 4.8,
        "review_count": 45,
        "sold_count": 310,
        "is_featured": True,
        "is_best_seller": False,
        "is_active": True
    },
    {
        "name": "Thanh Long Ruột Đỏ Bình Thuận",
        "slug": "thanh-long-ruot-do",
        "category_slug": "trai-cay-viet-nam",
        "description": "Thanh long ruột đỏ ngọt mát, hàm lượng Anthocyanin cao hỗ trợ chống lão hóa tuyệt vời.",
        "price": 45000.0,
        "sale_price": 38000.0,
        "image": "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?auto=format&fit=crop&w=800&q=80",
        "origin": "Bình Thuận",
        "unit": "kg",
        "stock": 45,
        "rating": 4.5,
        "review_count": 22,
        "sold_count": 140,
        "is_featured": False,
        "is_best_seller": False,
        "is_active": True
    },
    {
        "name": "Dưa Hấu Không Hạt Mặt Trời Red",
        "slug": "dua-hau-khong-hat",
        "category_slug": "trai-cay-theo-mua",
        "description": "Dưa hấu vỏ mỏng ruột đỏ tươi, không hạt, mọng nước giải nhiệt cực tốt trong những ngày nắng nóng.",
        "price": 32000.0,
        "sale_price": 25000.0,
        "image": "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=800&q=80",
        "origin": "Long An",
        "unit": "kg",
        "stock": 50,
        "rating": 4.7,
        "review_count": 33,
        "sold_count": 270,
        "is_featured": False,
        "is_best_seller": False,
        "is_active": True
    },
    {
        "name": "Kiwi Xanh New Zealand Zespri",
        "slug": "kiwi-new-zealand",
        "category_slug": "trai-cay-nhap-khau",
        "description": "Kiwi xanh nhập khẩu Zespri giàu Vitamin C gấp 3 lần cam. Vị chua thanh cuốn hút.",
        "price": 150000.0,
        "sale_price": 129000.0,
        "image": "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=800&q=80",
        "origin": "New Zealand",
        "unit": "kg",
        "stock": 25,
        "rating": 4.8,
        "review_count": 31,
        "sold_count": 190,
        "is_featured": True,
        "is_best_seller": False,
        "is_active": True
    },
    {
        "name": "Lê Nâu Hàn Quốc (Giòn Ngọt mọng nước)",
        "slug": "le-han-quoc",
        "category_slug": "trai-cay-nhap-khau",
        "description": "Lê nâu Hàn Quốc trái tròn to, vỏ mỏng thịt trắng giòn tan mọng nước. Tốt cho phổi và thanh nhiệt.",
        "price": 120000.0,
        "sale_price": 99000.0,
        "image": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
        "origin": "Hàn Quốc",
        "unit": "kg",
        "stock": 30,
        "rating": 4.9,
        "review_count": 52,
        "sold_count": 220,
        "is_featured": False,
        "is_best_seller": True,
        "is_active": True
    },
    {
        "name": "Cherry Đỏ Washington Mỹ Size 28-30",
        "slug": "cherry-my",
        "category_slug": "trai-cay-nhap-khau",
        "description": "Cherry đỏ Mỹ nhập khẩu đường hàng không cực kỳ tươi mới. Trái cứng ngắt, ngọt đậm ngậy cuốn họng.",
        "price": 490000.0,
        "sale_price": 420000.0,
        "image": "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80",
        "origin": "Mỹ",
        "unit": "kg",
        "stock": 12,
        "rating": 5.0,
        "review_count": 75,
        "sold_count": 380,
        "is_featured": True,
        "is_best_seller": True,
        "is_active": True
    },
    {
        "name": "Măng Cụt Bến Tre Ruột Nắng",
        "slug": "mang-cut",
        "category_slug": "trai-cay-theo-mua",
        "description": "Nữ hoàng trái cây măng Cụt Bến Tre vỏ mỏng, múi trắng ngần ngọt thanh dẻo mịn ngon mê lỡ.",
        "price": 140000.0,
        "sale_price": 119000.0,
        "image": "https://images.unsplash.com/photo-1519097000072-e44ffa116485?auto=format&fit=crop&w=800&q=80",
        "origin": "Bến Tre",
        "unit": "kg",
        "stock": 20,
        "rating": 4.9,
        "review_count": 41,
        "sold_count": 260,
        "is_featured": True,
        "is_best_seller": False,
        "is_active": True
    },
    {
        "name": "Sầu Riêng Ri6 Đắk Lắk Cơm Vàng Hạt Lép",
        "slug": "sau-rieng-ri6",
        "category_slug": "trai-cay-viet-nam",
        "description": "Vua trái cây Sầu Riêng Ri6 cơm dẻo quánh, vị ngọt béo béo nồng nàn thơm nức mũi.",
        "price": 180000.0,
        "sale_price": 159000.0,
        "image": "https://images.unsplash.com/photo-1519544442-93857b48665e?auto=format&fit=crop&w=800&q=80",
        "origin": "Đắk Lắk",
        "unit": "kg (nguyên trái)",
        "stock": 15,
        "rating": 4.9,
        "review_count": 94,
        "sold_count": 520,
        "is_featured": True,
        "is_best_seller": True,
        "is_active": True
    },
    {
        "name": "Ổi Nữ Hoàng Giòn Ngọt VietGAP",
        "slug": "oi-nu-hoang",
        "category_slug": "trai-cay-huu-co",
        "description": "Ổi Nữ Hoàng giòn rụm, ít hạt, giàu Vitamin C gấp 4 lần cam, cực an toàn tốt cho sức khỏe.",
        "price": 40000.0,
        "sale_price": 32000.0,
        "image": "https://upload.wikimedia.org/wikipedia/commons/8/88/Guava_pink_fruit.jpg",
        "origin": "Tiền Giang",
        "unit": "kg",
        "stock": 40,
        "rating": 4.6,
        "review_count": 17,
        "sold_count": 110,
        "is_featured": False,
        "is_best_seller": False,
        "is_active": True
    },
    {
        "name": "Dứa Mật Tiền Giang mọng mật",
        "slug": "dua-mat",
        "category_slug": "trai-cay-viet-nam",
        "description": "Dứa mật Tiền Giang mắt thưa, mật vàng ươm, chua ngọt đậm đà ép nước cực ngon.",
        "price": 35000.0,
        "sale_price": 28000.0,
        "image": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80",
        "origin": "Tiền Giang",
        "unit": "quả",
        "stock": 35,
        "rating": 4.7,
        "review_count": 24,
        "sold_count": 175,
        "is_featured": False,
        "is_best_seller": False,
        "is_active": True
    },
    {
        "name": "Cam Sành Vĩnh Long Ngọt Tự Nhiên",
        "slug": "cam-sanh",
        "category_slug": "trai-cay-viet-nam",
        "description": "Cam Sành mọng nước chuyên vắt nước uống tăng sức đề kháng tốt cho mọi lứa tuổi.",
        "price": 45000.0,
        "sale_price": 35000.0,
        "image": "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80",
        "origin": "Vĩnh Long",
        "unit": "kg",
        "stock": 50,
        "rating": 4.7,
        "review_count": 36,
        "sold_count": 280,
        "is_featured": False,
        "is_best_seller": False,
        "is_active": True
    },
    {
        "name": "Vải Thiều Lục Ngạn Bắc Giang (Vào mùa)",
        "slug": "vai-thieu",
        "category_slug": "trai-cay-theo-mua",
        "description": "Vải Thiều Lục Ngạn quả mẩy đỏ tươi, hạt bé tí teo, thịt mọng nước ngọt như đường lỏng.",
        "price": 85000.0,
        "sale_price": 69000.0,
        "image": "https://upload.wikimedia.org/wikipedia/commons/4/46/Litchi_chinensis_fruits.JPG",
        "origin": "Bắc Giang",
        "unit": "kg",
        "stock": 30,
        "rating": 4.9,
        "review_count": 68,
        "sold_count": 410,
        "is_featured": True,
        "is_best_seller": False,
        "is_active": True
    },
    {
        "name": "Bưởi Da Xanh Bến Tre Ruột Hồng",
        "slug": "buoi-da-xanh",
        "category_slug": "trai-cay-huu-co",
        "description": "Bưởi Da Xanh Bến Tre tép hồng mọng nước, tép giòn ngọt không đắng hèm, dễ bóc vỏ.",
        "price": 90000.0,
        "sale_price": 75000.0,
        "image": "https://images.unsplash.com/photo-1517355236730-cdedf90a2da3?auto=format&fit=crop&w=800&q=80",
        "origin": "Bến Tre",
        "unit": "quả (~1.4kg)",
        "stock": 25,
        "rating": 4.9,
        "review_count": 48,
        "sold_count": 300,
        "is_featured": False,
        "is_best_seller": True,
        "is_active": True
    },
    {
        "name": "Combo Giỏ Trái Cây Ngũ Phúc Biếu Tặng",
        "slug": "combo-ngu-phuc",
        "category_slug": "combo-trai-cay",
        "description": "Giỏ quà trái cây sang trọng kết hợp Nho Xanh Mỹ, Táo Fuji, Kiwi, Cam Úc, Lê Hàn Quốc thích hợp đi biếu, sinh nhật.",
        "price": 650000.0,
        "sale_price": 590000.0,
        "image": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
        "origin": "Nhập khẩu & Việt Nam",
        "unit": "giỏ",
        "stock": 10,
        "rating": 5.0,
        "review_count": 15,
        "sold_count": 95,
        "is_featured": True,
        "is_best_seller": False,
        "is_active": True
    },
    {
        "name": "Combo Trái Cây Sức Khỏe Cho Gia Đình",
        "slug": "combo-suc-khoe",
        "category_slug": "combo-trai-cay",
        "description": "Set trái cây tươi giàu Vitamin C tổng hợp gồm Cam Vàng, Táo, Chuối Organic, Dưa Hấu.",
        "price": 320000.0,
        "sale_price": 280000.0,
        "image": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80",
        "origin": "Tổng hợp",
        "unit": "hộp combo 5kg",
        "stock": 15,
        "rating": 4.8,
        "review_count": 22,
        "sold_count": 120,
        "is_featured": False,
        "is_best_seller": False,
        "is_active": True
    }
]


def seed_coupons(db):
    coupons_data = [
        {
            "code": "FRESH10",
            "discount_type": "percentage",
            "discount_value": 10.0,
            "min_order_amount": 0.0,
            "max_discount_amount": None,
            "usage_limit": None,
            "is_active": True,
        },
        {
            "code": "WELCOME50",
            "discount_type": "fixed",
            "discount_value": 50000.0,
            "min_order_amount": 300000.0,
            "max_discount_amount": None,
            "usage_limit": None,
            "is_active": True,
        },
    ]

    added = 0
    skipped = 0
    for data in coupons_data:
        existing = db.query(Coupon).filter(Coupon.code == data["code"]).first()
        if not existing:
            coupon = Coupon(**data)
            db.add(coupon)
            added += 1
            print(f"  [+] Added coupon: {data['code']}")
        else:
            skipped += 1
            print(f"  [-] Coupon {data['code']} already exists. Preserved.")

    db.commit()
    return added, skipped


def seed_categories(db):
    added = 0
    skipped = 0
    for data in CATEGORIES_SEED_DATA:
        slug = data["slug"].strip().lower()
        name = data["name"].strip()
        existing = db.query(Category).filter(
            (Category.slug == slug) | (Category.name == name)
        ).first()

        if not existing:
            cat = Category(
                name=name,
                slug=slug,
                description=data.get("description"),
                image=data.get("image"),
                is_active=data.get("is_active", True),
            )
            db.add(cat)
            added += 1
            print(f"  [+] Added category: {name} ({slug})")
        else:
            skipped += 1
            print(f"  [-] Category already exists: {existing.name} (ID: {existing.id}, slug: {existing.slug}). Preserved.")

    db.commit()
    return added, skipped


def seed_products(db):
    # Pre-fetch all categories for fast foreign key resolution
    categories = db.query(Category).all()
    cat_by_slug = {c.slug.lower(): c.id for c in categories}

    added = 0
    skipped = 0
    failed = 0

    for data in PRODUCTS_SEED_DATA:
        slug = data["slug"].strip().lower()
        name = data["name"].strip()

        # Check existing product by unique slug
        existing = db.query(Product).filter(Product.slug == slug).first()
        if existing:
            skipped += 1
            print(f"  [-] Product already exists: {existing.name} (ID: {existing.id}, slug: {slug}). Preserved.")
            continue

        cat_slug = data.get("category_slug", "").strip().lower()
        cat_id = cat_by_slug.get(cat_slug)
        if not cat_id:
            failed += 1
            print(f"  [!] Warning: Category slug '{cat_slug}' not found for product '{name}'. Skipped.")
            continue

        prod = Product(
            name=name,
            slug=slug,
            category_id=cat_id,
            description=data.get("description"),
            price=data["price"],
            sale_price=data.get("sale_price"),
            image=data.get("image"),
            origin=data.get("origin", "Việt Nam"),
            unit=data.get("unit", "kg"),
            stock=data.get("stock", 0),
            rating=data.get("rating", 5.0),
            review_count=data.get("review_count", 0),
            sold_count=data.get("sold_count", 0),
            is_featured=data.get("is_featured", False),
            is_best_seller=data.get("is_best_seller", False),
            is_active=data.get("is_active", True),
        )
        db.add(prod)
        added += 1
        print(f"  [+] Added product: {name} (slug: {slug}, cat_id: {cat_id})")

    db.commit()
    return added, skipped, failed


def main():
    print("==================================================")
    print("Starting Idempotent Seed Process for FruitWeb DB")
    print("==================================================")
    db = SessionLocal()
    try:
        print("\n1. Seeding Coupons...")
        c_add, c_skip = seed_coupons(db)

        print("\n2. Seeding Categories...")
        cat_add, cat_skip = seed_categories(db)

        print("\n3. Seeding Products...")
        p_add, p_skip, p_fail = seed_products(db)

        print("\n==================================================")
        print("Seed Process Completed Successfully!")
        print(f"  - Coupons:    {c_add} added, {c_skip} preserved/skipped")
        print(f"  - Categories: {cat_add} added, {cat_skip} preserved/skipped")
        print(f"  - Products:   {p_add} added, {p_skip} preserved/skipped, {p_fail} failed")
        print("==================================================")
    except Exception as e:
        db.rollback()
        print(f"\n[!] ERROR during seed execution: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
