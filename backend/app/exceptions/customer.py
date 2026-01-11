"""
Customer-specific domain exceptions.
"""

from .base import NotFoundError, AlreadyExistsError, ValidationError, BusinessRuleError


class CustomerNotFoundError(NotFoundError):
    """Raised when a customer is not found."""
    def __init__(self, customer_id: int = None, email: str = None):
        if customer_id:
            message = f"Customer with ID {customer_id} not found"
        elif email:
            message = f"Customer with email {email} not found"
        else:
            message = "Customer not found"
        super().__init__(message, code="CUSTOMER_NOT_FOUND")


class CustomerAlreadyExistsError(AlreadyExistsError):
    """Raised when trying to create a customer that already exists."""
    def __init__(self, email: str):
        message = f"Customer with email {email} already exists"
        super().__init__(message, code="CUSTOMER_ALREADY_EXISTS")


class CustomerValidationError(ValidationError):
    """Raised when customer data validation fails."""
    def __init__(self, message: str):
        super().__init__(message, code="CUSTOMER_VALIDATION_ERROR")


class CustomerHasActiveAppointmentsError(BusinessRuleError):
    """Raised when trying to delete a customer with active appointments."""
    def __init__(self, customer_id: int, appointment_count: int):
        message = (
            f"Cannot delete customer {customer_id}: "
            f"has {appointment_count} active appointment(s)"
        )
        super().__init__(message, code="CUSTOMER_HAS_ACTIVE_APPOINTMENTS")
