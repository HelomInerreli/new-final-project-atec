from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.deps import get_db
from app.schemas import product as product_schema
from app.crud import product as crud_product
from app.services.notification_service import NotificationService

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


# @router.get("/", response_model=List[product_schema.Product])
# def list_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
#     return crud_product.get_products(db, skip=skip, limit=limit)

@router.get("/", response_model=List[product_schema.Product])
def list_products(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return crud_product.get_products(db, skip=skip, limit=limit, search=search)


@router.get("/by-part/{part_number}", response_model=product_schema.Product)
def get_by_part(part_number: str, db: Session = Depends(get_db)):
    db_product = crud_product.get_by_part_number(db, part_number)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product


@router.put("/{product_id}", response_model=product_schema.Product)
def update_product(product_id: int, product: product_schema.ProductCreate, db: Session = Depends(get_db)):
    # Buscar produto antes da atualização para comparar
    old_product = crud_product.get_product(db, product_id)
    if not old_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    old_quantity = old_product.quantity
    
    # Atualizar produto
    updated = crud_product.ProductRepository(db).update(product_id, product)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Notificar sobre mudança de stock se a quantidade mudou
    if updated.quantity != old_quantity:
        try:
            NotificationService.notify_stock_updated(
                db=db,
                product_name=updated.name,
                old_quantity=old_quantity,
                new_quantity=updated.quantity
            )
        except Exception as e:
            print(f"Erro ao enviar notificação de atualização de stock: {e}")
    
    # Verificar se o estoque está abaixo do mínimo e enviar notificação adicional
    if updated.quantity <= updated.minimum_stock:
        try:
            NotificationService.notify_low_stock(
                db=db,
                product_name=updated.name,
                current_quantity=updated.quantity,
                min_quantity=updated.minimum_stock
            )
        except Exception as e:
            print(f"Erro ao enviar notificação de estoque baixo: {e}")
    
    return updated


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    success = crud_product.ProductRepository(db).delete(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"detail": "Product deleted"}
