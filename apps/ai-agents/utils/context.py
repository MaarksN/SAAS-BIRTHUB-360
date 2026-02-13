from contextvars import ContextVar
from typing import Optional, Dict
import uuid

# Define context variables
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="unknown")
user_id_ctx: ContextVar[Optional[str]] = ContextVar("user_id", default=None)
org_id_ctx: ContextVar[Optional[str]] = ContextVar("org_id", default=None)

def set_context(request_id: str, user_id: Optional[str] = None, org_id: Optional[str] = None):
    """Sets the context variables for the current execution context."""
    request_id_ctx.set(request_id)
    if user_id:
        user_id_ctx.set(user_id)
    if org_id:
        org_id_ctx.set(org_id)

def get_request_id() -> str:
    """Returns the current request ID."""
    return request_id_ctx.get()

def get_user_id() -> Optional[str]:
    """Returns the current user ID."""
    return user_id_ctx.get()

def get_org_id() -> Optional[str]:
    """Returns the current organization ID."""
    return org_id_ctx.get()

def get_context_dict() -> Dict[str, Optional[str]]:
    """Returns a dictionary of the current context."""
    return {
        "request_id": get_request_id(),
        "user_id": get_user_id(),
        "org_id": get_org_id()
    }
