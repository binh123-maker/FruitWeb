"""Seed FRESH10 and WELCOME50 promotional coupons

Revision ID: d94812fa5678
Revises: c83910ef1234
Create Date: 2026-10-09 22:15:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column


# revision identifiers, used by Alembic.
revision: str = 'd94812fa5678'
down_revision: Union[str, Sequence[str], None] = 'c83910ef1234'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


coupons_table = table(
    'coupons',
    column('code', sa.String),
    column('discount_type', sa.String),
    column('discount_value', sa.Numeric),
    column('min_order_amount', sa.Numeric),
    column('max_discount_amount', sa.Numeric),
    column('usage_limit', sa.Integer),
    column('usage_count', sa.Integer),
    column('is_active', sa.Boolean),
)


def upgrade() -> None:
    conn = op.get_bind()

    # Idempotent seed for FRESH10: 10% discount, min order 0đ
    res = conn.execute(
        sa.text("SELECT id FROM coupons WHERE code = 'FRESH10'")
    ).fetchone()
    if not res:
        conn.execute(
            coupons_table.insert().values(
                code='FRESH10',
                discount_type='percentage',
                discount_value=10.00,
                min_order_amount=0.00,
                max_discount_amount=None,
                usage_limit=None,
                usage_count=0,
                is_active=True,
            )
        )

    # Idempotent seed for WELCOME50: 50,000đ discount for orders >= 300,000đ
    res = conn.execute(
        sa.text("SELECT id FROM coupons WHERE code = 'WELCOME50'")
    ).fetchone()
    if not res:
        conn.execute(
            coupons_table.insert().values(
                code='WELCOME50',
                discount_type='fixed',
                discount_value=50000.00,
                min_order_amount=300000.00,
                max_discount_amount=None,
                usage_limit=None,
                usage_count=0,
                is_active=True,
            )
        )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text("DELETE FROM coupons WHERE code IN ('FRESH10', 'WELCOME50')")
    )
