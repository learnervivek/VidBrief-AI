import math
from typing import List, Dict, Any

def format_timestamp_srt(seconds: float) -> str:
    """Formats seconds to SRT timestamp: HH:MM:SS,ms"""
    hours = math.floor(seconds / 3600)
    minutes = math.floor((seconds % 3600) / 60)
    secs = math.floor(seconds % 60)
    millis = math.floor((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def format_timestamp_vtt(seconds: float) -> str:
    """Formats seconds to VTT timestamp: HH:MM:SS.ms"""
    hours = math.floor(seconds / 3600)
    minutes = math.floor((seconds % 3600) / 60)
    secs = math.floor(seconds % 60)
    millis = math.floor((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"

def generate_srt(segments: List[Dict[str, Any]]) -> str:
    """Generates SRT subtitle content from Whisper segments."""
    srt_content = ""
    for i, segment in enumerate(segments):
        start = segment['timestamp'][0]
        end = segment['timestamp'][1] or start + 1.0 # Fallback if end is None
        text = segment['text'].strip()
        
        srt_content += f"{i + 1}\n"
        srt_content += f"{format_timestamp_srt(start)} --> {format_timestamp_srt(end)}\n"
        srt_content += f"{text}\n\n"
    return srt_content

def generate_vtt(segments: List[Dict[str, Any]]) -> str:
    """Generates WebVTT subtitle content from Whisper segments."""
    vtt_content = "WEBVTT\n\n"
    for i, segment in enumerate(segments):
        start = segment['timestamp'][0]
        end = segment['timestamp'][1] or start + 1.0
        text = segment['text'].strip()
        
        vtt_content += f"{format_timestamp_vtt(start)} --> {format_timestamp_vtt(end)}\n"
        vtt_content += f"{text}\n\n"
    return vtt_content
