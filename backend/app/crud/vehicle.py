from sqlalchemy.orm import Session
from app.models import vehicle as vehicle_model
from app.schemas import vehicle as vehicle_schema
from typing import List, Optional

# --- Funções de Leitura (Read) ---

def get_vehicle(db: Session, vehicle_id: int) -> Optional[vehicle_model.Vehicle]:
    """Obtém um único veículo pelo seu ID."""
    return db.query(vehicle_model.Vehicle).filter(vehicle_model.Vehicle.id == vehicle_id).first()

def get_vehicle_by_plate(db: Session, plate: str) -> Optional[vehicle_model.Vehicle]:
    """Obtém um veículo pela sua matrícula (placa)."""
    return db.query(vehicle_model.Vehicle).filter(vehicle_model.Vehicle.plate == plate).first()

def get_vehicles(db: Session, skip: int = 0, limit: int = 100) -> List[vehicle_model.Vehicle]:
    """Obtém uma lista de todos os veículos."""
    return db.query(vehicle_model.Vehicle).order_by(vehicle_model.Vehicle.id).offset(skip).limit(limit).all()

# --- Funções de Escrita (Create, Update, Delete) ---

def create_customer_vehicle(db: Session, vehicle: vehicle_schema.VehicleCreate) -> vehicle_model.Vehicle:
    """Cria um novo veículo associado a um cliente."""
    # Nota: Usando .model_dump() que é o padrão do Pydantic V2
    db_vehicle = vehicle_model.Vehicle(**vehicle.model_dump())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

def update_vehicle(db: Session, vehicle_id: int, vehicle_data: vehicle_schema.VehicleUpdate) -> Optional[vehicle_model.Vehicle]:
    """Atualiza os dados de um veículo."""
    db_vehicle = get_vehicle(db, vehicle_id)
    if db_vehicle:
        # Nota: Usando .model_dump()
        update_data = vehicle_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_vehicle, field, value)
        db.commit()
        db.refresh(db_vehicle)
    return db_vehicle

def delete_vehicle(db: Session, vehicle_id: int) -> bool:
    """Apaga um veículo da base de dados."""
    db_vehicle = get_vehicle(db, vehicle_id)
    if db_vehicle:
        db.delete(db_vehicle)
        db.commit()
        return True
    return False
