from pydantic import BaseModel, constr, field_validator, HttpUrl
import re

class WorkspaceAppBase(BaseModel):
    name: constr(min_length=1, max_length=100)
    slug: constr(min_length=1, max_length=120)
    category_id: int
    icon: constr(min_length=1, max_length=100)
    url: HttpUrl
    description: constr(min_length=1)
    display_order: int = 0
    is_active: bool = True

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v):
        if not re.match(r'^[a-z0-9-]+$', v):
            raise ValueError('Slug must be lowercase and contain only letters, numbers, and hyphens')
        return v

class WorkspaceAppCreate(WorkspaceAppBase):
    pass

class WorkspaceAppUpdate(WorkspaceAppBase):
    pass

class WorkspaceAppInDB(WorkspaceAppBase):
    id: int

    class Config:
        from_attributes = True
