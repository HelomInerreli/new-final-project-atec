from app.database import SessionLocal
from app.models.product import Product
from datetime import datetime


PRODUCTS = [
    {
        "part_number": "OL-5W30-1L",
        "name": "Óleo Motor 5W30 1L",
        "description": "Óleo sintético para motores a gasolina - 1L",
        "category": "Fluidos",
        "brand": "Castrol",
        "quantity": 100,
        "reserve_quantity": 10,
        "cost_value": 12.5,
        "sale_value": 24.9,
        "minimum_stock": 5,
    },
    {
        "part_number": "OL-10W40-1L",
        "name": "Óleo Motor 10W40 1L",
        "description": "Óleo mineral semissintético - 1L",
        "category": "Fluidos",
        "brand": "Shell",
        "quantity": 80,
        "reserve_quantity": 8,
        "cost_value": 8.0,
        "sale_value": 15.5,
        "minimum_stock": 5,
    },
    {
        "part_number": "FL-OL-001",
        "name": "Filtro de Óleo",
        "description": "Filtro de óleo compatível com vários modelos",
        "category": "Peças",
        "brand": "Mann Filter",
        "quantity": 60,
        "reserve_quantity": 5,
        "cost_value": 4.5,
        "sale_value": 9.9,
        "minimum_stock": 5,
    },
    {
        "part_number": "FL-AR-001",
        "name": "Filtro de Ar",
        "description": "Filtro de ar para motor",
        "category": "Peças",
        "brand": "Bosch",
        "quantity": 50,
        "reserve_quantity": 5,
        "cost_value": 6.5,
        "sale_value": 13.5,
        "minimum_stock": 3,
    },
    {
        "part_number": "PN-205-55-16",
        "name": "Pneu 205/55R16",
        "description": "Pneu radial 205/55 R16 - uso misto",
        "category": "Acessórios",
        "brand": "Continental",
        "quantity": 24,
        "reserve_quantity": 2,
        "cost_value": 45.0,
        "sale_value": 89.0,
        "minimum_stock": 4,
    },
    {
        "part_number": "LMP-H4",
        "name": "Lâmpada H4",
        "description": "Lâmpada halógena H4 60/55W",
        "category": "Peças",
        "brand": "Osram",
        "quantity": 120,
        "reserve_quantity": 10,
        "cost_value": 2.5,
        "sale_value": 5.5,
        "minimum_stock": 10,
    },
    {
        "part_number": "LIM-600MM",
        "name": "Limpador Parabrisa 600mm",
        "description": "Lâmina limpa-vidros 600mm",
        "category": "Acessórios",
        "brand": "Bosch",
        "quantity": 90,
        "reserve_quantity": 5,
        "cost_value": 3.5,
        "sale_value": 7.5,
        "minimum_stock": 6,
    },
    {
        "part_number": "AD-COOL-1L",
        "name": "Aditivo Radiador 1L",
        "description": "Aditivo para sistema de arrefecimento - 1 litro",
        "category": "Fluidos",
        "brand": "Prestone",
        "quantity": 40,
        "reserve_quantity": 4,
        "cost_value": 6.0,
        "sale_value": 12.0,
        "minimum_stock": 4,
    },
    {
        "part_number": "PT-FREIO-001",
        "name": "Pastilha de Freio Dianteira",
        "description": "Jogo de pastilhas de freio dianteiras",
        "category": "Peças",
        "brand": "Bosch",
        "quantity": 35,
        "reserve_quantity": 3,
        "cost_value": 15.0,
        "sale_value": 29.9,
        "minimum_stock": 5,
    },
    {
        "part_number": "VLA-PLG-001",
        "name": "Vela de Ignição",
        "description": "Vela de ignição padrão",
        "category": "Peças",
        "brand": "NGK",
        "quantity": 200,
        "reserve_quantity": 20,
        "cost_value": 2.0,
        "sale_value": 4.5,
        "minimum_stock": 20,
    },
]


def seed_products():
    db = SessionLocal()
    created = 0
    try:
        for pdata in PRODUCTS:
            existing = db.query(Product).filter(Product.part_number == pdata["part_number"]).first()
            if existing:
                print(f"Skipping existing product {pdata['part_number']}")
                continue
            p = Product(
                part_number=pdata["part_number"],
                name=pdata["name"],
                description=pdata.get("description"),
                category=pdata.get("category"),
                brand=pdata.get("brand"),
                quantity=pdata.get("quantity", 0),
                reserve_quantity=pdata.get("reserve_quantity"),
                cost_value=pdata.get("cost_value", 0.0),
                sale_value=pdata.get("sale_value", 0.0),
                minimum_stock=pdata.get("minimum_stock", 0),
                created_at=datetime.utcnow(),
            )
            db.add(p)
            created += 1
        db.commit()
        print(f"Seed complete. Created {created} products.")
    except Exception as e:
        db.rollback()
        print("Error seeding products:", e)
    finally:
        db.close()


if __name__ == "__main__":
    seed_products()
