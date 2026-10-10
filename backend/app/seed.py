"""Idempotent seed script for FruitWeb database.
Usage:
    python -m app.seed
"""
import sys
from app.core.database import SessionLocal
from app.models.coupon import Coupon


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
    for data in coupons_data:
        existing = db.query(Coupon).filter(Coupon.code == data["code"]).first()
        if not existing:
            coupon = Coupon(**data)
            db.add(coupon)
            added += 1
            print(f"Added coupon: {data['code']}")
        else:
            print(f"Coupon {data['code']} already exists. Skipping.")

    db.commit()
    return added


def main():
    print("Starting idempotent seed...")
    db = SessionLocal()
    try:
        added = seed_coupons(db)
        print(f"Seed completed successfully! ({added} coupons created)")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
