const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const volumeControl = document.getElementById('volumeControl');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const playlist = document.getElementById('playlist');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const albumArt = document.getElementById('albumArt');

let songs = [];
let currentIndex = 0;
let isPlaying = false;

// Initialize
function init() {
    loadSongs();
    if (songs.length === 0) {
        addSampleSongs();
    }
    if (songs.length > 0) {
        loadSong();
        renderPlaylist();
    }
    setupEventListeners();
}

function setupEventListeners() {
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileSelect);
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', previousSong);
    nextBtn.addEventListener('click', nextSong);
    progressBar.addEventListener('change', seek);
    progressBar.addEventListener('input', updateProgress);
    volumeControl.addEventListener('change', setVolume);
    audioPlayer.addEventListener('timeupdate', updateTime);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    audioPlayer.addEventListener('ended', nextSong);
}

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

function saveSongs() {
    localStorage.setItem('windowstunezSongs', JSON.stringify(songs));
}

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

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    files.forEach(file => {
        if (file.type.startsWith('audio/')) {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                songs.push({
                    title: file.name.replace(/\.[^/.]+$/, ''),
                    artist: 'Uploaded Song',
                    url: event.target.result,
                    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop'
                });
                
                saveSongs();
                renderPlaylist();
                
                if (songs.length === 1) {
                    currentIndex = 0;
                    loadSong();
                }
            };
            
            reader.onerror = () => {
                console.error('Error reading file');
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    fileInput.value = '';
}

function renderPlaylist() {
    playlist.innerHTML = '';
    
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'playlist-item';
        if (index === currentIndex) {
            li.classList.add('active');
        }
        li.textContent = `${index + 1}. ${song.title}`;
        li.addEventListener('click', () => {
            currentIndex = index;
            loadSong();
            play();
        });
        playlist.appendChild(li);
    });
}

function loadSong() {
    if (songs.length === 0) return;
    
    const song = songs[currentIndex];
    audioPlayer.src = song.url;
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    albumArt.src = song.image;
    
    updatePlaylistUI();
}

function updatePlaylistUI() {
    document.querySelectorAll('.playlist-item').forEach((item, index) => {
        item.classList.remove('active');
        if (index === currentIndex) {
            item.classList.add('active');
        }
    });
}

function togglePlay() {
    if (songs.length === 0) {
        alert('Please upload songs first!');
        return;
    }
    
    if (isPlaying) {
        pause();
    } else {
        play();
    }
}

function play() {
    audioPlayer.play();
    isPlaying = true;
    updatePlayButton();
}

function pause() {
    audioPlayer.pause();
    isPlaying = false;
    updatePlayButton();
}

function updatePlayButton() {
    if (isPlaying) {
        playBtn.classList.add('playing');
        playBtn.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    } else {
        playBtn.classList.remove('playing');
        playBtn.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    }
}

function nextSong() {
    if (songs.length === 0) return;
    currentIndex = (currentIndex + 1) % songs.length;
    loadSong();
    if (isPlaying) play();
}

function previousSong() {
    if (songs.length === 0) return;
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong();
    if (isPlaying) play();
}

function seek() {
    const time = (progressBar.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = time;
}

function updateProgress() {
    const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = percentage || 0;
}

function updateTime() {
    updateProgress();
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
}

function updateDuration() {
    durationEl.textContent = formatTime(audioPlayer.duration);
}

function setVolume() {
    audioPlayer.volume = volumeControl.value / 100;
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Start the app
init();
