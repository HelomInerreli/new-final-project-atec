# Service Layer Implementation Guide

## Overview

This guide explains the newly implemented Service Layer architecture for the Mecatec API backend.

## What is a Service Layer?

The Service Layer is an architectural pattern that separates business logic from HTTP request handling (controllers/routes). It sits between the API routes and the data access layer (CRUD/Repository).

### Architecture Flow

```
Client Request
    ↓
API Route (FastAPI endpoint)
    ↓
Service Layer (Business Logic) ← YOU ARE HERE
    ↓
Repository/CRUD (Data Access)
    ↓
Database Models
    ↓
Database
```

## Benefits

1. **Separation of Concerns**: Business logic is isolated from HTTP concerns
2. **Reusability**: Services can be used by multiple routes, CLI commands, background jobs
3. **Testability**: Easy to unit test business logic without HTTP mocking
4. **Transaction Management**: Central place for transaction boundaries
5. **Framework Independence**: Core logic doesn't depend on FastAPI

## Project Structure

```
app/
├── services/
│   ├── base_service.py           # Base service with common functionality
│   ├── customer_service.py       # Customer business logic ✅
│   ├── appointment_service.py    # Appointment business logic ✅
│   └── notification_service.py   # Existing notification service
│
├── exceptions/
│   ├── __init__.py
│   ├── base.py                   # Base domain exceptions ✅
│   ├── customer.py               # Customer-specific exceptions ✅
│   └── appointment.py            # Appointment-specific exceptions ✅
│
├── crud/                         # Data access layer (repositories)
│   ├── customer.py
│   └── appoitment.py
│
└── api/v1/routes/                # HTTP endpoints (thin controllers)
    ├── customer.py               # Refactored to use CustomerService ✅
    └── appointment.py            # Can be refactored to use AppointmentService
```

## Implementation Examples

### 1. CustomerService (Complete Implementation)

**Before (Route with business logic):**

```python
@router.post("/")
def create_customer(customer_in: CustomerCreate, repo: CustomerRepository, db: Session):
    # ❌ Business logic in route
    new_customer = repo.create(customer=customer_in)

    # ❌ Side effects in route
    try:
        customer_auth = db.query(CustomerAuth).filter(...).first()
        email = customer_auth.email if customer_auth else "N/A"
        NotificationService.notify_new_customer(db, customer.name, email)
    except Exception as e:
        print(f"Error: {e}")  # ❌ Poor error handling

    return new_customer
```

**After (Route with service):**

```python
@router.post("/")
def create_customer(customer_in: CustomerCreate, service: CustomerService):
    """
    Create a new customer.

    Raises:
        409 Conflict: If email already exists
        400 Bad Request: If validation fails
    """
    # ✅ Clean route - just delegates to service
    return service.create_customer(customer_in)
```

**Service implementation:**

```python
class CustomerService(BaseService[Customer]):
    def create_customer(self, customer_in: CustomerCreate) -> Customer:
        # ✅ Business rule: Check uniqueness
        existing_customer = self.repo.get_by_email(customer_in.email)
        if existing_customer:
            raise CustomerAlreadyExistsError(email=customer_in.email)

        # ✅ Create customer
        customer = self.repo.create(customer_in)

        # ✅ Side effect: Send notification
        try:
            self.notification_service.notify_new_customer(...)
        except Exception as e:
            logger.error(f"Failed to send notification: {e}", exc_info=True)

        return customer
```

### 2. Domain Exceptions (Framework-Agnostic)

**Before:**

```python
# ❌ HTTP exceptions in CRUD layer
from fastapi import HTTPException

def get_customer(customer_id: int):
    customer = db.query(Customer).filter(...).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
```

**After:**

```python
# ✅ Domain exceptions in service/CRUD
from app.exceptions import CustomerNotFoundError

def get_customer(customer_id: int):
    customer = db.query(Customer).filter(...).first()
    if not customer:
        raise CustomerNotFoundError(customer_id=customer_id)
```

**Global exception handler in main.py:**

```python
@app.exception_handler(CustomerNotFoundError)
async def not_found_handler(request: Request, exc: CustomerNotFoundError):
    return JSONResponse(
        status_code=404,
        content={"detail": exc.message, "code": exc.code}
    )
```

### 3. AppointmentService (Simplified Example)

```python
class AppointmentService(BaseService[Appointment]):
    def create_appointment(self, appointment_in: AppointmentCreate) -> Appointment:
        # Business rules
        self._validate_customer_exists(appointment_in.customer_id)
        self._validate_vehicle_belongs_to_customer(...)
        self._check_time_slot_conflict(...)

        # Create appointment
        appointment = self.repo.create(appointment_in)

        # Send confirmation email
        self._send_confirmation_email(appointment)

        return appointment

    def cancel_appointment(self, appointment_id: int) -> Appointment:
        appointment = self.get_appointment_by_id(appointment_id)

        # Business rule: Cannot cancel finalized appointments
        if appointment.status == "Finalized":
            raise AppointmentCannotBeCancelledError(...)

        return self.repo.cancel(appointment_id)
```

## Exception Hierarchy

