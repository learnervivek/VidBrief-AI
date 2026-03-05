from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from backend.core.database import engine, Base
from backend.core.config import settings
from backend.api.routes import router as video_router
from backend.api.auth_routes import router as auth_router
import backend.models # Ensure models are registered

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Video Summarizer API", version="1.0.0")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(video_router, prefix="/api/v1/videos", tags=["Videos"])

# Serve uploads statically
if not os.path.exists(settings.UPLOAD_DIR):
    os.makedirs(settings.UPLOAD_DIR)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI Video Summarizer API"}
