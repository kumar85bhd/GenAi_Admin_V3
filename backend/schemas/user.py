from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_admin: bool = False

    class Config:
        from_attributes = True

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    password: str

class UserResponse(UserBase):
    pass
