"""
Appointment service layer - handles appointment-related business logic.

This is a simpler example service to demonstrate the pattern.
The full AppointmentRepository has more complex operations that should
be gradually migrated to this service layer.
"""

from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any
from datetime import datetime, date, time
import logging

from app.models.appointment import Appointment
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.employee import Employee
from app.models.service import Service
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate
from app.crud.appoitment import AppointmentRepository
from app.exceptions import (
    AppointmentNotFoundError,
    AppointmentValidationError,
    AppointmentConflictError,
    AppointmentCannotBeCancelledError,
    AppointmentCannotBeUpdatedError,
    CustomerNotFoundError
)
from .base_service import BaseService

logger = logging.getLogger(__name__)


class AppointmentService(BaseService[Appointment]):
    """
    Service layer for appointment operations.
    
    Handles:
    - Appointment creation with validations
    - Appointment updates with business rules
    - Appointment cancellation
    - Time slot validation
    - Status transitions
    """
    
    def __init__(self, db: Session):
        super().__init__(db)
        self.repo = AppointmentRepository(db)
    
    def create_appointment(
        self,
        appointment_in: AppointmentCreate,
        send_email: bool = True
    ) -> Appointment:
        """
        Create a new appointment.
        
        Business rules:
        - Validates customer, vehicle, employee, service exist
        - Checks for time slot conflicts
        - Sends confirmation email if requested
        
        Args:
            appointment_in: Appointment creation data
            send_email: Whether to send confirmation email
            
        Returns:
            Created appointment instance
            
        Raises:
            CustomerNotFoundError: If customer doesn't exist
            AppointmentValidationError: If validation fails
            AppointmentConflictError: If time slot is booked
        """
        logger.info(
            f"Creating appointment for customer {appointment_in.customer_id} "
            f"on {appointment_in.appointment_date}"
        )
        
        try:
            # Validate customer exists
            customer = self.db.query(Customer).filter(
                Customer.id == appointment_in.customer_id
            ).first()
            if not customer:
                raise CustomerNotFoundError(customer_id=appointment_in.customer_id)
            
            # Validate vehicle exists and belongs to customer
            if appointment_in.vehicle_id:
                vehicle = self.db.query(Vehicle).filter(
                    Vehicle.id == appointment_in.vehicle_id,
                    Vehicle.id_customer == appointment_in.customer_id
                ).first()
                if not vehicle:
                    raise AppointmentValidationError(
                        f"Vehicle {appointment_in.vehicle_id} not found or "
                        f"doesn't belong to customer {appointment_in.customer_id}"
                    )
            
            # Validate employee exists if provided
            if appointment_in.employee_id:
                employee = self.db.query(Employee).filter(
                    Employee.id == appointment_in.employee_id
                ).first()
                if not employee:
                    raise AppointmentValidationError(
                        f"Employee {appointment_in.employee_id} not found"
                    )
            
            # Validate service exists if provided
            if appointment_in.service_id:
                service = self.db.query(Service).filter(
                    Service.id == appointment_in.service_id
                ).first()
                if not service:
                    raise AppointmentValidationError(
                        f"Service {appointment_in.service_id} not found"
                    )
            
            # Check for time slot conflicts (optional - can be made more sophisticated)
            conflict = self._check_time_slot_conflict(
                appointment_in.appointment_date,
                appointment_in.time,
                appointment_in.employee_id
            )
            if conflict:
                raise AppointmentConflictError(
                    date=str(appointment_in.appointment_date),
                    time=str(appointment_in.time)
                )
            
            # Create appointment using repository
            appointment = self.repo.create(appointment_in, send_email=send_email)
            
            logger.info(f"Appointment created successfully: {appointment.id}")
            return appointment
            
        except (CustomerNotFoundError, AppointmentValidationError, AppointmentConflictError):
            raise
        except Exception as e:
            logger.error(f"Failed to create appointment: {e}", exc_info=True)
            self.rollback()
            raise AppointmentValidationError(f"Failed to create appointment: {str(e)}")
    
    def get_appointment_by_id(self, appointment_id: int) -> Appointment:
        """
        Get an appointment by ID with all relations loaded.
        
        Args:
            appointment_id: Appointment ID
            
        Returns:
            Appointment instance with relations
            
        Raises:
            AppointmentNotFoundError: If appointment not found
        """
        appointment = self.repo.get_by_id_with_relations(appointment_id)
        if not appointment:
            logger.warning(f"Appointment not found: {appointment_id}")
            raise AppointmentNotFoundError(appointment_id=appointment_id)
        
        return appointment
    
    def list_appointments(
        self,
        skip: int = 0,
        limit: int = 100,
        customer_id: Optional[int] = None,
        status: Optional[str] = None
    ) -> List[Appointment]:
        """
        List appointments with optional filters.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records
            customer_id: Optional filter by customer
            status: Optional filter by status
            
        Returns:
            List of appointments
        """
        logger.debug(
            f"Listing appointments (skip={skip}, limit={limit}, "
            f"customer={customer_id}, status={status})"
        )
        return self.repo.get_all(
            skip=skip,
            limit=limit,
            customer_id=customer_id,
            status=status
        )
    
    def update_appointment(
        self,
        appointment_id: int,
        appointment_data: AppointmentUpdate
    ) -> Appointment:
        """
        Update an appointment.
        
        Business rules:
        - Cannot update finalized or cancelled appointments
        - Validates new time slot if changed
        
        Args:
            appointment_id: Appointment ID
            appointment_data: Update data
            
        Returns:
            Updated appointment instance
            
        Raises:
            AppointmentNotFoundError: If appointment not found
            AppointmentCannotBeUpdatedError: If appointment cannot be updated
            AppointmentConflictError: If new time slot is booked
        """
        logger.info(f"Updating appointment: {appointment_id}")
        
        # Get current appointment
        appointment = self.get_appointment_by_id(appointment_id)
        
        # Check if appointment can be updated
        if appointment.status in ["Finalized", "Canceled"]:
            raise AppointmentCannotBeUpdatedError(
                appointment_id=appointment_id,
                status=appointment.status
            )
        
        try:
            # Check for time slot conflicts if date/time is being changed
            if (appointment_data.appointment_date or appointment_data.time):
                new_date = appointment_data.appointment_date or appointment.appointment_date
                new_time = appointment_data.time or appointment.time
                new_employee = appointment_data.employee_id or appointment.employee_id
                
                conflict = self._check_time_slot_conflict(
                    new_date,
                    new_time,
                    new_employee,
                    exclude_appointment_id=appointment_id
                )
                if conflict:
                    raise AppointmentConflictError(
                        date=str(new_date),
                        time=str(new_time)
                    )
            
            # Update appointment
            updated_appointment = self.repo.update(appointment_id, appointment_data)
            
            self.commit()
            logger.info(f"Appointment updated successfully: {appointment_id}")
            return updated_appointment
            
        except (AppointmentConflictError, AppointmentCannotBeUpdatedError):
            raise
        except Exception as e:
            logger.error(f"Failed to update appointment {appointment_id}: {e}", exc_info=True)
            self.rollback()
            raise AppointmentValidationError(f"Failed to update appointment: {str(e)}")
    
    def cancel_appointment(self, appointment_id: int, reason: Optional[str] = None) -> Appointment:
        """
        Cancel an appointment.
        
        Business rules:
        - Cannot cancel already finalized appointments
        - Can cancel pending or confirmed appointments
        
        Args:
            appointment_id: Appointment ID
            reason: Optional cancellation reason
            
        Returns:
            Cancelled appointment instance
            
        Raises:
            AppointmentNotFoundError: If appointment not found
            AppointmentCannotBeCancelledError: If appointment cannot be cancelled
        """
        logger.info(f"Cancelling appointment: {appointment_id}")
        
        # Get appointment
        appointment = self.get_appointment_by_id(appointment_id)
        
        # Check if appointment can be cancelled
        if appointment.status == "Finalized":
            raise AppointmentCannotBeCancelledError(
                appointment_id=appointment_id,
                status=appointment.status
            )
        
        try:
            # Cancel appointment
            cancelled_appointment = self.repo.cancel(appointment_id)
            
            # Optionally store cancellation reason
            if reason:
                # Could add a comment or log entry here
                logger.info(f"Appointment {appointment_id} cancelled. Reason: {reason}")
            
            self.commit()
            logger.info(f"Appointment cancelled successfully: {appointment_id}")
            return cancelled_appointment
            
        except AppointmentCannotBeCancelledError:
            raise
        except Exception as e:
            logger.error(f"Failed to cancel appointment {appointment_id}: {e}", exc_info=True)
            self.rollback()
            raise AppointmentValidationError(f"Failed to cancel appointment: {str(e)}")
    
    def finalize_appointment(self, appointment_id: int) -> Appointment:
        """
        Finalize an appointment.
        
        Business rules:
        - Only confirmed/in-progress appointments can be finalized
        
        Args:
            appointment_id: Appointment ID
            
        Returns:
            Finalized appointment instance
            
        Raises:
            AppointmentNotFoundError: If appointment not found
            AppointmentValidationError: If appointment cannot be finalized
        """
        logger.info(f"Finalizing appointment: {appointment_id}")
        
        # Get appointment
        appointment = self.get_appointment_by_id(appointment_id)
        
        # Check if appointment can be finalized
        if appointment.status in ["Canceled", "Finalized"]:
            raise AppointmentValidationError(
                f"Cannot finalize appointment with status '{appointment.status}'"
            )
        
        try:
            finalized_appointment = self.repo.finalize(appointment_id)
            
            self.commit()
            logger.info(f"Appointment finalized successfully: {appointment_id}")
            return finalized_appointment
            
        except Exception as e:
            logger.error(f"Failed to finalize appointment {appointment_id}: {e}", exc_info=True)
            self.rollback()
            raise AppointmentValidationError(f"Failed to finalize appointment: {str(e)}")
    
    def get_order_total(self, appointment_id: int) -> Dict[str, Any]:
        """
        Calculate order total with breakdown.
        
        Args:
            appointment_id: Appointment ID
            
        Returns:
            Dictionary with order breakdown
            
        Raises:
            AppointmentNotFoundError: If appointment not found
        """
        # Verify appointment exists
        self.get_appointment_by_id(appointment_id)
        
        # Calculate total using repository
        return self.repo.calculate_order_total(appointment_id)
    
    def _check_time_slot_conflict(
        self,
        appointment_date: date,
        appointment_time: time,
        employee_id: Optional[int] = None,
        exclude_appointment_id: Optional[int] = None
    ) -> bool:
        """
        Check if a time slot is already booked.
        
        Args:
            appointment_date: Appointment date
            appointment_time: Appointment time
            employee_id: Optional employee ID
            exclude_appointment_id: Appointment ID to exclude from check (for updates)
            
        Returns:
            True if conflict exists, False otherwise
        """
        query = self.db.query(Appointment).filter(
            Appointment.appointment_date == appointment_date,
            Appointment.time == appointment_time,
            Appointment.status.notin_(["Canceled"])
        )
        
        if employee_id:
            query = query.filter(Appointment.employee_id == employee_id)
        
        if exclude_appointment_id:
            query = query.filter(Appointment.id != exclude_appointment_id)
        
        conflict = query.first()
        return conflict is not None
