# VidBrief AI - Video Intelligence & Summarization Platform

VidBrief AI is a powerful, full-stack application that leverages state-of-the-art AI to transform long videos into concise, actionable intelligence. It features automated transcription, dual-mode summarization (high-level and timestamped), subtitle generation, and a personalized video archive.

## 🚀 Key Features

-   **Dual Summarization**: Generates both a high-level **AI Overview** and a **Timestamped Brief** for quick navigation.
-   **Interactive Timestamps**: Click any summary point to jump directly to that moment in the video player.
-   **AI Transcription**: Powered by OpenAI's Whisper model for highly accurate speech-to-text conversion.
-   **Subtitle Generation**: Automatically generates `.srt` and `.vtt` subtitles available for download.
-   **Secure Authentication**: JWT-based login and signup system for private, personalized video archives.
-   **Futuristic UI**: A high-end dashboard experience built with Next.js, Framer Motion, and Glassmorphism design principles.

---

## 🏗️ Architecture

The project follows a modern decoupled architecture:

### Frontend
-   **Framework**: Next.js (App Router) with React 19.
-   **Styling**: Tailwind CSS for responsive, modern design.
-   **Animations**: Framer Motion for smooth transitions and Lottie-react for AI-themed visuals.
-   **State Management**: React Hooks (useState, useEffect) for lightweight data handling.
-   **Icons**: Lucide React for consistent and crisp iconography.

### Backend
-   **Framework**: FastAPI (Python) for high-performance asynchronous API endpoints.
-   **Database**: SQLite with SQLAlchemy ORM for efficient data persistence.
-   **Authentication**: JWT (JSON Web Tokens) using `python-jose` and password hashing with `passlib` (Bcrypt).
-   **Processing Engine**:
    -   **MoviePy/FFmpeg**: Robust audio extraction from uploaded video files.
    -   **Whisper (Transformers)**: State-of-the-art speech-to-text transcription.
    -   **DistilBART**: Neural network for generating concise text summaries.

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
Start by cloning the project to your local machine:
```bash
git clone https://github.com/vivid-ai/video-summarizer.git
cd video-summarizer
```

### 2. Prerequisites
-   **Python 3.9+**
-   **Node.js 18+**
-   **FFmpeg**: Required for video/audio processing.

### 3. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv .venv
    source .venv/bin/activate  # On Windows: .venv\Scripts\activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    pip install "bcrypt<4.0.0" email-validator  # Critical for compatibility
    ```
4.  Start the FastAPI server:
    ```bash
    export PYTHONPATH=$PYTHONPATH:$(pwd)/.. # Ensure backend package is found
    uvicorn main:app --reload --port 8000
    ```

### Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Documentation

### Authentication
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/auth/signup` | POST | Register a new user |
| `/api/v1/auth/login` | POST | Authenticate and receive a JWT token |

### Video Processing
| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/v1/videos/upload` | POST | Upload a video for processing | Yes |
| `/api/v1/videos/` | GET | List all videos for the current user | Yes |
| `/api/v1/videos/{id}` | GET | Get the current status and results of a video | Yes |

---

## 📖 AI Processing Pipeline
1.  **Extraction**: The backend uses MoviePy/FFmpeg to strip audio from the uploaded video.
2.  **Transcription**: The audio is processed through a Whisper model to generate text with timestamps.
3.  **Summarization**:
    -   **Overview**: The entire transcript is summarized into a single cohesive paragraph.
    -   **Briefs**: Significant segments are identified and summarized into clickable timestamped points.
4.  **Finalization**: Subtitles are exported, and the user's dashboard is updated with the results.

---

## 🛡️ Security
-   Password hashing is handled via Bcrypt.
-   API endpoints are protected by JWT Bearer tokens.
-   CORS is configured to only allow verified frontend origins.
