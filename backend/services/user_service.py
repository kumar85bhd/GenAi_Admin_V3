import json
import os
import logging
from typing import Optional, List, Any, Dict
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.schemas.user import UserInDB
from backend.core.config import BASE_DIR
from backend.core.security import get_password_hash

logger = logging.getLogger(__name__)

USERS_FILE = os.path.join(BASE_DIR, "backend", "data", "users.json")

def get_users_from_json() -> List[Dict[str, Any]]:
    """Read users from the JSON file."""
    try:
        if not os.path.exists(USERS_FILE):
            logger.warning(f"USERS_FILE not found at: {USERS_FILE}")
            return []
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error reading USERS_FILE: {e}")
        return []

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Retrieve a user by their email address."""
    if not email:
        return None
    email = email.strip().lower()
    return db.query(User).filter(User.email == email).first()

def seed_users(db: Session) -> None:
    """Seed the database with users from the JSON file if none exist."""
    if db.query(User).count() > 0:
        return
    
    json_users = get_users_from_json()
    for user_data in json_users:
        # Create user in DB
        db_user = User(
            id=int(user_data["id"]),
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=get_password_hash(user_data["password"]),
            is_admin=user_data.get("is_admin", False)
        )
        db.add(db_user)
    
    try:
        db.commit()
        logger.info("Users seeded successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding users: {e}")
