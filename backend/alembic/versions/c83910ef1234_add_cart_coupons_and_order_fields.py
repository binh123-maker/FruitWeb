"""Add cart, coupons, and order fields

Revision ID: c83910ef1234
Revises: b71829cd10f2
Create Date: 2026-10-09 16:45:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c83910ef1234'
down_revision: Union[str, Sequence[str], None] = 'b71829cd10f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create cart_items table
    op.create_table(
        'cart_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'product_id', name='uq_cart_user_product')
    )
    op.create_index(op.f('ix_cart_items_id'), 'cart_items', ['id'], unique=False)
    op.create_index(op.f('ix_cart_items_product_id'), 'cart_items', ['product_id'], unique=False)
    op.create_index(op.f('ix_cart_items_user_id'), 'cart_items', ['user_id'], unique=False)

    # 2. Create coupons table
    op.create_table(
        'coupons',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('discount_type', sa.String(length=20), nullable=False),
        sa.Column('discount_value', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('min_order_amount', sa.Numeric(precision=12, scale=2), nullable=False, server_default='0.00'),
        sa.Column('max_discount_amount', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('usage_limit', sa.Integer(), nullable=True),
        sa.Column('usage_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_coupons_code'), 'coupons', ['code'], unique=True)
    op.create_index(op.f('ix_coupons_id'), 'coupons', ['id'], unique=False)

    # 3. Add order fields
    op.add_column('orders', sa.Column('subtotal', sa.Numeric(precision=12, scale=2), nullable=True))
    op.add_column('orders', sa.Column('discount_amount', sa.Numeric(precision=12, scale=2), nullable=True, server_default='0.00'))
    op.add_column('orders', sa.Column('coupon_code', sa.String(length=50), nullable=True))
    op.add_column('orders', sa.Column('customer_name', sa.String(length=255), nullable=True))
    op.add_column('orders', sa.Column('phone', sa.String(length=20), nullable=True))
    op.add_column('orders', sa.Column('payment_method', sa.String(length=50), nullable=True, server_default='COD'))


def downgrade() -> None:
    # Drop order fields
    op.drop_column('orders', 'payment_method')
    op.drop_column('orders', 'phone')
    op.drop_column('orders', 'customer_name')
    op.drop_column('orders', 'coupon_code')
    op.drop_column('orders', 'discount_amount')
    op.drop_column('orders', 'subtotal')

    # Drop coupons table
    op.drop_index(op.f('ix_coupons_id'), table_name='coupons')
    op.drop_index(op.f('ix_coupons_code'), table_name='coupons')
    op.drop_table('coupons')

    # Drop cart_items table
    op.drop_index(op.f('ix_cart_items_user_id'), table_name='cart_items')
    op.drop_index(op.f('ix_cart_items_product_id'), table_name='cart_items')
    op.drop_index(op.f('ix_cart_items_id'), table_name='cart_items')
    op.drop_table('cart_items')
