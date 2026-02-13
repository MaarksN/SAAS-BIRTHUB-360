from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import uuid
from utils.context import request_id_ctx, user_id_ctx, org_id_ctx

class ContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract headers or generate defaults
        request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        user_id = request.headers.get("x-user-id")
        org_id = request.headers.get("x-org-id")

        # Set context variables for the current request scope
        token_req = request_id_ctx.set(request_id)
        token_user = user_id_ctx.set(user_id)
        token_org = org_id_ctx.set(org_id)

        try:
            # Process the request
            response = await call_next(request)

            # Ensure the response has the request ID header
            response.headers["x-request-id"] = request_id

            return response
        finally:
            # Reset context variables to avoid leakage in reused threads/tasks
            request_id_ctx.reset(token_req)
            user_id_ctx.reset(token_user)
            org_id_ctx.reset(token_org)
