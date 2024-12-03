let transcriptionData = null;

// File upload handling
const fileInput = document.getElementById('file-input');
const fileDropArea = document.querySelector('.file-drop-area');
const fileName = document.querySelector('.file-name');
const submitButton = document.querySelector('.primary-btn');

// Drag and drop handlers
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    fileDropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    fileDropArea.classList.add('drag-over');
}

function unhighlight(e) {
    fileDropArea.classList.remove('drag-over');
}

fileDropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    fileInput.files = files;
    updateFileName(files[0]);
}

fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
        updateFileName(e.target.files[0]);
    }
});

function updateFileName(file) {
    if (file) {
        fileName.textContent = file.name;
        submitButton.disabled = false;
    } else {
        fileName.textContent = 'No file chosen';
        submitButton.disabled = true;
    }
}

// Handle form submission
document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('file-input');
    const modelSelect = document.querySelector('input[name="model"]:checked');
    const diarization = document.getElementById('diarization');
    const punctuation = document.getElementById('punctuation');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const result = document.getElementById('result');
    const transcriptionText = document.getElementById('transcription-text');
    
    if (!fileInput.files[0]) {
        alert('Please select a file');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('model', modelSelect.value);
    formData.append('diarization', diarization.checked);
    formData.append('punctuation', punctuation.checked);

    progressContainer.style.display = 'block';
    result.style.display = 'none';
    transcriptionText.textContent = '';

    // Start progress animation
    progressFill.style.animation = 'progress 30s ease-out';
    progressFill.style.width = '0%';

    try {
        const response = await fetch('/transcribe', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        transcriptionData = await response.json();
        
        if (transcriptionData.error) {
            throw new Error(transcriptionData.error);
        }

        // Complete progress bar
        progressFill.style.width = '100%';
        progressText.textContent = 'Transcription complete!';
        
        setTimeout(() => {
            progressContainer.style.display = 'none';
            transcriptionText.textContent = transcriptionData.transcription;
            result.style.display = 'block';
        }, 500);

    } catch (error) {
        console.error('Error details:', error);
        progressText.textContent = 'Error occurred';
        progressFill.style.backgroundColor = '#ff3b30';
        alert('Error: ' + error.message);
    }
});

function downloadTranscript(format) {
    if (!transcriptionData) {
        alert('No transcription data available');
        return;
    }

    let content = '';
    let filename = `transcription.${format}`;
    let mimeType = 'text/plain';

    switch (format) {
        case 'txt':
            content = transcriptionData.transcription;
            break;
        case 'srt':
            content = convertToSRT(transcriptionData.words);
            break;
        case 'json':
            content = JSON.stringify(transcriptionData, null, 2);
            mimeType = 'application/json';
            break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function convertToSRT(words) {
    let srt = '';
    let index = 1;
    let currentLine = '';
    let startTime = '';
    
    words.forEach((word, i) => {
        if (currentLine.length + word.word.length > 80) {
            srt += `${index}\n`;
            srt += `${startTime} --> ${formatTime(word.end)}\n`;
            srt += `${currentLine.trim()}\n\n`;
            
            currentLine = word.word + ' ';
            startTime = formatTime(word.start);
            index++;
        } else if (i === 0) {
            currentLine = word.word + ' ';
            startTime = formatTime(word.start);
        } else {
            currentLine += word.word + ' ';
        }
    });

    if (currentLine) {
        srt += `${index}\n`;
        srt += `${startTime} --> ${formatTime(words[words.length - 1].end)}\n`;
        srt += `${currentLine.trim()}\n`;
    }

    return srt;
}

function formatTime(seconds) {
    const date = new Date(seconds * 1000);
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss},${ms}`;
} 