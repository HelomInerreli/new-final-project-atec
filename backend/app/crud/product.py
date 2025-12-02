from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.models.product import Product
from app.schemas import product as product_schema


def create_product(db: Session, product: product_schema.ProductCreate) -> Product:
    data = product.dict()
    db_product = Product(
        part_number=data.get("partNumber"),
        name=data.get("name"),
        description=data.get("description"),
        category=data.get("category"),
        brand=data.get("brand"),
        quantity=data.get("quantity", 0),
        reserve_quantity=data.get("reserveQuantity"),
        cost_value=data.get("costValue"),
        sale_value=data.get("saleValue"),
        minimum_stock=data.get("minimumStock"),
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_product(db: Session, product_id: int) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id, Product.deleted_at.is_(None)).first()


# def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
#     return db.query(Product).filter(Product.deleted_at.is_(None)).order_by(Product.id).offset(skip).limit(limit).all()

def get_products(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> List[Product]:
    query = db.query(Product).filter(Product.deleted_at.is_(None))
    
    # Aplica filtro de pesquisa se fornecido
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_filter)) | 
            (Product.part_number.ilike(search_filter))
        )
    
    return query.order_by(Product.id).offset(skip).limit(limit).all()


def get_by_part_number(db: Session, part_number: str) -> Optional[Product]:
    return db.query(Product).filter(Product.part_number == part_number, Product.deleted_at.is_(None)).first()


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, product_id: int) -> Optional[Product]:
        return get_product(self.db, product_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Product]:
        return get_products(self.db, skip, limit)

    def create(self, product: product_schema.ProductCreate) -> Product:
        return create_product(self.db, product)

    def update(self, product_id: int, product_data: product_schema.ProductCreate) -> Optional[Product]:
        db_product = self.get_by_id(product_id)
        if db_product:
            update_data = product_data.dict()
            # map camelCase keys to snake_case model attrs
            field_map = {
                "partNumber": "part_number",
                "name": "name",
                "description": "description",
                "category": "category",
                "brand": "brand",
                "quantity": "quantity",
                "reserveQuantity": "reserve_quantity",
                "costValue": "cost_value",
                "saleValue": "sale_value",
                "minimumStock": "minimum_stock",
            }
            for key, value in update_data.items():
                attr = field_map.get(key, None)
                if attr is not None:
                    setattr(db_product, attr, value)
            db_product.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(db_product)
        return db_product

    def delete(self, product_id: int) -> bool:
        db_product = self.get_by_id(product_id)
        if db_product:
            db_product.deleted_at = datetime.utcnow()
            self.db.commit()
            return True
        return False
