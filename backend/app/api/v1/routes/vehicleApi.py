from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.crud.vehicleApi import VehicleApiRepository
from app.schemas.vehicleApi import VehicleApi, VehicleApiCreate
import requests
from app.core.config import settings
from app.utils.vehicle_parsers import parse_vehicle_xml
from pydantic import ValidationError
import logging
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)
import os

router = APIRouter()

# --- Configurações da API ---
BASE_URL = os.getenv('BASE_URL') or settings.BASE_URL
USERNAME_API = os.getenv('USERNAME_API') or settings.USERNAME
# ---


def get_vehicle_repo(db: Session = Depends(get_db)) -> VehicleApiRepository:
    """Dependency to provide a VehicleRepository instance."""
    return VehicleApiRepository(db)


def get_call_external_service(plate: str) -> Dict[str, Any]:
    """Call external API by plate, parse and normalize response into a dict.

    Returns a dict of normalized fields (without `plate`). On error returns dict with 'error'.
    """
    print("Fetching external API vehicle data for plate:", plate)
    if not plate or len(plate) < 3:
        return {"error": "Placa inválida ou vazia."}

    params = {
        "username": USERNAME_API,
        "RegistrationNumber": plate,
    }
    try:
        response = requests.get(BASE_URL, params=params, timeout=10)
        response.raise_for_status()
        xml_content = response.content.decode(errors="ignore")

        print("External API response XML:", xml_content)

        parsed = parse_vehicle_xml(xml_content)
        if not parsed:
            return {"error": "Resposta externa vazia ou formato inesperado."}
        return parsed
    except requests.exceptions.RequestException as e:
        return {"error": f"Erro de rede/HTTP: {e}"}
    except Exception as e:
        return {"error": f"Erro de processamento: {e}"}


def get_vehicle_details(plate: str, repo: VehicleApiRepository = Depends(get_vehicle_repo)):
    """Return vehicle from DB by plate or None (helper, not endpoint)."""
    return repo.get_by_plate(plate=plate)


@router.get("/{plate}", response_model=VehicleApi)
def get_vehicle_by_plate(
    plate: str,
    repo: VehicleApiRepository = Depends(get_vehicle_repo),
):
    """
    Get vehicle by plate. If not found in DB, fetch from external API, save and return.
    """
    # 1) Try DB
    db_vehicle = repo.get_by_plate(plate=plate)
    if db_vehicle:
        return db_vehicle

    # 2) Fetch external service
    vehicle_data = get_call_external_service(plate)
    if "error" in vehicle_data:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=vehicle_data["error"])

    if not vehicle_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vehicle not found in external service")

    # 3) Map normalized data to schema fields expected by VehicleApiCreate
    payload = {
        "plate": plate,
        "abiCode": vehicle_data.get("abiCode") or vehicle_data.get("ABICode"),
        "description": vehicle_data.get("description"),
        "brand": vehicle_data.get("brand"),
        "model": vehicle_data.get("model"),
        "engineSize": vehicle_data.get("engineSize"),
        "fuelType": vehicle_data.get("fuelType"),
        "numberOfSeats": vehicle_data.get("numberOfSeats"),
        "version": vehicle_data.get("version"),
        "colour": vehicle_data.get("colour") or vehicle_data.get("color"),
        "vehicleIdentificationNumber": vehicle_data.get("vehicleIdentificationNumber") or vehicle_data.get("VechileIdentificationNumber"),
        "grossWeight": vehicle_data.get("grossWeight"),
        "netWeight": vehicle_data.get("netWeight"),
        "imported": vehicle_data.get("imported"),
        "RegistrationDate": vehicle_data.get("RegistrationDate"),
        "imageUrl": vehicle_data.get("imageUrl"),
        "kilometers": vehicle_data.get("kilometers"),
    }

    # Remove keys with None so Pydantic/SQLAlchemy handle defaults/nulls
    payload = {k: v for k, v in payload.items() if v is not None}

    # Log payload for debugging
    logger.debug("Normalized vehicle payload: %s", payload)
    print("Normalized vehicle payload:", payload)

    try:
        vehicle_in = VehicleApiCreate(**payload)
    except ValidationError as ve:
        # Log and return detailed validation errors
        logger.error("VehicleApiCreate validation error: %s", ve.json())
        print("VehicleApiCreate validation error:", ve.json())
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=ve.errors())
    except Exception as e:
        logger.exception("Unexpected error creating VehicleApiCreate: %s", e)
        print("Unexpected error creating VehicleApiCreate:", repr(e))
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))

    # 4) Save to DB
    new_vehicle = repo.create(vehicle=vehicle_in)
    return new_vehicle


@router.post("/", response_model=VehicleApi, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    vehicle_in: VehicleApiCreate,
    repo: VehicleApiRepository = Depends(get_vehicle_repo),
):
    """
    Create a new vehicle.
    """
    return repo.create(vehicle=vehicle_in)


@router.get("/", response_model=List[VehicleApi])
def list_vehicles(
    skip: int = 0,
    limit: int = 100,
    repo: VehicleApiRepository = Depends(get_vehicle_repo),
):
    """
    List all vehicles with pagination (skip/limit).
    """
    return repo.get_all(skip=skip, limit=limit)


