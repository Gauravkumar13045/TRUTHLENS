# TruthLens

**AI-powered video fact-checking.** Paste a video URL, get a timestamped transcript and a claim-by-claim verdict report — automatically.

TruthLens transcribes spoken content from a video, extracts factual claims from it, and cross-checks each claim using an LLM, returning a structured verdict (True / False / Misleading / Partially True / Not Verifiable) with a confidence score and reasoning for every claim.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Known Limitations](#known-limitations)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [License](#license)

---

## How It Works

```
Video URL
   │
   ▼
yt-dlp ──► downloads best available audio
   │
   ▼
ffmpeg ──► converts audio to 16kHz mono WAV
   │
   ▼
faster-whisper ──► transcribes audio into timestamped segments
   │
   ▼
Gemini (2.5 Flash) ──► analyzes transcript, extracts claims, assigns verdicts
   │
   ▼
React frontend ──► renders video, transcript, and verdict report
```

## Features

- 🔗 **URL-based ingestion** — supports YouTube (watch, shorts, live, embed links); platform detection also recognizes Instagram, TikTok, Vimeo, and X/Twitter URLs
- 🎙️ **Local, offline transcription** via `faster-whisper` — no audio ever leaves your machine during transcription
- ⚖️ **Structured claim verification** — every factual claim in the transcript gets an individual verdict, confidence score, and explanation
- 📊 **Overall verdict + confidence** for the video as a whole, alongside a per-claim breakdown
- 🖥️ **Two-pane review UI** — video/transcript on one side, verdict report on the other, with a live timestamped transcript view

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS |
| Backend | Flask, Flask-CORS |
| Video/audio extraction | yt-dlp, ffmpeg |
| Speech-to-text | faster-whisper (`base`, CPU, int8) |
| Claim analysis | Google Gemini API (`gemini-2.5-flash`) |
| Config | python-dotenv |

## Project Structure

```
truthlens/
├── backend/
│   ├── app.py              # Flask API — transcription + analysis pipeline
│   ├── temp/                # Scratch directory for downloaded/converted audio
│   └── .env                 # GEMINI_API_KEY (not committed)
└── frontend/
    └── src/
        └── Dashboard.jsx    # Main UI — URL input, video player, verdict report
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- [ffmpeg](https://ffmpeg.org/download.html) installed and available on your system `PATH`
- A [Gemini API key](https://ai.google.dev/)

### Backend Setup

```bash
cd backend

# create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# install dependencies
pip install flask flask-cors yt-dlp faster-whisper python-dotenv google-genai

# add your Gemini API key
echo GEMINI_API_KEY=your_key_here > .env

# run the server
python app.py
```

The API will be available at `http://127.0.0.1:5000`.

> **Note:** the first run downloads the Whisper `base` model — this may take a minute depending on your connection.

### Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

The app will be available at `http://localhost:5173` (or whichever port Vite/CRA assigns).

## Environment Variables

Create a `.env` file inside `backend/`:

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | API key for Google Gemini, used for claim analysis |

## API Reference

### `GET /`
Health check.

**Response**
```
Backend is running
```

### `POST /transcribe`

Downloads the audio from a video URL, transcribes it, and runs claim analysis.

**Request body**
```json
{
  "url": "https://youtube.com/watch?v=..."
}
```

**Success response — `200`**
```json
{
  "success": true,
  "title": "Video title",
  "transcript": [
    { "id": 1, "start": 0.0, "end": 3.42, "text": "..." }
  ],
  "analysis": {
    "summary": "...",
    "overallVerdict": "Misleading",
    "confidence": 78,
    "claims": [
      {
        "claim": "...",
        "verdict": "False",
        "confidence": 92,
        "reason": "..."
      }
    ]
  }
}
```

**Error response — `400` / `500`**
```json
{
  "success": false,
  "message": "Description of what went wrong"
}
```

### `GET /gemini-test`

Simple connectivity check against the Gemini API.

**Response**
```json
{ "response": "Hello from Gemini" }
```

## Known Limitations

- **YouTube bot detection.** `yt-dlp` may occasionally get blocked with a `429` or "Sign in to confirm you're not a bot" error, since this pipeline makes unauthenticated requests. See [Troubleshooting](#troubleshooting) below.
- **CPU-only transcription.** The Whisper model runs on `base`/CPU by default for portability — larger videos will take proportionally longer. Swap in a GPU-enabled `compute_type` if you have CUDA available.
- **No persistent storage.** Transcripts and analyses are not saved to a database; each request is processed and returned fresh.
- **Single video at a time.** There's no queueing — concurrent requests will contend for the same Whisper model instance.
- **File upload path is not yet wired.** The frontend has UI hooks for local file uploads (`inputMode: "file"`), but there's no corresponding upload endpoint on the backend yet — URL-based input is the only supported flow today.

## Troubleshooting

**`HTTP Error 429` / "Sign in to confirm you're not a bot"**
YouTube is rate-limiting or bot-checking the request. Authenticate `yt-dlp` with browser cookies:

```python
ydl_opts = {
    "format": "bestaudio/best",
    "outtmpl": "temp/%(id)s.%(ext)s",
    "noplaylist": True,
    "cookiefile": "cookies.txt",   # exported via a browser extension
}
```

If using `cookiesfrombrowser` instead, fully close the browser first — Chromium-based browsers lock their cookie database while running, which causes `Could not copy Chrome cookie database` errors.

**Stale files accumulating in `temp/`**
Only the original download is deleted after transcription; the converted `.wav` file is not currently cleaned up. Add a cleanup step after the Gemini call to remove `wav_file`.

**No JavaScript runtime found (yt-dlp warning)**
Install [Deno](https://deno.land) so `yt-dlp` can evaluate YouTube's player JS for more reliable format extraction.

## Roadmap

- [ ] Wire up local file upload as an alternative to URL input
- [ ] Clean up temporary `.wav` files after each request
- [ ] Persist transcripts/analyses (database-backed history)
- [ ] Support additional platforms end-to-end (Instagram, TikTok, X)
- [ ] Queue-based processing for concurrent requests
- [ ] GPU-accelerated transcription option

## License

This project is currently unlicensed — add a `LICENSE` file to specify usage terms before distributing.