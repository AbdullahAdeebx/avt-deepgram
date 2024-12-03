from flask import Flask, render_template, request, jsonify
from deepgram import Deepgram
import os
from dotenv import load_dotenv
import asyncio
from functools import wraps

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Initialize Deepgram with your API key
dg_client = Deepgram(os.getenv('DEEPGRAM_API_KEY'))

# Add this helper function for async support
def async_route(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        return asyncio.run(f(*args, **kwargs))
    return wrapped

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/transcribe', methods=['POST'])
@async_route
async def transcribe():
    try:
        file = request.files['file']
        model = request.form.get('model', 'base')
        diarization = request.form.get('diarization') == 'true'
        punctuation = request.form.get('punctuation') == 'true'

        if not file:
            return jsonify({'error': 'No file uploaded'}), 400

        # Map model names to Deepgram models
        model_mapping = {
            'base': 'base',
            'enhanced': 'enhanced',
            'nova': 'nova-2'
        }

        temp_path = f'temp_{file.filename}'
        file.save(temp_path)

        try:
            with open(temp_path, 'rb') as audio:
                source = {'buffer': audio, 'mimetype': file.content_type}
                
                options = {
                    'model': model_mapping.get(model, 'base'),
                    'smart_format': True,
                    'punctuate': punctuation,
                    'diarize': diarization,
                    'utterances': True,
                    'word_timestamps': True
                }

                response = await dg_client.transcription.prerecorded(source, options)

                return jsonify({
                    'transcription': response['results']['channels'][0]['alternatives'][0]['transcript'],
                    'words': response['results']['channels'][0]['alternatives'][0]['words'],
                    'utterances': response['results']['channels'][0]['alternatives'][0].get('utterances', []),
                    'confidence': response['results']['channels'][0]['alternatives'][0]['confidence']
                })

        except Exception as e:
            return jsonify({'error': str(e)}), 500
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 