from pydantic import BaseModel, constr, field_validator
import re

class CategoryBase(BaseModel):
    name: constr(min_length=1, max_length=100)
    slug: constr(min_length=1, max_length=120)
    icon: constr(min_length=1, max_length=100) = 'Folder'

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v):
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
