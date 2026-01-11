"""
Appointment-specific domain exceptions.
"""

from .base import NotFoundError, AlreadyExistsError, ValidationError, BusinessRuleError


class AppointmentNotFoundError(NotFoundError):
    """Raised when an appointment is not found."""
    def __init__(self, appointment_id: int = None):
        if appointment_id:
            message = f"Appointment with ID {appointment_id} not found"
        else:
            message = "Appointment not found"
        super().__init__(message, code="APPOINTMENT_NOT_FOUND")


class AppointmentValidationError(ValidationError):
    """Raised when appointment data validation fails."""
    def __init__(self, message: str):
        super().__init__(message, code="APPOINTMENT_VALIDATION_ERROR")


class AppointmentConflictError(AlreadyExistsError):
    """Raised when appointment time slot is already booked."""
    def __init__(self, date: str, time: str):
        message = f"Time slot {date} at {time} is already booked"
        super().__init__(message, code="APPOINTMENT_CONFLICT")


class AppointmentCannotBeCancelledError(BusinessRuleError):
    """Raised when trying to cancel an appointment that cannot be cancelled."""
    def __init__(self, appointment_id: int, status: str):
        message = f"Cannot cancel appointment {appointment_id} with status '{status}'"
        super().__init__(message, code="APPOINTMENT_CANNOT_BE_CANCELLED")


class AppointmentCannotBeUpdatedError(BusinessRuleError):
    """Raised when trying to update a finalized or cancelled appointment."""
    def __init__(self, appointment_id: int, status: str):
        message = f"Cannot update appointment {appointment_id} with status '{status}'"
        super().__init__(message, code="APPOINTMENT_CANNOT_BE_UPDATED")
