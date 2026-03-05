import os
import shutil
from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.core.database import get_db
from backend.core.config import settings
from typing import List
from backend import models, schemas
from backend.services import extract_audio, transcribe_audio, summarize_text, generate_timestamped_summary, process_video_optimized, generate_srt, generate_vtt

router = APIRouter()

def process_video_task(video_id: int, file_path: str, db: Session):
    video = db.query(models.VideoProcessing).filter(models.VideoProcessing.id == video_id).first()
    if not video:
        return

    try:
        # Step 1: Extract Audio & Frames
        video.status = "extracting_audio"
        db.commit()
        
        # Use optimized processor
        audio_path, frame_paths = process_video_optimized(file_path)

        # Set the first frame as thumbnail
        if frame_paths:
            # We want the relative path from the uploads directory for easier serving
            # frames are typically in backend/uploads/file_frames/frame_0.jpg
            # but process_video_optimized returns absolute or relative to cwd paths
            # Let's just store the basename or relative path
            thumb_rel_path = os.path.relpath(frame_paths[0], settings.UPLOAD_DIR)
            video.thumbnail_path = thumb_rel_path
            db.commit()

        # Step 2: Speech to Text
        video.status = "transcribing"
        db.commit()
        transcript, segments = transcribe_audio(audio_path)
        video.transcript = transcript
        video.raw_transcript = segments
        db.commit()

        # Step 3: Summarize
        if transcript:
            video.status = "summarizing"
            db.commit()
            
            # Generate both general summary and timestamped summary
            summary = summarize_text(transcript)
            timestamped_summary = generate_timestamped_summary(segments)
            
            # Generate Subtitles
            srt_content = generate_srt(segments)
            vtt_content = generate_vtt(segments)
            
            # Save subtitle files
            base_name = os.path.splitext(video.filename)[0]
            srt_path = os.path.join(settings.UPLOAD_DIR, f"{base_name}.srt")
            vtt_path = os.path.join(settings.UPLOAD_DIR, f"{base_name}.vtt")
            
            with open(srt_path, "w", encoding="utf-8") as f:
                f.write(srt_content)
            with open(vtt_path, "w", encoding="utf-8") as f:
                f.write(vtt_content)
            
            video.summary = summary
            video.timestamped_summary = timestamped_summary
        else:
            video.summary = "No speech detected in video."

        video.status = "completed"
        db.commit()

        # Cleanup audio file
        if os.path.exists(audio_path):
            os.remove(audio_path)

    except Exception as e:
        video.status = "failed"
        video.summary = f"Error during processing: {str(e)}"
        db.commit()

from jose import jwt, JWTError
from backend.core.auth import SECRET_KEY, ALGORITHM
from backend.models import User
from fastapi.security import OAuth2PasswordBearer
from starlette import status

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

@router.post("/upload", response_model=schemas.VideoProcessingResponse)
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith(('.mp4', '.avi', '.mov')):
        raise HTTPException(status_code=400, detail="Only MP4, AVI, and MOV files are supported.")

    # Ensure upload directory exists
    if not os.path.exists(settings.UPLOAD_DIR):
        os.makedirs(settings.UPLOAD_DIR)
        
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
        
    # Create database record
    video_db = models.VideoProcessing(
        filename=file.filename,
        file_path=file_path,
        status="pending",
        user_id=current_user.id
    )
    db.add(video_db)
    db.commit()
    db.refresh(video_db)
    
    # Trigger background processing
    background_tasks.add_task(process_video_task, video_db.id, file_path, db)
    
    return video_db

@router.get("/", response_model=List[schemas.VideoProcessingResponse])
def list_videos(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(models.VideoProcessing).filter(models.VideoProcessing.user_id == current_user.id).order_by(models.VideoProcessing.created_at.desc()).all()

@router.get("/{video_id}", response_model=schemas.VideoProcessingResponse)
def get_video(
    video_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    video = db.query(models.VideoProcessing).filter(
        models.VideoProcessing.id == video_id,
        models.VideoProcessing.user_id == current_user.id
    ).first()
    
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return video
