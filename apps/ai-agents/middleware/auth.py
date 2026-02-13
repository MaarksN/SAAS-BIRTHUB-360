from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from jose import jwt, JWTError
import os
import logging

logger = logging.getLogger("auth_middleware")

class AuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware to validate JWT tokens.

    IMPORTANT: This middleware assumes the use of JWS (Signed JWT) using HS256 algorithm
    with NEXTAUTH_SECRET as the key.

    If NextAuth is configured to use JWE (Encrypted JWT - default), you must either:
    1. Configure NextAuth to use JWS for the API token.
    2. Or implement JWE decryption here (requires compatible encryption setup).
    3. Or use a separate Access Token signed with a shared secret.
    """
    async def dispatch(self, request: Request, call_next):
        # Allow public endpoints
        if request.url.path in ["/health", "/ready", "/docs", "/openapi.json"]:
             return await call_next(request)

        # Allow OPTIONS for CORS preflight
        if request.method == "OPTIONS":
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid authorization header"}
            )

        token = auth_header.split(" ")[1]
        secret = os.getenv("NEXTAUTH_SECRET")

        if not secret:
             logger.error("NEXTAUTH_SECRET environment variable is not set")
             return JSONResponse(
                status_code=500,
                content={"detail": "Server configuration error: Auth secret missing"}
            )

        try:
            # decode() verifies the signature.
            # algorithms=["HS256"] enforces symmetric key signature verification.
            payload = jwt.decode(token, secret, algorithms=["HS256"])
            request.state.user = payload
        except JWTError as e:
            logger.warning(f"JWT Verification failed: {str(e)}")
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid authentication token"}
            )

        return await call_next(request)
