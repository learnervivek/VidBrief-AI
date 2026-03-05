from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to videos
    videos = relationship("VideoProcessing", back_populates="owner")

class VideoProcessing(Base):
    __tablename__ = "video_processing"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_path = Column(String)
    status = Column(String) # pending, extracting, transcribing, summarizing, completed, failed
    transcript = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    timestamped_summary = Column(JSON, nullable=True) # List of {timestamp: str, text: str, seconds: int}
    raw_transcript = Column(JSON, nullable=True) # Full Whisper segments
    thumbnail_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # User relationship
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Temporarily nullable for existing data
    owner = relationship("User", back_populates="videos")
