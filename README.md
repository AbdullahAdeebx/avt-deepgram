# Audio Video Transcription Web App

A modern web application that provides high-quality audio and video transcription services using the Deepgram API. The application features a clean, user-friendly interface with drag-and-drop file upload capabilities and multiple transcription options.

## Features

- Support for both audio and video file transcription
- Modern, intuitive user interface with drag-and-drop functionality
- Real-time progress tracking
- Multiple transcription quality options:
  - Fast (Base model)
  - Enhanced
  - Premium (Nova model)
- Advanced options:
  - Speaker Detection (Diarization)
  - Smart Punctuation
- Multiple export formats:
  - Plain Text
  - SRT Subtitles
  - JSON

## Technologies Used

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript (Vanilla)
- **Backend:**
  - Python
  - Flask
- **API:**
  - Deepgram API for transcription services

## Prerequisites

- Python 3.7+
- Deepgram API key

## Installation

1. Clone the repository: 

```bash
git clone https://github.com/iAbdullahAdeeb/avt-deepgram.git
cd avt
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

3. Install the dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory and add your Deepgram API key:

```bash
DEEPGRAM_API_KEY=<your_deepgram_api_key>
```

5. Run the Flask application:

```bash
python app.py
```

6. Open your browser and navigate to `http://localhost:5000` to access the application.


## Usage

1. Upload an audio or video file by either:
   - Dragging and dropping the file into the upload area
   - Clicking "Choose File" to select a file
2. Select your desired transcription quality (Fast, Enhanced, or Premium)
3. Toggle Speaker Detection and Smart Punctuation as needed
4. Click "Transcribe" to begin the transcription process
5. Once complete, view the transcription and download it in your preferred format

## API Reference

The application uses the Deepgram API for transcription services. The following models are supported:

- `base`: Fast transcription
- `enhanced`: Improved accuracy
- `nova-2`: Highest quality transcription
