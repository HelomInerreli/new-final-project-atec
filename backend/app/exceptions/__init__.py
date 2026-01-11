"""
Domain exceptions for business logic.
These exceptions are framework-agnostic and can be used in services, CRUD, etc.
"""

from .base import (
    DomainException,
    NotFoundError,
    AlreadyExistsError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    BusinessRuleError
)

from .customer import (
    CustomerNotFoundError,
    CustomerAlreadyExistsError,
    CustomerValidationError,
    CustomerHasActiveAppointmentsError
)

from .appointment import (
    AppointmentNotFoundError,
    AppointmentValidationError,
    AppointmentConflictError,
    AppointmentCannotBeCancelledError,
    AppointmentCannotBeUpdatedError
)

__all__ = [
    "DomainException",
    "NotFoundError",
    "AlreadyExistsError",
    "ValidationError",
    "UnauthorizedError",
    "ForbiddenError",
    "BusinessRuleError",
    "CustomerNotFoundError",
    "CustomerAlreadyExistsError",
    "CustomerValidationError",
    "CustomerHasActiveAppointmentsError",
    "AppointmentNotFoundError",
    "AppointmentValidationError",
    "AppointmentConflictError",
    "AppointmentCannotBeCancelledError",
    "AppointmentCannotBeUpdatedError"
]
