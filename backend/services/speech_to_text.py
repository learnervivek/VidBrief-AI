import os
import re
import imageio_ffmpeg
from transformers import pipeline

# Add bundled ffmpeg to PATH so transformers can find it
ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
ffmpeg_dir = os.path.dirname(ffmpeg_exe)
if ffmpeg_dir not in os.environ["PATH"]:
    os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ["PATH"]

# Lazy initialization
stt_pipeline = None

def clean_transcript(text: str) -> str:
    """
    Remove filler words and excessive punctuation from transcript.
    """
    # List of common English filler words
    fillers = [
        r'\bum\b', r'\bah\b', r'\ber\b', r'\buh\b', r'\blike\b', 
        r'\byou\s+know\b', r'\bi\s+mean\b', r'\bactually\b', r'\bbasically\b'
    ]
    
    cleaned = text
    for filler in fillers:
        # Case insensitive replacement
        cleaned = re.sub(filler, '', cleaned, flags=re.IGNORECASE)
    
    # Remove excessive spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    
    # Capitalize first letter if it's not
    if cleaned and not cleaned[0].isupper():
        cleaned = cleaned[0].upper() + cleaned[1:]
        
    return cleaned

def transcribe_audio(audio_path: str) -> tuple[str, list]:
    """
    Transcribes audio using a local HuggingFace Whisper model.
    Returns a tuple of (full_cleaned_text, segments_list).
    """
    global stt_pipeline
    if stt_pipeline is None:
        # Using whisper-tiny for faster execution. 
        # chunk_length_s=30 is standard for Whisper to process long files.
        stt_pipeline = pipeline(
            "automatic-speech-recognition", 
            model="openai/whisper-tiny",
            chunk_length_s=30,
            stride_length_s=5
        )
    
    try:
        # For long audio, we use the internal chunking of the pipeline
        # return_timestamps=True returns a list of segments with 'timestamp' key
        result = stt_pipeline(audio_path, batch_size=8, return_timestamps=True)
        raw_text = result.get("text", "")
        segments = result.get("chunks", [])
        
        # Post-process to remove filler words
        cleaned_text = clean_transcript(raw_text)
        
        return cleaned_text, segments
    except Exception as e:
        raise Exception(f"Failed to transcribe audio: {str(e)}")
