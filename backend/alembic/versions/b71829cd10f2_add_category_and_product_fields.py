"""Add category and product fields

Revision ID: b71829cd10f2
Revises: a694480fded1
Create Date: 2026-10-02 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b71829cd10f2'
down_revision: Union[str, Sequence[str], None] = 'a694480fded1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Categories table columns
    op.add_column('categories', sa.Column('image', sa.String(length=500), nullable=True))
    op.add_column('categories', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))

    # Products table columns
    op.add_column('products', sa.Column('sale_price', sa.Numeric(precision=12, scale=2), nullable=True))
    op.add_column('products', sa.Column('image', sa.String(length=500), nullable=True))
    op.add_column('products', sa.Column('origin', sa.String(length=100), nullable=True, server_default=''))
    op.add_column('products', sa.Column('unit', sa.String(length=50), nullable=False, server_default='kg'))
    op.add_column('products', sa.Column('rating', sa.Float(), nullable=False, server_default='5.0'))
    op.add_column('products', sa.Column('review_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('products', sa.Column('sold_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('products', sa.Column('is_featured', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('products', sa.Column('is_best_seller', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('products', 'is_best_seller')
    op.drop_column('products', 'is_featured')
    op.drop_column('products', 'sold_count')
    op.drop_column('products', 'review_count')
    op.drop_column('products', 'rating')
    op.drop_column('products', 'unit')
    op.drop_column('products', 'origin')
    op.drop_column('products', 'image')
    op.drop_column('products', 'sale_price')

    op.drop_column('categories', 'is_active')
    op.drop_column('categories', 'image')
