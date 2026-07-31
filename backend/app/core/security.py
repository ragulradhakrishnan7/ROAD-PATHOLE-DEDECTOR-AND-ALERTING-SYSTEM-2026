from datetime import datetime, timedelta, timezone
from typing import Optional, Union, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from passlib.handlers.bcrypt import _BcryptBackend
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from app.core.config import settings

# Patch passlib's _BcryptBackend._calc_checksum to handle modern bcrypt (>=4.1.0) test secrets > 72 bytes
_orig_calc = _BcryptBackend._calc_checksum
def _safe_calc_checksum(self, secret):
    if secret and len(secret) > 72:
        secret = secret[:72]
    return _orig_calc(self, secret)
_BcryptBackend._calc_checksum = _safe_calc_checksum

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# ---------------------------------------------------------------------------
# Shared FastAPI Dependencies for Authentication & Authorization
# ---------------------------------------------------------------------------

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(None)):
    """
    Extracts and validates the JWT Bearer token from the Authorization header.
    Returns the authenticated User ORM object.
    NOTE: The `db` dependency is overridden at import time — see the lazy
    initializer below.
    """
    from app.models.user import User  # deferred to avoid circular import

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization token header."
        )
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload.")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return user


def _build_get_current_user():
    """
    Build the real dependency with the proper `get_db` session injected.
    Must be called after database module is importable (avoids circular import).
    """
    from app.core.database import get_db

    def _get_current_user(
        authorization: Optional[str] = Header(None),
        db: Session = Depends(get_db),
    ):
        return get_current_user(authorization=authorization, db=db)

    return _get_current_user


# Lazy-initialized dependency — import this in routers
_current_user_dep = None

def get_current_user_dep():
    global _current_user_dep
    if _current_user_dep is None:
        _current_user_dep = _build_get_current_user()
    return _current_user_dep


def require_admin(current_user=None):
    """
    Dependency that ensures the current user has the 'admin' role.
    Use as: current_user: User = Depends(require_admin_dep())
    """
    if current_user is None or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required for this endpoint."
        )
    return current_user
