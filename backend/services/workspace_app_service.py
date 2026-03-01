from sqlalchemy.orm import Session
from backend.models.workspace_app import WorkspaceApp
from backend.models.category import Category
from backend.schemas.workspace_app import WorkspaceAppCreate, WorkspaceAppUpdate

def get_workspace_app(db: Session, app_id: int):
    return db.query(WorkspaceApp).filter(WorkspaceApp.id == app_id).first()

def get_workspace_apps(db: Session, skip: int = 0, limit: int = 100):
    return db.query(WorkspaceApp).offset(skip).limit(limit).all()

def create_workspace_app(db: Session, app: WorkspaceAppCreate):
    db_app = WorkspaceApp(**app.dict())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def update_workspace_app(db: Session, app_id: int, app: WorkspaceAppUpdate):
    db_app = get_workspace_app(db, app_id)
    if db_app:
        for key, value in app.dict().items():
            setattr(db_app, key, value)
        db.commit()
        db.refresh(db_app)
    return db_app

def delete_workspace_app(db: Session, app_id: int):
    db_app = get_workspace_app(db, app_id)
    if db_app:
        db.delete(db_app)
        db.commit()
    return db_app

def seed_apps(db: Session):
    if db.query(WorkspaceApp).count() > 0:
        return
    
    # Get categories to link apps
    categories = {c.slug: c.id for c in db.query(Category).all()}
    if not categories:
        print("⚠️ No categories found to seed apps.")
        return

    initial_apps = [
        {
            "name": "Gemini Pro",
            "slug": "gemini-pro",
            "category_id": categories.get("gen-text"),
            "icon": "Cpu",
            "url": "https://gemini.google.com",
            "description": "Advanced reasoning and multimodal capabilities.",
            "display_order": 1
        },
        {
            "name": "ChatGPT Plus",
            "slug": "chatgpt-plus",
            "category_id": categories.get("gen-text"),
            "icon": "MessageCircle",
            "url": "https://chat.openai.com",
            "description": "The world's most popular AI chatbot.",
            "display_order": 2
        },
        {
            "name": "Midjourney",
            "slug": "midjourney",
            "category_id": categories.get("gen-image"),
            "icon": "Palette",
            "url": "https://www.midjourney.com",
            "description": "High-quality artistic image generation.",
            "display_order": 1
        },
        {
            "name": "GitHub Copilot",
            "slug": "github-copilot",
            "category_id": categories.get("code-assist"),
            "icon": "Github",
            "url": "https://github.com/features/copilot",
            "description": "Your AI pair programmer.",
            "display_order": 1
        }
    ]
    
    for app_data in initial_apps:
        if app_data["category_id"]:
            db_app = WorkspaceApp(**app_data)
            db.add(db_app)
    
    try:
        db.commit()
        print("✅ Apps seeded successfully.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding apps: {e}")
