#  TruthLens

> **AI-powered fact-checking platform that analyzes YouTube videos using Whisper and Gemini AI.**

TruthLens automatically downloads the audio from a YouTube video, transcribes it using OpenAI Whisper (Faster-Whisper), extracts factual claims, and generates an AI-powered fact-check report with confidence scores and explanations.

---

## ✨ Features

- 🎥 Analyze YouTube videos
- 🎙️ High-quality speech transcription using Faster-Whisper
- 🤖 AI-powered claim extraction using Gemini
- 📋 Automatic fact-check summaries
- 📊 Confidence score for every claim
- ⚖️ Overall verdict generation
- 📝 Timestamped transcript
- ⚡ Beautiful React UI
- 🌙 Modern dark theme

---

## 📸 Preview







<p align="center">
  <img src="./frontend/public/WhatsApp Image 2026-07-03 at 7.58.02 PM.jpeg" width="1000" alt="TruthLens Preview">
</p>




---

# 🏗 Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Lucide Icons

### Backend

- Flask
- yt-dlp
- FFmpeg
- Faster Whisper
- Google Gemini API

---

# ⚙️ Architecture

```
                YouTube URL
                     │
                     ▼
                yt-dlp Download
                     │
                     ▼
             Audio Extraction
                 (FFmpeg)
                     │
                     ▼
            Faster Whisper AI
             Speech → Text
                     │
                     ▼
              Gemini AI Analysis
                     │
                     ▼
          Claims + Summary + Verdict
                     │
                     ▼
                 React Dashboard
```

---

# 📁 Project Structure

```
TruthLens
│
├── backend
│   ├── app.py
│   ├── requirements.txt
│   ├── temp/
│   └── .env
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/TRUTHLENS.git
```

```
cd TRUTHLENS
```

---

## Backend

```
cd backend
```

Create Virtual Environment

```bash
python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Install Dependencies

```bash
pip install -r requirements.txt
```

---

### Create `.env`

```
GEMINI_API_KEY=YOUR_API_KEY
```

---

### Run Backend

```bash
python app.py
```

---

## Frontend

```
cd frontend
```

Install Packages

```bash
npm install
```

Run

```bash
npm run dev
```

---

# 🔑 Environment Variables

| Variable | Description |
|-----------|-------------|
| GEMINI_API_KEY | Google Gemini API Key |

---

# 🧠 How It Works

### Step 1

User submits a YouTube URL.

↓

### Step 2

yt-dlp downloads the audio.

↓

### Step 3

FFmpeg converts audio into WAV format.

↓

### Step 4

Faster Whisper transcribes the speech.

↓

### Step 5

Gemini AI

- summarizes
- extracts claims
- verifies statements
- assigns confidence
- generates verdict

↓

### Step 6

React displays the complete AI report.

---

# 📦 API

## POST `/transcribe`

### Request

```json
{
  "url": "https://youtube.com/watch?v=..."
}
```

---

### Response

```json
{
  "success": true,
  "title": "Video Title",
  "transcript": [
    {
      "id": 1,
      "start": 0,
      "end": 5,
      "text": "..."
    }
  ],
  "analysis": {
    "summary": "...",
    "overallVerdict": "Misleading",
    "confidence": 90,
    "claims": [
      {
        "claim": "...",
        "verdict": "False",
        "confidence": 95,
        "reason": "..."
      }
    ]
  }
}
```

---

# 🎯 Future Improvements

- User Authentication
- History Dashboard
- PDF Report Export
- Multiple Language Support
- Live Video Analysis
- Audio File Upload
- Database Support
- AI Evidence Search
- Browser Extension

---

# 🤝 Contributing

Contributions, issues, and feature requests are welcome.

Feel free to fork this repository and submit a pull request.

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

**Gaurav Kumar**

GitHub:
https://github.com/Gauravkumar13045

LinkedIn:
https://www.linkedin.com/in/gaurav-kumar-620073325/

---

## ⭐ If you like this project

Please consider giving it a ⭐ on GitHub.