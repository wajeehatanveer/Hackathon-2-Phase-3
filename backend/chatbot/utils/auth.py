from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import Dict, Optional
import os
import logging

logger = logging.getLogger(__name__)

# Initialize the security scheme
security = HTTPBearer()

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict:
    """
    Verify the JWT token and return the payload if valid
    """
    if not credentials:
        logger.error("No credentials provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authorization token provided"
        )
    
    token = credentials.credentials
    
    try:
        # Decode the JWT token using the secret from environment.
        # Support `JWT_SECRET` or fall back to `BETTER_AUTH_SECRET` used by the main app.
        secret = os.getenv("JWT_SECRET") or os.getenv("BETTER_AUTH_SECRET")
        if not secret:
            logger.error("JWT secret not configured")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="JWT secret not configured"
            )

        payload = jwt.decode(token, secret, algorithms=["HS256"])
        logger.info(f"JWT verified for user: {payload.get('user_id', payload.get('sub'))}")
        return payload
    except jwt.ExpiredSignatureError as e:
        logger.warning(f"Token has expired: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        logger.error(f"Error verifying token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error verifying token"
        )