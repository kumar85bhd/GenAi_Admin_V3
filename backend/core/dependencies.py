from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from backend.core.config import settings
from backend.database import SessionLocal
from backend.services.user_service import get_user_by_email
from backend.schemas.user import UserInDB

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            print("❌ Token payload missing 'sub' claim")
            raise credentials_exception
    except JWTError as e:
        print(f"❌ JWT Decode Error: {e}")
        raise credentials_exception
    
    user = get_user_by_email(db=db, email=email)
    if user is None:
        print(f"❌ User not found in database for email: {email}")
        raise credentials_exception
    
    return user

def get_current_admin_user(current_user: UserInDB = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