```
DomainException (base)
├── NotFoundError
│   ├── CustomerNotFoundError
│   └── AppointmentNotFoundError
├── AlreadyExistsError
│   ├── CustomerAlreadyExistsError
│   └── AppointmentConflictError
├── ValidationError
│   ├── CustomerValidationError
│   └── AppointmentValidationError
├── BusinessRuleError
│   ├── CustomerHasActiveAppointmentsError
│   ├── AppointmentCannotBeCancelledError
│   └── AppointmentCannotBeUpdatedError
├── UnauthorizedError
└── ForbiddenError
```

## How to Use

### Creating a New Service

1. **Create service class** in `app/services/your_service.py`:

```python
from app.services.base_service import BaseService
from app.models.your_model import YourModel

class YourService(BaseService[YourModel]):
    def __init__(self, db: Session):
        super().__init__(db)
        self.repo = YourRepository(db)

    def create_item(self, data: YourCreate) -> YourModel:
        # Implement business logic
        pass
```

2. **Create domain exceptions** in `app/exceptions/your_exceptions.py`:

```python
from app.exceptions.base import NotFoundError

class YourItemNotFoundError(NotFoundError):
    def __init__(self, item_id: int):
        super().__init__(f"Item {item_id} not found", "ITEM_NOT_FOUND")
```

3. **Update routes** to use service:

```python
from app.services.your_service import YourService

def get_your_service(db: Session = Depends(get_db)) -> YourService:
    return YourService(db)

@router.post("/")
def create_item(data: YourCreate, service: YourService = Depends(get_your_service)):
    return service.create_item(data)
```

4. **Add exception handler** in `main.py`:

```python
@app.exception_handler(YourItemNotFoundError)
async def your_not_found_handler(request: Request, exc: YourItemNotFoundError):
    return JSONResponse(status_code=404, content={"detail": exc.message})
```

## Best Practices

### ✅ DO:

1. **Put business logic in services**

   - Validation rules
   - Business constraints
   - Complex calculations
   - Transaction boundaries

2. **Use domain exceptions**

   - Framework-agnostic
   - Descriptive error messages
   - Proper error codes

3. **Keep routes thin**

   - Just HTTP concerns
   - Request/response handling
   - Dependency injection

4. **Use eager loading in services**

   - Avoid N+1 queries
   - Use `joinedload` for relationships

5. **Log appropriately**
   - Log business events in services
   - Use proper log levels
   - Include context

### ❌ DON'T:

1. **Don't put business logic in routes**

   ```python
   # ❌ BAD
   @router.post("/")
   def create(data, db):
       if db.query(...).count() > 100:
           raise HTTPException(400, "Limit reached")
   ```

2. **Don't use HTTPException in services**

   ```python
   # ❌ BAD
   class MyService:
       def get(self, id):
           raise HTTPException(404)  # ❌ Coupled to FastAPI

   # ✅ GOOD
   class MyService:
       def get(self, id):
           raise ItemNotFoundError(id)  # ✅ Domain exception
   ```

3. **Don't access DB directly in routes**

   ```python
   # ❌ BAD
   @router.get("/")
   def list_items(db: Session):
       return db.query(Item).all()

   # ✅ GOOD
   @router.get("/")
   def list_items(service: ItemService):
       return service.list_items()
   ```

4. **Don't silently catch exceptions**

   ```python
   # ❌ BAD
   try:
       service.do_something()
   except Exception:
       pass  # Silent failure

   # ✅ GOOD
   try:
       service.do_something()
   except Exception as e:
       logger.error(f"Failed: {e}", exc_info=True)
       raise ServiceError("Operation failed")
   ```

## Testing Services

Services are easy to test because they're isolated from HTTP:

```python
def test_create_customer():
    # Arrange
    db = create_test_db()
    service = CustomerService(db)
    data = CustomerCreate(name="Test", email="test@test.com")

    # Act
    customer = service.create_customer(data)

    # Assert
    assert customer.id is not None
    assert customer.name == "Test"

def test_create_duplicate_customer_raises_error():
    db = create_test_db()
    service = CustomerService(db)
    data = CustomerCreate(name="Test", email="test@test.com")

    service.create_customer(data)

    # Should raise exception on duplicate
    with pytest.raises(CustomerAlreadyExistsError):
        service.create_customer(data)
```

## Migration Strategy

To migrate existing routes to use services:

1. **Create service class** with business logic
2. **Create domain exceptions** for error cases
3. **Add exception handlers** to main.py
4. **Refactor routes** to use service (one at a time)
5. **Test thoroughly** after each route migration
6. **Remove old CRUD imports** from routes

## Next Steps

### Immediate:

- ✅ CustomerService fully implemented
- ✅ AppointmentService example created
- ⏳ Migrate appointment routes to use AppointmentService
- ⏳ Create UserService
- ⏳ Create VehicleService

### Short-term:

- Add more comprehensive tests
- Document service methods with examples
- Create service layer for remaining entities

### Long-term:

- Consider adding DTOs (Data Transfer Objects) separate from schemas
- Implement event system for cross-service communication
- Add caching layer in services where appropriate

## References

- **CustomerService**: `app/services/customer_service.py`
- **AppointmentService**: `app/services/appointment_service.py`
- **Base Exceptions**: `app/exceptions/base.py`
- **Exception Handlers**: `app/main.py`
- **Refactored Routes**: `app/api/v1/routes/customer.py`

## Questions?

For questions or clarifications about the service layer implementation, refer to:

- The code examples in this guide
- The actual implementations in the codebase
- The SENIOR_CODE_REVIEW.md document
