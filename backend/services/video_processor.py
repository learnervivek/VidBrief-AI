import os
import cv2
import subprocess
import imageio_ffmpeg
from typing import List, Tuple

def extract_audio_ffmpeg(video_path: str, output_audio_path: str = None) -> str:
    """
    Optimized audio extraction using FFmpeg directly via subprocess.
    This is faster and more robust than most Python wrappers.
    """
    if not output_audio_path:
        base, _ = os.path.splitext(video_path)
        output_audio_path = f"{base}.wav"

    # FFmpeg command: -i (input), -ab (bitrate), -ac (channels), -ar (sample rate), -vn (no video)
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    command = [
        ffmpeg_exe, "-y", "-i", video_path,
        "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
        output_audio_path
    ]
    
    try:
        subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return output_audio_path
    except subprocess.CalledProcessError as e:
        raise Exception(f"FFmpeg audio extraction failed: {e.stderr.decode()}")

def extract_keyframes(video_path: str, output_dir: str = None, interval_seconds: int = 5) -> List[str]:
    """
    Optimized frame extraction using OpenCV.
    Captures one frame every `interval_seconds`.
    """
    if not output_dir:
        base, _ = os.path.splitext(video_path)
        output_dir = f"{base}_frames"
    
    os.makedirs(output_dir, exist_ok=True)
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception("Could not open video file with OpenCV")
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0:
        fps = 24 # Fallback
        
    frame_interval = int(fps * interval_seconds)
    frame_count = 0
    saved_frames = []
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % frame_interval == 0:
            frame_name = f"frame_{frame_count // frame_interval}.jpg"
            frame_path = os.path.join(output_dir, frame_name)
            
            # Compress for optimization (quality 70)
            cv2.imwrite(frame_path, frame, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
            saved_frames.append(frame_path)
            
        frame_count += 1
        
    cap.release()
    return saved_frames

def process_video_optimized(video_path: str) -> Tuple[str, List[str]]:
    """
    Full optimized extraction wrap.
    Returns (audio_path, list_of_frame_paths)
    """
    audio_path = extract_audio_ffmpeg(video_path)
    frame_paths = extract_keyframes(video_path)
    return audio_path, frame_paths
