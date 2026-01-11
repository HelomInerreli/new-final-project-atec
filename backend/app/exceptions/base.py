"""
Base domain exceptions.
"""


class DomainException(Exception):
    """Base exception for all domain-related errors."""
    def __init__(self, message: str, code: str = "DOMAIN_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class NotFoundError(DomainException):
    """Raised when a resource is not found."""
    def __init__(self, message: str, code: str = "NOT_FOUND"):
        super().__init__(message, code)


class AlreadyExistsError(DomainException):
    """Raised when trying to create a resource that already exists."""
    def __init__(self, message: str, code: str = "ALREADY_EXISTS"):
        super().__init__(message, code)


class ValidationError(DomainException):
    """Raised when validation fails."""
    def __init__(self, message: str, code: str = "VALIDATION_ERROR"):
        super().__init__(message, code)


class UnauthorizedError(DomainException):
    """Raised when authentication is required but not provided."""
    def __init__(self, message: str = "Authentication required", code: str = "UNAUTHORIZED"):
        super().__init__(message, code)


class ForbiddenError(DomainException):
    """Raised when user doesn't have permission for action."""
    def __init__(self, message: str = "Permission denied", code: str = "FORBIDDEN"):
        super().__init__(message, code)


class BusinessRuleError(DomainException):
    """Raised when a business rule is violated."""
    def __init__(self, message: str, code: str = "BUSINESS_RULE_VIOLATION"):
        super().__init__(message, code)
