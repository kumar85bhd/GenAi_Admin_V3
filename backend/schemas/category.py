from pydantic import BaseModel, Field, field_validator
import re

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=120)
    icon: str = Field(default='Folder', min_length=1, max_length=100)

    class Config:
        extra = "forbid"

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v: str) -> str:
        if not re.match(r'^[a-z0-9-]+$', v):
            raise ValueError('Slug must be lowercase and contain only letters, numbers, and hyphens')
        return v

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryInDB(CategoryBase):
    id: int

    class Config:
        from_attributes = True
        extra = "forbid"
