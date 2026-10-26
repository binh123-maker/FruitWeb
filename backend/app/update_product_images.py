"""Update all 23 active products with at least 2 distinct, accurate images in PostgreSQL.
"""
from app.core.database import SessionLocal
from app.models.product import Product

PRODUCT_IMAGES_MAP = {
    1: [
        "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=800&q=80",
    ],
    2: [
        "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&w=800&q=80",
    ],
    6: [
        "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=800&q=80",
    ],
    7: [
        "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=800&q=80",
    ],
    8: [
        "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1518635017480-d2718cf451a3?auto=format&fit=crop&w=800&q=80",
    ],
    9: [
        "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=800&q=80",
    ],
    10: [
        "https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1541344999736-83eca872f242?auto=format&fit=crop&w=800&q=80",
    ],
    11: [
        "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=800&q=80",
    ],
    12: [
        "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1601039641847-7857b994d704?auto=format&fit=crop&w=800&q=80",
    ],
    13: [
        "https://images.unsplash.com/photo-1527324688151-0e627063f2b1?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?auto=format&fit=crop&w=800&q=80",
    ],
    14: [
        "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&w=800&q=80",
    ],
    15: [
        "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1585059895524-72359e06133a?auto=format&fit=crop&w=800&q=80",
    ],
    16: [
        "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1601493700750-58796129ebb9?auto=format&fit=crop&w=800&q=80",
    ],
    17: [
        "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=800&q=80",
    ],
    18: [
        "https://images.unsplash.com/photo-1519097000072-e44ffa116485?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1628172905141-8f5539ff85cb?auto=format&fit=crop&w=800&q=80",
    ],
    19: [
        "https://images.unsplash.com/photo-1519544442-93857b48665e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=800&q=80",
    ],
    20: [
        "https://upload.wikimedia.org/wikipedia/commons/8/88/Guava_pink_fruit.jpg",
        "https://images.unsplash.com/photo-1536511135898-752b0d49281c?auto=format&fit=crop&w=800&q=80",
    ],
    21: [
        "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?auto=format&fit=crop&w=800&q=80",
    ],
    22: [
        "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=800&q=80",
    ],
    23: [
        "https://upload.wikimedia.org/wikipedia/commons/4/46/Litchi_chinensis_fruits.JPG",
        "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?auto=format&fit=crop&w=800&q=80",
    ],
    24: [
        "https://images.unsplash.com/photo-1517355236730-cdedf90a2da3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=800&q=80",
    ],
    25: [
        "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80",
    ],
    26: [
        "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
    ],
}


def run_update():
    db = SessionLocal()
    try:
        updated = 0
        for pid, img_list in PRODUCT_IMAGES_MAP.items():
            prod = db.query(Product).filter(Product.id == pid).first()
            if prod:
                prod.image = img_list[0]
                prod.images = img_list
                updated += 1
                print(f"  [+] Updated Product #{prod.id} '{prod.name}' with {len(img_list)} images.")
        db.commit()
        print(f"Successfully updated {updated} products.")
    finally:
        db.close()


if __name__ == "__main__":
    run_update()
