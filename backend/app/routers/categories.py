import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.dependencies.auth import require_admin
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)

router = APIRouter(prefix="/categories", tags=["Categories"])


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[àáạảãâầấậẩẫăằắặẳẵ]", "a", text)
    text = re.sub(r"[èéẹẻẽêềếệểễ]", "e", text)
    text = re.sub(r"[ìíịỉĩ]", "i", text)
    text = re.sub(r"[òóọỏõôồốộổỗơờớợởỡ]", "o", text)
    text = re.sub(r"[ùúụủũưừứựửữ]", "u", text)
    text = re.sub(r"[ỳýỵỷỹ]", "y", text)
    text = re.sub(r"[đ]", "d", text)
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text.strip("-")


@router.get("", response_model=List[CategoryResponse])
def get_categories(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """Get all categories with product count (Public)."""
    query = db.query(Category)
    if is_active is not None:
        query = query.filter(Category.is_active == is_active)

    categories = query.all()

    # Calculate product count per category
    result = []
    for cat in categories:
        p_count = (
            db.query(func.count(Product.id))
            .filter(Product.category_id == cat.id, Product.is_active == True)
            .scalar()
            or 0
        )
        cat_dict = CategoryResponse.model_validate(cat)
        cat_dict.product_count = p_count
        result.append(cat_dict)

    return result


@router.get("/{category_id}", response_model=CategoryResponse)
def get_category_by_id(category_id: int, db: Session = Depends(get_db)):
    """Get single category by ID (Public)."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Danh mục không tồn tại",
        )

    p_count = (
        db.query(func.count(Product.id))
        .filter(Product.category_id == cat.id, Product.is_active == True)
        .scalar()
        or 0
    )
    cat_res = CategoryResponse.model_validate(cat)
    cat_res.product_count = p_count
    return cat_res


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    """Create category (Admin Only)."""
    slug = payload.slug.strip() if payload.slug else slugify(payload.name)
    if not slug:
        slug = f"cat-{int(func.now().to_timestamp())}"

    # Check for existing name or slug
    existing_name = db.query(Category).filter(Category.name == payload.name).first()
    if existing_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tên danh mục đã tồn tại",
        )

    existing_slug = db.query(Category).filter(Category.slug == slug).first()
    if existing_slug:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug danh mục đã tồn tại",
        )

    category = Category(
        name=payload.name,
        slug=slug,
        description=payload.description,
        image=payload.image,
        is_active=payload.is_active,
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    res = CategoryResponse.model_validate(category)
    res.product_count = 0
    return res


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    """Update category (Admin Only)."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Danh mục không tồn tại",
        )

    if payload.name is not None:
        existing = (
            db.query(Category)
            .filter(Category.name == payload.name, Category.id != category_id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tên danh mục đã tồn tại",
            )
        cat.name = payload.name

    if payload.slug is not None or payload.name is not None:
        new_slug = payload.slug.strip() if payload.slug else slugify(cat.name)
        existing_slug = (
            db.query(Category)
            .filter(Category.slug == new_slug, Category.id != category_id)
            .first()
        )
        if existing_slug:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug danh mục đã tồn tại",
            )
        cat.slug = new_slug

    if payload.description is not None:
        cat.description = payload.description
    if payload.image is not None:
        cat.image = payload.image
    if payload.is_active is not None:
        cat.is_active = payload.is_active

    db.commit()
    db.refresh(cat)

    p_count = (
        db.query(func.count(Product.id))
        .filter(Product.category_id == cat.id, Product.is_active == True)
        .scalar()
        or 0
    )
    res = CategoryResponse.model_validate(cat)
    res.product_count = p_count
    return res


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    """Delete category (Admin Only)."""
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Danh mục không tồn tại",
        )

    db.delete(cat)
    db.commit()
    return {"success": True, "message": "Xóa danh mục thành công"}
