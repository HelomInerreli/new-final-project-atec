import json
import xml.etree.ElementTree as ET
from typing import Dict, Any, Optional
from datetime import datetime


def _text(node: Optional[ET.Element]) -> Optional[str]:
    return node.text.strip() if node is not None and node.text else None


def _get_current_text(node: Optional[ET.Element]) -> Optional[str]:
    if node is None:
        return None
    cur = node.find('CurrentTextValue')
    return _text(cur) or _text(node)


def _find_child_by_localname(node: Optional[ET.Element], name: str) -> Optional[ET.Element]:
    """Find first child whose tag local-name equals `name`, ignoring namespace."""
    if node is None:
        return None
    for child in node:
        tag = child.tag
        if isinstance(tag, str) and tag.lower().endswith(name.lower()):
            return child
    return None


def parse_vehicle_xml(xml_text: str) -> Dict[str, Any]:
    """Parse the XML response from the external API and return a normalized dict.

    Note: does NOT set `plate`. Caller must provide plate before creating the DB record.
    """
    root = ET.fromstring(xml_text)
    data: Dict[str, Any] = {}

    # Try vehicleJson (it's a JSON string inside XML)
    json_node = None
    for elem in root.iter():
        tag = elem.tag
        if isinstance(tag, str) and tag.lower().endswith('vehiclejson') and elem.text:
            json_node = elem
            break
    if json_node is not None and json_node.text:
        try:
            j = json.loads(json_node.text)
        except Exception:
            j = None
        if isinstance(j, dict):
            data.update({
                "abiCode": j.get("ABICode") or j.get("abiCode"),
                "description": j.get("Description") or j.get("description"),
                "brand": (j.get("CarMake") or {}).get("CurrentTextValue") if isinstance(j.get("CarMake"), dict) else j.get("MakeDescription") or j.get("CarMake"),
                "model": (j.get("CarModel") or {}).get("CurrentTextValue") if isinstance(j.get("CarModel"), dict) else j.get("ModelDescription") or j.get("CarModel"),
                "engineSize": (j.get("EngineSize") or {}).get("CurrentTextValue") if isinstance(j.get("EngineSize"), dict) else j.get("EngineSize"),
                "fuelType": (j.get("FuelType") or {}).get("CurrentTextValue") if isinstance(j.get("FuelType"), dict) else j.get("FuelType"),
                "numberOfSeats": (j.get("NumberOfSeats") or {}).get("CurrentTextValue") if isinstance(j.get("NumberOfSeats"), dict) else j.get("NumberOfSeats"),
                "version": j.get("Version"),
                "colour": j.get("Colour"),
                "vehicleIdentificationNumber": j.get("VechileIdentificationNumber") or j.get("vehicleIdentificationNumber"),
                "grossWeight": j.get("GrossWeight"),
                "netWeight": j.get("NetWeight"),
                "imported": bool(int(j.get("Imported", 0))) if j.get("Imported") is not None and str(j.get("Imported")).isdigit() else (True if j.get("Imported") in (True, "True", "true", 1, "1") else False if j.get("Imported") in (False, "False", "false", 0, "0") else None),
                "RegistrationDate": j.get("RegistrationDate") or j.get("RegistrationYear"),
                "imageUrl": j.get("ImageUrl"),
                "kilometers": j.get("Kilometers") if j.get("Kilometers") is not None else None,
            })

    # Fallback/extra from vehicleData
    # Fallback/extra from vehicleData (handle namespaces by matching local-name)
    vdata = None
    for elem in root.iter():
        tag = elem.tag
        if isinstance(tag, str) and tag.lower().endswith('vehicledata'):
            vdata = elem
            break
    if vdata is not None:
        brand_node = _find_child_by_localname(vdata, 'CarMake')
        brand = _get_current_text(brand_node)
        if brand:
            data.setdefault("brand", brand)
        model_node = _find_child_by_localname(vdata, 'CarModel')
        model_val = _get_current_text(model_node) or _text(model_node)
        if model_val:
            data.setdefault("model", model_val)
        engine_node = _find_child_by_localname(vdata, 'EngineSize')
        engine_val = _get_current_text(engine_node)
        if engine_val:
            data.setdefault("engineSize", engine_val)
        fuel_node = _find_child_by_localname(vdata, 'FuelType')
        fuel_val = _get_current_text(fuel_node)
        if fuel_val:
            data.setdefault("fuelType", fuel_val)
        nos_node = _find_child_by_localname(vdata, 'NumberOfSeats')
        nos_val = _get_current_text(nos_node)
        if nos_val:
            data.setdefault("numberOfSeats", nos_val)
        desc = _find_child_by_localname(vdata, 'Description')
        if _text(desc):
            data.setdefault("description", _text(desc))

        regy = _find_child_by_localname(vdata, 'RegistrationYear')
        if _text(regy):
            data.setdefault("RegistrationDate", _text(regy))

    # Normalize numberOfSeats to string
    if "numberOfSeats" in data and data["numberOfSeats"] is not None:
        try:
            data["numberOfSeats"] = str(int(str(data["numberOfSeats"]).strip()))
        except Exception:
            pass

    # Normalize imported
    if "imported" in data and data["imported"] is not None:
        if isinstance(data["imported"], (int, float)):
            data["imported"] = bool(data["imported"]) 
        elif isinstance(data["imported"], str):
            if data["imported"].isdigit():
                data["imported"] = bool(int(data["imported"]))

    # Normalize RegistrationDate dd/mm/YYYY -> YYYY-MM-DD
    rd = data.get("RegistrationDate")
    if rd:
        try:
            parsed = datetime.strptime(rd.strip(), "%d/%m/%Y")
            data["RegistrationDate"] = parsed.date().isoformat()
        except Exception:
            # also try year-only
            try:
                parsed = datetime.strptime(rd.strip(), "%Y")
                data["RegistrationDate"] = parsed.date().isoformat()
            except Exception:
                pass

    # Remove DB-managed fields
    for k in ["created_at", "updated_at", "deleted_at"]:
        data.pop(k, None)

    return data
