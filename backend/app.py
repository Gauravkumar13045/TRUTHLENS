from flask import Flask,request
from flask_cors import CORS
import yt_dlp
import os
import subprocess
from faster_whisper import WhisperModel
from werkzeug.utils import secure_filename
from google import genai
from dotenv import load_dotenv
import os
import json

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

os.makedirs("temp", exist_ok=True)
model = WhisperModel("base", device="cpu", compute_type="int8")

app = Flask(__name__)
CORS(app)


def convert_to_wav(input_file, output_file):
    subprocess.run([
    "ffmpeg",
    "-y",
    "-i",
    input_file,
    "-ar", "16000",
    "-ac", "1",
    output_file
], check=True)

@app.route("/")
def home():
    return "Backend is running"

@app.route("/transcribe", methods=["POST"])
def transcribe():

    data = request.get_json()
    url = data.get("url")

    if not url:
        return {
            "success": False,
            "message": "URL is required"
        }, 400

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": "temp/%(id)s.%(ext)s",
        "noplaylist" : True,
        "cookiesfrombrowser": ("chrome",)
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            wav_file = os.path.splitext(filename)[0] + ".wav"
            convert_to_wav(filename, wav_file)
            if not os.path.exists(wav_file):
                raise Exception("WAV conversion failed.")
            os.remove(filename)
            segments, transcription_info = model.transcribe(wav_file)
            transcript = []
            for index, segment in enumerate(segments, start=1):
                transcript.append({
                    "id": index, 
                    "start": round(segment.start, 2),
                    "end": round(segment.end, 2),
                    "text": segment.text.strip()
                })
                
            title = info.get("title")
       
        full_transcript = " ".join(
            segment["text"] for segment in transcript
        )
        print(full_transcript)
        prompt = f"""
         You are an expert AI fact-checking assistant.

         Analyze the following transcript carefully.

        Transcript:
        {full_transcript}

        Your tasks:
        1. Write a concise summary.
        2. Identify all factual claims.
        3. For each claim:
            - Give a verdict (True, False, Misleading, Partially True, or Not Verifiable).
            - Give a confidence score (0-100).
            - Explain the reason briefly.

                 Return ONLY valid JSON in this exact format:

                 {{
           "summary": "",
           "overallVerdict": "",
           "confidence": 0,
           "claims": [
             {{
               "claim": "",
               "verdict": "",
              "confidence": 0,
               "reason": ""
             }}
           ]
                 }}

         Do not include markdown.
         Do not wrap the response in ```json.
         Return only raw JSON.
         """
        
        response = client.models.generate_content(
           model="gemini-2.5-flash",
          contents=prompt,
          config={
           "response_mime_type": "application/json"
         }
        )
        print(response.text)
        analysis = json.loads(response.text)
        return {
        "success": True,
        "title": title,
        "transcript": transcript,
        "analysis": analysis
         }


    except Exception as e:
        print(e)

        return {
            "success": False,
            "message": str(e)
        }, 500
    

@app.route("/gemini-test")
def gemini_test():

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say Hello from Gemini."
    )

    return {
        "response": response.text
    }
   
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)


