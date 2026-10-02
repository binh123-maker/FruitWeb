import math
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.models.category import Category
from app.models.product import Product
from app.routers.categories import slugify
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    PaginatedProductResponse,
)

router = APIRouter(prefix="/products", tags=["Products"])


def build_product_response(product: Product) -> ProductResponse:
    res = ProductResponse.model_validate(product)
    if product.category:
        res.category_name = product.category.name
        res.category_slug = product.category.slug
    return res


@router.get("", response_model=PaginatedProductResponse)
def get_products(
    search: Optional[str] = Query(None, description="Search by name or description"),
    category: Optional[str] = Query(None, description="Category ID or Category Slug"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    sort: Optional[str] = Query(None, description="Sorting option: price_asc, price_desc, rating, newest, bestseller, sold_count"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(12, ge=1, le=100, description="Items per page"),
    is_featured: Optional[bool] = Query(None),
    is_best_seller: Optional[bool] = Query(None),
    is_active: Optional[bool] = Query(True, description="Filter active products"),
    db: Session = Depends(get_db),
):
    """Get list of products with search, filtering, sorting, and pagination (Public)."""
    query = db.query(Product)

    # Filter active status
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)

    # Search filter
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
            )
        )

    # Category filter (ID or Slug)
    if category:
        cat_param = category.strip()
        if cat_param.isdigit():
            query = query.filter(Product.category_id == int(cat_param))
        else:
            cat_obj = db.query(Category).filter(Category.slug == cat_param).first()
            if cat_obj:
                query = query.filter(Product.category_id == cat_obj.id)
            else:
                # Category slug not found -> return empty items
                return PaginatedProductResponse(
                    items=[],
                    page=page,
                    limit=limit,
                    total=0,
                    total_pages=0,
                )

    # Price range filter
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    # Boolean flag filters
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    if is_best_seller is not None:
        query = query.filter(Product.is_best_seller == is_best_seller)

    # Total matching items
    total = query.count()

    # Sorting
    if sort == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort == "price_desc":
        query = query.order_by(desc(Product.price))
    elif sort == "rating":
        query = query.order_by(desc(Product.rating))
    elif sort == "newest":
        query = query.order_by(desc(Product.created_at))
    elif sort in ["bestseller", "sold_count"]:
        query = query.order_by(desc(Product.sold_count))
    elif sort == "name_asc":
        query = query.order_by(asc(Product.name))
    elif sort == "name_desc":
        query = query.order_by(desc(Product.name))
    else:
        query = query.order_by(desc(Product.id))

    # Pagination calculation
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()
    total_pages = math.ceil(total / limit) if total > 0 else 0

    items = [build_product_response(p) for p in products]

    return PaginatedProductResponse(
        items=items,
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
    )


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    """Get single product detail by ID (Public)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sản phẩm không tồn tại",
        )
    return build_product_response(product)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    """Create a new product (Admin Only)."""
    # Check category existence if category_id provided
    if payload.category_id is not None:
        cat = db.query(Category).filter(Category.id == payload.category_id).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Danh mục không tồn tại",
            )

    slug = payload.slug.strip() if payload.slug else slugify(payload.name)
    existing_slug = db.query(Product).filter(Product.slug == slug).first()
    if existing_slug:
        # Append unique timestamp suffix if slug exists
        slug = f"{slug}-{int(db.query(Product).count()) + 1}"

    product = Product(
        name=payload.name,
        slug=slug,
        description=payload.description,
        price=payload.price,
        sale_price=payload.sale_price,
        image=payload.image,
        category_id=payload.category_id,
        origin=payload.origin or "",
        unit=payload.unit or "kg",
        stock=payload.stock,
        rating=payload.rating,
        review_count=payload.review_count,
        sold_count=payload.sold_count,
        is_featured=payload.is_featured,
        is_best_seller=payload.is_best_seller,
        is_active=payload.is_active,
    )

    db.add(product)
    db.commit()
    db.refresh(product)
    return build_product_response(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    """Update product details (Admin Only)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sản phẩm không tồn tại",
        )

    if payload.category_id is not None:
        cat = db.query(Category).filter(Category.id == payload.category_id).first()
        if not cat:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Danh mục không tồn tại",
            )
        product.category_id = payload.category_id

    if payload.name is not None:
        product.name = payload.name
        if payload.slug is None:
            product.slug = slugify(payload.name)

    if payload.slug is not None:
        new_slug = payload.slug.strip()
        existing_slug = (
            db.query(Product)
            .filter(Product.slug == new_slug, Product.id != product_id)
            .first()
        )
        if existing_slug:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug sản phẩm đã tồn tại",
            )
        product.slug = new_slug

    if payload.description is not None:
        product.description = payload.description
    if payload.price is not None:
        product.price = payload.price
    if payload.sale_price is not None:
        product.sale_price = payload.sale_price
    if payload.image is not None:
        product.image = payload.image
    if payload.origin is not None:
        product.origin = payload.origin
    if payload.unit is not None:
        product.unit = payload.unit
    if payload.stock is not None:
        product.stock = payload.stock
    if payload.rating is not None:
        product.rating = payload.rating
    if payload.review_count is not None:
        product.review_count = payload.review_count
    if payload.sold_count is not None:
        product.sold_count = payload.sold_count
    if payload.is_featured is not None:
        product.is_featured = payload.is_featured
    if payload.is_best_seller is not None:
        product.is_best_seller = payload.is_best_seller
    if payload.is_active is not None:
        product.is_active = payload.is_active

    db.commit()
    db.refresh(product)
    return build_product_response(product)


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    """Delete product (Admin Only)."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sản phẩm không tồn tại",
        )

    db.delete(product)
    db.commit()
    return {"success": True, "message": "Xóa sản phẩm thành công"}
