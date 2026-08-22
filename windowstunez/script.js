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

// URL elements
const urlInput = document.getElementById('urlInput');
const addUrlBtn = document.getElementById('addUrlBtn');

// Share elements
const shareBtn = document.getElementById('shareBtn');
const importBtn = document.getElementById('importBtn');
const shareModal = document.getElementById('shareModal');
const importModal = document.getElementById('importModal');
const closeShare = document.getElementById('closeShare');
const closeImport = document.getElementById('closeImport');
const shareCode = document.getElementById('shareCode');
const copyBtn = document.getElementById('copyBtn');
const importCode = document.getElementById('importCode');
const importPlaylistBtn = document.getElementById('importPlaylistBtn');

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
    const percent = Math.round((current / total) * 100);
    progressFill.style.width = percent + '%';
    uploadStatus.textContent = 'Uploading... ' + percent + '%';
}

// Hide upload progress
function hideUploadProgress() {
    uploadProgress.style.display = 'none';
    progressFill.style.width = '0%';
    uploadStatus.textContent = 'Uploading...';
}

// Process files - Sequential processing
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
    
    // Process files one at a time
    function processNext() {
        if (filesProcessed >= validFiles.length) {
            console.log('All files processed!');
            saveSongs();
            renderPlaylist();
            loadSong();
            hideUploadProgress();
            alert('Successfully added ' + validFiles.length + ' song(s) to your library!');
            return;
        }
        
        const file = validFiles[filesProcessed];
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
            
            // Process next file after a small delay
            setTimeout(processNext, 50);
        };
        
        reader.onerror = function(error) {
            console.error('Error reading ' + file.name + ':', error);
            filesProcessed++;
            setTimeout(processNext, 50);
        };
        
        try {
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error starting read for ' + file.name + ':', error);
            filesProcessed++;
            setTimeout(processNext, 50);
        }
    }
    
    processNext();
}

// Extract video ID from YouTube URL
function getYoutubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Check if URL is a direct audio file
function isDirectAudioUrl(url) {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac'];
    for (let i = 0; i < audioExtensions.length; i++) {
        if (url.toLowerCase().includes(audioExtensions[i])) {
            return true;
        }
    }
    return false;
}

// Add URL to playlist
function addUrlToPlaylist() {
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('Please paste a URL');
        return;
    }
    
    let audioUrl = null;
    let title = 'Unknown Track';
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const videoId = getYoutubeId(url);
        if (videoId) {
            // Using invidious instance (privacy-friendly YouTube proxy)
            audioUrl = 'https://inv.riverside.rocks/latest_version?id=' + videoId + '&itag=251';
            title = 'YouTube Video';
        } else {
            alert('Invalid YouTube URL');
            return;
        }
    }
    // Newgrounds
    else if (url.includes('newgrounds.com')) {
        // Try to extract direct audio link
        if (url.includes('/audio/')) {
            // Extract audio ID
            const audioMatch = url.match(/\/audio\/(\d+)/);
            if (audioMatch) {
                const audioId = audioMatch[1];
                audioUrl = 'https://audio.ngfiles.com/' + audioId + '_full.mp3';
                title = 'Newgrounds Audio';
            } else {
                alert('Could not extract audio from Newgrounds link');
                return;
            }
        } else {
            alert('Please use a direct Newgrounds audio link (e.g., newgrounds.com/audio/[id])');
            return;
        }
    }
    // Direct audio URL
    else if (isDirectAudioUrl(url)) {
        audioUrl = url;
        title = url.split('/').pop().split('.')[0];
    }
    // SoundCloud
    else if (url.includes('soundcloud.com')) {
        alert('SoundCloud support requires special setup. Please use YouTube, Newgrounds, or direct audio URLs');
        return;
    }
    // Spotify
    else if (url.includes('spotify.com')) {
        alert('Spotify requires authentication. Please use YouTube, Newgrounds, or direct audio URLs');
        return;
    }
    else {
        alert('URL type not supported. Try YouTube, Newgrounds, or direct audio file URLs');
        return;
    }
    
    if (!audioUrl) {
        alert('Could not process URL');
        return;
    }
    
    // Add song to playlist
    songs.push({
        title: title,
        artist: 'Online Source',
        url: audioUrl,
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
    });
    
    saveSongs();
    renderPlaylist();
    loadSong();
    urlInput.value = '';
    alert('Added: ' + title);
}

// Add URL button click
addUrlBtn.addEventListener('click', addUrlToPlaylist);

// Add URL on Enter key
urlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addUrlToPlaylist();
    }
});

// Upload button click
uploadBtn.addEventListener('click', function() {
    console.log('Upload button clicked');
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

// Share/Import Functions
function generateShareCode() {
    const playlistData = {
        songs: songs.map(function(song) {
            return {
                title: song.title,
                artist: song.artist,
                url: song.url
            };
        })
    };
    
    const jsonString = JSON.stringify(playlistData);
    const encoded = btoa(jsonString);
    return encoded;
}

function decodeShareCode(code) {
    try {
        const decoded = atob(code);
        const playlistData = JSON.parse(decoded);
        return playlistData;
    } catch (e) {
        return null;
    }
}

// Share button
shareBtn.addEventListener('click', function() {
    const code = generateShareCode();
    shareCode.value = code;
    shareModal.style.display = 'flex';
});

// Copy button
copyBtn.addEventListener('click', function() {
    shareCode.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(function() {
        copyBtn.textContent = 'Copy';
    }, 2000);
});

// Import button
importBtn.addEventListener('click', function() {
    importModal.style.display = 'flex';
    importCode.value = '';
});

// Import playlist
importPlaylistBtn.addEventListener('click', function() {
    const code = importCode.value.trim();
    
    if (!code) {
        alert('Please paste a share code');
        return;
    }
    
    const playlistData = decodeShareCode(code);
    
    if (!playlistData || !playlistData.songs) {
        alert('Invalid share code');
        return;
    }
    
    const songsAdded = playlistData.songs.length;
    
    playlistData.songs.forEach(function(song) {
        songs.push({
            title: song.title,
            artist: song.artist,
            url: song.url,
            image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
        });
    });
    
    saveSongs();
    renderPlaylist();
    loadSong();
    
    importModal.style.display = 'none';
    alert('Successfully imported ' + songsAdded + ' song(s)!');
});

// Close modals
closeShare.addEventListener('click', function() {
    shareModal.style.display = 'none';
});

closeImport.addEventListener('click', function() {
    importModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target === shareModal) {
        shareModal.style.display = 'none';
    }
    if (e.target === importModal) {
        importModal.style.display = 'none';
    }
});

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
