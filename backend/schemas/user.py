from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    id: int
    username: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    is_admin: bool = False

    class Config:
        from_attributes = True
        extra = "forbid"

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserInDB(UserBase):
    password: str

class UserResponse(UserBase):
    pass
