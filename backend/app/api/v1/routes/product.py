from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.deps import get_db
from app.schemas import product as product_schema
from app.crud import product as crud_product

router = APIRouter()


@router.get("/test")
def product_test():
    return {"message": "Product endpoint OK"}


@router.post("/", response_model=product_schema.Product)
def create_product(product: product_schema.ProductCreate, db: Session = Depends(get_db)):
    # check uniqueness by part number
    existing = crud_product.get_by_part_number(db, product.partNumber)
    if existing:
        raise HTTPException(status_code=400, detail="Product with this partNumber already exists")
    return crud_product.create_product(db, product)


@router.get("/{product_id}", response_model=product_schema.Product)
def read_product(product_id: int, db: Session = Depends(get_db)):
    db_product = crud_product.get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


@router.get("/", response_model=List[product_schema.Product])
def list_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_product.get_products(db, skip=skip, limit=limit)


@router.get("/by-part/{part_number}", response_model=product_schema.Product)
def get_by_part(part_number: str, db: Session = Depends(get_db)):
    db_product = crud_product.get_by_part_number(db, part_number)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


@router.put("/{product_id}", response_model=product_schema.Product)
def update_product(product_id: int, product: product_schema.ProductCreate, db: Session = Depends(get_db)):
    updated = crud_product.ProductRepository(db).update(product_id, product)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    success = crud_product.ProductRepository(db).delete(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"detail": "Product deleted"}
