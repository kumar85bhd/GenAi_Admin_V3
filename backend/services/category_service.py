from sqlalchemy.orm import Session
from backend.models.category import Category
from backend.schemas.category import CategoryCreate, CategoryUpdate

def get_category(db: Session, category_id: int):
    return db.query(Category).filter(Category.id == category_id).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: CategoryCreate):
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category: CategoryUpdate):
    db_category = get_category(db, category_id)
    if db_category:
        for key, value in category.dict().items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category

def seed_categories(db: Session):
    if db.query(Category).count() > 0:
        return
    
    initial_categories = [
        {"name": "Generative Text", "slug": "gen-text", "icon": "MessageSquare"},
        {"name": "Image Generation", "slug": "gen-image", "icon": "Image"},
        {"name": "Code Assistants", "slug": "code-assist", "icon": "Code"},
        {"name": "Data Analytics", "slug": "data-analytics", "icon": "BarChart"},
        {"name": "Productivity", "slug": "productivity", "icon": "Zap"},
    ]
    
    for cat_data in initial_categories:
        db_cat = Category(**cat_data)
        db.add(db_cat)
    
    try:
        db.commit()
        print("✅ Categories seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding categories: {e}")
