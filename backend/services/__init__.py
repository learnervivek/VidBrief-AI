# Exposes the service functions
from .video_processor import extract_audio_ffmpeg as extract_audio, extract_keyframes, process_video_optimized
from .speech_to_text import transcribe_audio
from .summarizer import summarize_text, generate_timestamped_summary
from .subtitles import generate_srt, generate_vtt
