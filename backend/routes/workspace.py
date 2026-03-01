from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.dependencies import get_db
from backend.services import category_service, workspace_app_service
from backend.schemas import category as category_schema
from backend.schemas import workspace_app as workspace_app_schema

router = APIRouter()

@router.get("/categories", response_model=List[category_schema.CategoryInDB])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = category_service.get_categories(db, skip=skip, limit=limit)
    return categories

@router.post("/categories", response_model=category_schema.CategoryInDB)
def create_category(category: category_schema.CategoryCreate, db: Session = Depends(get_db)):
    return category_service.create_category(db=db, category=category)

@router.put("/categories/{category_id}", response_model=category_schema.CategoryInDB)
def update_category(category_id: int, category: category_schema.CategoryUpdate, db: Session = Depends(get_db)):
    db_category = category_service.update_category(db, category_id, category)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.delete("/categories/{category_id}", response_model=category_schema.CategoryInDB)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    db_category = category_service.delete_category(db, category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.get("/apps", response_model=List[workspace_app_schema.WorkspaceAppInDB])
def read_workspace_apps(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    apps = workspace_app_service.get_workspace_apps(db, skip=skip, limit=limit)
    return apps

@router.post("/apps", response_model=workspace_app_schema.WorkspaceAppInDB)
def create_workspace_app(app: workspace_app_schema.WorkspaceAppCreate, db: Session = Depends(get_db)):
    return workspace_app_service.create_workspace_app(db=db, app=app)

@router.put("/apps/{app_id}", response_model=workspace_app_schema.WorkspaceAppInDB)
def update_workspace_app(app_id: int, app: workspace_app_schema.WorkspaceAppUpdate, db: Session = Depends(get_db)):
    db_app = workspace_app_service.update_workspace_app(db, app_id, app)
    if db_app is None:
        raise HTTPException(status_code=404, detail="App not found")
    return db_app

@router.delete("/apps/{app_id}", response_model=workspace_app_schema.WorkspaceAppInDB)
def delete_workspace_app(app_id: int, db: Session = Depends(get_db)):
    db_app = workspace_app_service.delete_workspace_app(db, app_id)
    if db_app is None:
        raise HTTPException(status_code=404, detail="App not found")
    return db_app
