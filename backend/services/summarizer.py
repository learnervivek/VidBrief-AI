import re
import datetime
from transformers import pipeline
from typing import List, Dict, Any

summary_pipeline = None

def get_summarizer():
    global summary_pipeline
    if summary_pipeline is None:
        # distilbart-cnn-12-6 is an excellent fast model for summarization
        summary_pipeline = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")
    return summary_pipeline

def split_into_sentences(text: str) -> list[str]:
    """Simple regex-based sentence splitter."""
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if len(s.strip()) > 5]

def summarize_text(text: str) -> str:
    """
    Summarize extracted video transcript.
    Generates a concise short summary followed by bullet points.
    """
    summarizer = get_summarizer()
    
    if not text or len(text.strip()) < 50:
        return "Transcript too short to summarize."

    # Prevent extremely large context sizes
    max_chars = 3000 
    truncated_text = text[:max_chars]
        
    try:
        # Generate a reasonably long summary to extract both paragraph and bullets
        result = summarizer(truncated_text, max_length=150, min_length=50, do_sample=False)
        raw_summary = result[0]['summary_text']
        
        # Format the output into Short Summary and Bullet Points
        sentences = split_into_sentences(raw_summary)
        
        if len(sentences) <= 1:
            return f"**Short Summary:**\n{raw_summary}"
            
        # First 1-2 sentences form the short summary
        short_summary_count = min(2, max(1, len(sentences) // 2))
        short_summary = " ".join(sentences[:short_summary_count])
        
        # Remaining sentences form the bullet points
        bullet_points = sentences[short_summary_count:]
        
        formatted_summary = f"**Short Summary:**\n{short_summary}\n\n**Key Points:**\n"
        for point in bullet_points:
            # Clean up point and format as bullet
            clean_point = re.sub(r'^[a-z]', lambda m: m.group(0).upper(), point)
            formatted_summary += f"- {clean_point}\n"
            
        return formatted_summary.strip()
        
    except Exception as e:
        raise Exception(f"Failed to summarize text: {str(e)}")

def format_timestamp(seconds: float) -> str:
    """Converts seconds to HH:MM:SS or MM:SS format."""
    td = datetime.timedelta(seconds=int(seconds))
    total_seconds = int(td.total_seconds())
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    secs = total_seconds % 60
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"

def generate_timestamped_summary(segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Groups transcript segments into meaningful chunks and summarizes each.
    """
    if not segments:
        return []

    summarizer = get_summarizer()
    timestamped_summaries = []
    
    # Group segments into ~30 second or ~50 word chunks for meaningful context
    current_chunk_text = ""
    current_chunk_start = segments[0]['timestamp'][0]
    
    chunks = []
    for seg in segments:
        text = seg.get('text', '').strip()
        if not text: continue
        
        current_chunk_text += " " + text
        
        # If chunk is long enough or we have a significant pause/topic shift
        # For simplicity, we chunk every ~500 characters or end of segments
        if len(current_chunk_text) > 500:
            chunks.append({
                "start": current_chunk_start,
                "text": current_chunk_text.strip()
            })
            current_chunk_text = ""
            current_chunk_start = seg['timestamp'][1] or current_chunk_start

    # Add last chunk
    if current_chunk_text:
        chunks.append({
            "start": current_chunk_start,
            "text": current_chunk_text.strip()
        })

    for chunk in chunks:
        try:
            # Summarize chunk concisely
            if len(chunk['text']) < 50:
                summary_text = chunk['text']
            else:
                res = summarizer(chunk['text'], max_length=50, min_length=15, do_sample=False)
                summary_text = res[0]['summary_text'].strip()
            
            timestamped_summaries.append({
                "timestamp": format_timestamp(chunk['start']),
                "seconds": int(chunk['start']),
                "text": summary_text
            })
        except:
            continue

    return timestamped_summaries
