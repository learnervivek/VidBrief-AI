from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any, Dict

class VideoProcessingBase(BaseModel):
    filename: str

class VideoProcessingCreate(VideoProcessingBase):
    file_path: str

class VideoProcessingUpdate(BaseModel):
    status: Optional[str] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    timestamped_summary: Optional[List[Dict[str, Any]]] = None
    raw_transcript: Optional[List[Dict[str, Any]]] = None

class VideoProcessingResponse(VideoProcessingBase):
    id: int
    status: str
    transcript: Optional[str] = None
    summary: Optional[str] = None
    timestamped_summary: Optional[List[Dict[str, Any]]] = None
    raw_transcript: Optional[List[Dict[str, Any]]] = None
    thumbnail_path: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
