from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
import os
import logging
import time
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import database and models
try:
    from backend.database import engine, Base
    from backend.models.user import User
    from backend.models.category import Category
    from backend.models.workspace_app import WorkspaceApp
    from backend.routes import auth, admin, workspace
    from backend.core.config import BASE_DIR
except Exception as e:
    logger.error(f"❌ Error during imports: {e}")
    logger.error(traceback.format_exc())
    raise

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 FastAPI server starting up...")
    logger.info(f"CWD: {os.getcwd()}")
    logger.info(f"BASE_DIR: {BASE_DIR}")
    
    # Create database tables
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully.")
        
        # Seed data
        from backend.database import SessionLocal
        from backend.services.user_service import seed_users
        from backend.services.category_service import seed_categories
        from backend.services.workspace_app_service import seed_apps
        
        db = SessionLocal()
        try:
            seed_users(db)
            seed_categories(db)
            seed_apps(db)
        finally:
            db.close()
            
    except Exception as e:
        logger.error(f"❌ Error during startup: {e}")
        logger.error(traceback.format_exc())
    
    logger.info(f"Dist exists: {os.path.exists(os.path.join(BASE_DIR, 'dist'))}")

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000
        logger.info(f"Completed request: {request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms")
        return response
    except Exception as e:
        logger.error(f"❌ Error processing request: {e}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error", "error": str(e)}
        )

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(workspace.router, prefix="/api/workspace", tags=["workspace"])

@app.get("/api/health")
def read_root():
    return {
        "status": "ok",
        "time": time.time(),
        "cwd": os.getcwd(),
        "base_dir": BASE_DIR,
        "dist_exists": os.path.exists(os.path.join(BASE_DIR, "dist"))
    }

# Serve Frontend
dist_path = os.path.join(BASE_DIR, "dist")
assets_path = os.path.join(dist_path, "assets")

# In dev mode (running on 3001), we don't need to serve the frontend as Vite handles it on 3000
# But we keep it for production or if running standalone
if os.path.exists(dist_path):
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
    
    @app.get("/{catchall:path}")
    async def serve_spa(catchall: str):
        # If the path starts with api/, it's a missing API route
        if catchall.startswith("api/"):
            return JSONResponse(content={"detail": "API Route Not Found", "path": catchall}, status_code=404)
            
        index_path = os.path.join(dist_path, "index.html")
        if os.path.exists(index_path):
            try:
                with open(index_path, "r") as f:
                    content = f.read()
                return HTMLResponse(content=content)
            except Exception as e:
                return HTMLResponse(content=f"<h1>Error reading index.html</h1><p>{str(e)}</p>", status_code=500)
        return HTMLResponse(content="<h1>index.html not found</h1>", status_code=404)
else:
    @app.get("/{catchall:path}")
    async def no_dist(catchall: str):
        # If we're in dev mode, this might be okay as Vite is serving
        if catchall.startswith("api/"):
            return JSONResponse(content={"detail": "API Route Not Found", "path": catchall}, status_code=404)
        return HTMLResponse(content="<h1>dist directory not found</h1><p>Please run 'npm run build' or use Vite dev server.</p>", status_code=404)
