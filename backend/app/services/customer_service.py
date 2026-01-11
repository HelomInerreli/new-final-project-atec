"""
Customer service layer - handles all customer-related business logic.
"""

from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

from app.models.customer import Customer
from app.models.customerAuth import CustomerAuth
from app.models.appointment import Appointment
from app.models.vehicle import Vehicle
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.crud.customer import CustomerRepository
from app.exceptions import (
    CustomerNotFoundError,
    CustomerAlreadyExistsError,
    CustomerValidationError,
    CustomerHasActiveAppointmentsError
)
from app.services.notification_service import NotificationService
from .base_service import BaseService

logger = logging.getLogger(__name__)


class CustomerService(BaseService[Customer]):
    """
    Service layer for customer operations.
    
    This service handles:
    - Customer creation with auth account
    - Customer updates with validation
    - Customer deletion with business rules
    - Complete customer profile management
    - Customer notifications
    """
    
    def __init__(self, db: Session):
        super().__init__(db)
        self.repo = CustomerRepository(db)
        self.notification_service = NotificationService
    
    def create_customer(self, customer_in: CustomerCreate) -> Customer:
        """
        Create a new customer with authentication account.
        
        Business rules:
        - Email must be unique
        - Sends notification to admins
        - Creates CustomerAuth record
        
        Args:
            customer_in: Customer creation data including email
            
        Returns:
            Created customer instance
            
        Raises:
            CustomerAlreadyExistsError: If email already exists
            CustomerValidationError: If validation fails
        """
        logger.info(f"Creating customer with email: {customer_in.email}")
        
        try:
            # Check if customer with email already exists
            existing_customer = self.repo.get_by_email(customer_in.email)
            if existing_customer:
                logger.warning(f"Customer with email {customer_in.email} already exists")
                raise CustomerAlreadyExistsError(email=customer_in.email)
            
            # Create customer
            customer = self.repo.create(customer_in)
            
            # Send notification to admins about new customer
            try:
                customer_auth = (
                    self.db.query(CustomerAuth)
                    .filter(CustomerAuth.id_customer == customer.id)
                    .first()
                )
                email = customer_auth.email if customer_auth else "N/A"
                
                self.notification_service.notify_new_customer(
                    db=self.db,
                    customer_name=customer.name,
                    email=email
                )
                logger.info(f"Notification sent for new customer: {customer.name}")
            except Exception as e:
                # Don't fail customer creation if notification fails
                logger.error(f"Failed to send notification for new customer: {e}", exc_info=True)
            
            logger.info(f"Customer created successfully: {customer.id}")
            return customer
            
        except CustomerAlreadyExistsError:
            raise
        except Exception as e:
            logger.error(f"Failed to create customer: {e}", exc_info=True)
            self.rollback()
            raise CustomerValidationError(f"Failed to create customer: {str(e)}")
    
    def get_customer_by_id(self, customer_id: int) -> Customer:
        """
        Get a customer by ID.
        
        Args:
            customer_id: Customer ID
            
        Returns:
            Customer instance
            
        Raises:
            CustomerNotFoundError: If customer not found
        """
        customer = self.repo.get_by_id(customer_id)
        if not customer:
            logger.warning(f"Customer not found: {customer_id}")
            raise CustomerNotFoundError(customer_id=customer_id)
        
        return customer
    
    def get_customer_by_email(self, email: str) -> Customer:
        """
        Get a customer by email.
        
        Args:
            email: Customer email
            
        Returns:
            Customer instance
            
        Raises:
            CustomerNotFoundError: If customer not found
        """
        customer = self.repo.get_by_email(email)
        if not customer:
            logger.warning(f"Customer not found with email: {email}")
            raise CustomerNotFoundError(email=email)
        
        return customer
    
    def list_customers(self, skip: int = 0, limit: int = 100) -> List[Customer]:
        """
        List customers with pagination.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of customers
        """
        logger.debug(f"Listing customers (skip={skip}, limit={limit})")
        return self.repo.get_all(skip=skip, limit=limit)
    
    def update_customer(
        self, 
        customer_id: int, 
        customer_data: CustomerUpdate
    ) -> Customer:
        """
        Update customer information.
        
        Business rules:
        - Email updates are handled separately in CustomerAuth
        - Cannot update deleted customers
        
        Args:
            customer_id: Customer ID
            customer_data: Update data
            
        Returns:
            Updated customer instance
            
        Raises:
            CustomerNotFoundError: If customer not found
        """
        logger.info(f"Updating customer: {customer_id}")
        
        # Verify customer exists
        customer = self.get_customer_by_id(customer_id)
        
        try:
            # Handle email update separately (updates CustomerAuth)
            if customer_data.email:
                customer_auth = (
                    self.db.query(CustomerAuth)
                    .filter(CustomerAuth.id_customer == customer_id)
                    .first()
                )
                if customer_auth:
                    customer_auth.email = customer_data.email
                    self.db.add(customer_auth)
                    logger.info(f"Updated email for customer: {customer_id}")
            
            # Update customer data
            updated_customer = self.repo.update(customer_id, customer_data)
            
            self.commit()
            logger.info(f"Customer updated successfully: {customer_id}")
            return updated_customer
            
        except Exception as e:
            logger.error(f"Failed to update customer {customer_id}: {e}", exc_info=True)
            self.rollback()
            raise CustomerValidationError(f"Failed to update customer: {str(e)}")
    
    def update_customer_profile(
        self,
        customer_auth_id: str,
        profile_data: CustomerUpdate
    ) -> Dict[str, Any]:
        """
        Update customer profile (used by authenticated customers).
        
        Args:
            customer_auth_id: CustomerAuth ID (from JWT token)
            profile_data: Profile update data
            
        Returns:
            Dictionary with success message and updated customer
            
        Raises:
            CustomerNotFoundError: If customer not found
        """
        logger.info(f"Updating profile for customer_auth: {customer_auth_id}")
        
        # Get CustomerAuth
        customer_auth = (
            self.db.query(CustomerAuth)
            .filter(CustomerAuth.id == customer_auth_id)
            .first()
        )
        if not customer_auth:
            raise CustomerNotFoundError()
        
        # Get Customer
        customer = self.get_customer_by_id(customer_auth.id_customer)
        
        # Update customer
        updated_customer = self.update_customer(customer.id, profile_data)
        
        return {
            "message": "Profile updated successfully",
            "customer": updated_customer
        }
    
    def delete_customer(self, customer_id: int) -> bool:
        """
        Soft delete a customer.
        
        Business rules:
        - Cannot delete customers with active (non-completed) appointments
        - Deactivates customer account
        - Sets deleted_at timestamp
        
        Args:
            customer_id: Customer ID
            
        Returns:
            True if deleted successfully
            
        Raises:
            CustomerNotFoundError: If customer not found
            CustomerHasActiveAppointmentsError: If customer has active appointments
        """
        logger.info(f"Deleting customer: {customer_id}")
        
        # Verify customer exists
        customer = self.get_customer_by_id(customer_id)
        
        # Check for active appointments
        active_appointments = (
            self.db.query(Appointment)
            .filter(
                Appointment.customer_id == customer_id,
                Appointment.status.notin_(["completed", "cancelled"])
            )
            .count()
        )
        
        if active_appointments > 0:
            logger.warning(
                f"Cannot delete customer {customer_id}: "
                f"has {active_appointments} active appointments"
            )
            raise CustomerHasActiveAppointmentsError(
                customer_id=customer_id,
                appointment_count=active_appointments
            )
        
        # Perform soft delete
        try:
            success = self.repo.delete(customer_id)
            if success:
                self.commit()
                logger.info(f"Customer deleted successfully: {customer_id}")
            return success
        except Exception as e:
            logger.error(f"Failed to delete customer {customer_id}: {e}", exc_info=True)
            self.rollback()
            raise CustomerValidationError(f"Failed to delete customer: {str(e)}")
    
    def get_complete_profile(self, customer_auth_id: str) -> Dict[str, Any]:
        """
        Get complete customer profile with all related data.
        
        Includes:
        - Authentication info
        - Personal details
        - Vehicles
        - Can be extended to include appointments
        
        Args:
            customer_auth_id: CustomerAuth ID (from JWT token)
            
        Returns:
            Dictionary with complete profile data
            
        Raises:
            CustomerNotFoundError: If customer not found
        """
        logger.debug(f"Getting complete profile for customer_auth: {customer_auth_id}")
        
        # Fetch CustomerAuth with eager loading
        customer_auth = (
            self.db.query(CustomerAuth)
            .options(joinedload(CustomerAuth.customer))
            .filter(CustomerAuth.id == customer_auth_id)
            .first()
        )
        
        if not customer_auth:
            raise CustomerNotFoundError()
        
        customer = customer_auth.customer
        if not customer:
            raise CustomerNotFoundError()
        
        # Fetch vehicles with eager loading
        vehicles = (
            self.db.query(Vehicle)
            .filter(Vehicle.id_customer == customer.id)
            .all()
        )
        
        return {
            "auth": {
                "id": customer_auth.id,
                "email": customer_auth.email,
                "is_active": customer_auth.is_active,
                "created_at": customer_auth.created_at,
                "updated_at": customer_auth.updated_at
            },
            "customer": {
                "id": customer.id,
                "name": customer.name,
                "phone": customer.phone,
                "address": customer.address,
                "city": customer.city,
                "postal_code": customer.postal_code,
                "country": customer.country,
                "birth_date": customer.birth_date,
                "created_at": customer.created_at,
                "updated_at": customer.updated_at
            },
            "vehicles": [
                {
                    "id": vehicle.id,
                    "plate": vehicle.plate,
                    "brand": vehicle.brand,
                    "model": vehicle.model,
                    "kilometers": vehicle.kilometers,
                    "deleted_at": vehicle.deleted_at
                }
                for vehicle in vehicles
            ]
        }
    
    def get_all_customer_profiles(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get all customer profiles with auth info (admin endpoint).
        
        Uses eager loading to avoid N+1 queries.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of customer profile dictionaries
        """
        logger.debug(f"Getting all customer profiles (skip={skip}, limit={limit})")
        
        # Fetch customers with eager loading of auth relationship
        customers = (
            self.db.query(Customer)
            .options(joinedload(Customer.auth))
            .filter(Customer.deleted_at.is_(None))
            .order_by(Customer.id)
            .offset(skip)
            .limit(limit)
            .all()
        )
        
        result = []
        for customer in customers:
            customer_auth = customer.auth
            
            profile = {
                "auth": {
                    "id": str(customer_auth.id) if customer_auth else "",
                    "email": customer_auth.email if customer_auth else "N/A",
                    "is_active": customer_auth.is_active if customer_auth else False,
                    "created_at": str(customer_auth.created_at) if customer_auth and customer_auth.created_at else "",
                    "updated_at": str(customer_auth.updated_at) if customer_auth and customer_auth.updated_at else ""
                },
                "customer": {
                    "id": customer.id,
                    "name": customer.name or "N/A",
                    "phone": customer.phone or "",
                    "address": customer.address or "",
                    "city": customer.city or "",
                    "postal_code": customer.postal_code or "",
                    "country": customer.country or "",
                    "birth_date": str(customer.birth_date) if customer.birth_date else "",
                    "created_at": str(customer.created_at) if customer.created_at else "",
                    "updated_at": str(customer.updated_at) if customer.updated_at else ""
                }
            }
            result.append(profile)
        
        logger.debug(f"Returning {len(result)} customer profiles")
        return result
    
    def get_customer_appointments(self, customer_id: int) -> List[Appointment]:
        """
        Get all appointments for a customer.
        
        Args:
            customer_id: Customer ID
            
        Returns:
            List of appointments
            
        Raises:
            CustomerNotFoundError: If customer not found
        """
        # Verify customer exists
        customer = self.get_customer_by_id(customer_id)
        
        # Return appointments from relationship
        return customer.appointments
