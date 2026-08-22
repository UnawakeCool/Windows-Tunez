// Elements
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const volumeControl = document.getElementById('volumeControl');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const dropZone = document.getElementById('dropZone');
const uploadProgress = document.getElementById('uploadProgress');
const uploadStatus = document.getElementById('uploadStatus');
const uploadCount = document.getElementById('uploadCount');
const progressFill = document.getElementById('progressFill');
const playlist = document.getElementById('playlist');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const albumArt = document.getElementById('albumArt');

let songs = [];
let currentIndex = 0;
let isPlaying = false;

// Load songs from localStorage
function loadSongs() {
    const saved = localStorage.getItem('windowstunezSongs');
    if (saved) {
        try {
            songs = JSON.parse(saved);
        } catch (e) {
            songs = [];
        }
    }
}

// Save songs to localStorage
function saveSongs() {
    localStorage.setItem('windowstunezSongs', JSON.stringify(songs));
}

// Add sample songs
function addSampleSongs() {
    songs = [
        {
            title: 'Sample Track 1',
            artist: 'Windows Tunez',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
        },
        {
            title: 'Sample Track 2',
            artist: 'Windows Tunez',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop'
        }
    ];
    saveSongs();
}

// Show upload progress
function showUploadProgress(current, total) {
    uploadProgress.style.display = 'block';
    uploadCount.textContent = current + '/' + total;
    progressFill.style.width = (current / total * 100) + '%';
}

// Hide upload progress
function hideUploadProgress() {
    uploadProgress.style.display = 'none';
    progressFill.style.width = '0%';
}

// Process files
function processFiles(files) {
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) return;

    let validFiles = [];
    
    // Filter audio files only
    for (let i = 0; i < fileArray.length; i++) {
        if (fileArray[i].type.startsWith('audio/')) {
            validFiles.push(fileArray[i]);
        }
    }
    
    if (validFiles.length === 0) {
        alert('No audio files found. Please select audio files (MP3, WAV, FLAC, OGG, etc.)');
        return;
    }

    console.log('Processing ' + validFiles.length + ' audio files');
    showUploadProgress(0, validFiles.length);
    
    let filesProcessed = 0;
    
    validFiles.forEach(function(file, index) {
        console.log('Reading: ' + file.name);
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            console.log('Loaded: ' + file.name);
            const songName = file.name.replace(/\.[^/.]+$/, '');
            
            songs.push({
                title: songName,
                artist: 'Uploaded Song',
                url: e.target.result,
                image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
            });
            
            filesProcessed++;
            showUploadProgress(filesProcessed, validFiles.length);
            console.log('Progress: ' + filesProcessed + '/' + validFiles.length);
            
            if (filesProcessed === validFiles.length) {
                console.log('All files processed!');
                saveSongs();
                renderPlaylist();
                loadSong();
                hideUploadProgress();
                alert('Successfully added ' + validFiles.length + ' song(s) to your library!');
            }
        };
        
        reader.onerror = function(error) {
            console.error('Error reading ' + file.name + ':', error);
            filesProcessed++;
            showUploadProgress(filesProcessed, validFiles.length);
        };
        
        reader.readAsDataURL(file);
    });
}

// Upload button click
uploadBtn.addEventListener('click', function() {
    fileInput.click();
});

// File input change
fileInput.addEventListener('change', function() {
    console.log('Files selected:', this.files.length);
    processFiles(this.files);
    this.value = '';
});

// Drag and drop
dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('drag-over');
    
    console.log('Files dropped:', e.dataTransfer.files.length);
    processFiles(e.dataTransfer.files);
});

// Prevent default drag behavior on body
document.addEventListener('dragover', function(e) {
    e.preventDefault();
});

document.addEventListener('drop', function(e) {
    e.preventDefault();
});

// Render playlist
function renderPlaylist() {
    console.log('Rendering ' + songs.length + ' songs');
    playlist.innerHTML = '';
    
    for (let i = 0; i < songs.length; i++) {
        const song = songs[i];
        const li = document.createElement('li');
        li.className = 'playlist-item';
        if (i === currentIndex) {
            li.classList.add('active');
        }
        li.textContent = (i + 1) + '. ' + song.title;
        li.onclick = function() {
            currentIndex = i;
            loadSong();
            play();
        };
        playlist.appendChild(li);
    }
}

// Load song
function loadSong() {
    if (songs.length === 0) return;
    
    const song = songs[currentIndex];
    console.log('Loading: ' + song.title);
    audioPlayer.src = song.url;
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    albumArt.src = song.image;
    
    updatePlaylistUI();
}

// Update playlist UI
function updatePlaylistUI() {
    const items = document.querySelectorAll('.playlist-item');
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('active');
        if (i === currentIndex) {
            items[i].classList.add('active');
        }
    }
}

// Play
function play() {
    if (songs.length === 0) {
        alert('Please add songs first!');
        return;
    }
    audioPlayer.play();
    isPlaying = true;
    updatePlayButton();
}

// Pause
function pause() {
    audioPlayer.pause();
    isPlaying = false;
    updatePlayButton();
}

// Toggle play/pause
playBtn.onclick = function() {
    if (isPlaying) {
        pause();
    } else {
        play();
    }
};

// Update play button
function updatePlayButton() {
    if (isPlaying) {
        playBtn.classList.add('playing');
        playBtn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    } else {
        playBtn.classList.remove('playing');
        playBtn.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    }
}

// Next song
nextBtn.onclick = function() {
    if (songs.length === 0) return;
    currentIndex = (currentIndex + 1) % songs.length;
    loadSong();
    if (isPlaying) play();
};

// Previous song
prevBtn.onclick = function() {
    if (songs.length === 0) return;
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong();
    if (isPlaying) play();
};

// Progress bar
progressBar.onchange = function() {
    const time = (this.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = time;
};

progressBar.oninput = function() {
    const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    this.value = percentage || 0;
};

// Volume
volumeControl.onchange = function() {
    audioPlayer.volume = this.value / 100;
};

// Time update
audioPlayer.ontimeupdate = function() {
    const percentage = (this.currentTime / this.duration) * 100;
    progressBar.value = percentage || 0;
    currentTimeEl.textContent = formatTime(this.currentTime);
};

// Metadata loaded
audioPlayer.onloadedmetadata = function() {
    durationEl.textContent = formatTime(this.duration);
};

// Song ended
audioPlayer.onended = function() {
    nextBtn.onclick();
};

// Format time
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const secsStr = secs < 10 ? '0' + secs : secs;
    return mins + ':' + secsStr;
}

// Initialize
loadSongs();
if (songs.length === 0) {
    addSampleSongs();
}
if (songs.length > 0) {
    loadSong();
    renderPlaylist();
}

console.log('Windows Tunez initialized');
