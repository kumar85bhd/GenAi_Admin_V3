from pydantic import BaseModel, Field, field_validator, HttpUrl
import re

class WorkspaceAppBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    slug: str = Field(..., min_length=1, max_length=120)
    category_id: int
    icon: str = Field(..., min_length=1, max_length=100)
    url: HttpUrl
    description: str = Field(..., min_length=1)
    display_order: int = 0
    is_active: bool = True

    class Config:
        extra = "forbid"

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v: str) -> str:
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
        extra = "forbid"
