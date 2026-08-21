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

// Load sample songs or from localStorage
function loadSongs() {
    const saved = localStorage.getItem('musicPlayerSongs');
    if (saved) {
        songs = JSON.parse(saved);
        renderPlaylist();
    }
}

// Save songs to localStorage
function saveSongs() {
    localStorage.setItem('musicPlayerSongs', JSON.stringify(songs));
}

// Upload and load songs
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            songs.push({
                title: file.name.replace(/\.[^/.]+$/, ''),
                artist: 'Uploaded Song',
                url: event.target.result,
                image: 'https://via.placeholder.com/300?text=Music'
            });
            saveSongs();
            renderPlaylist();
        };
        reader.readAsDataURL(file);
    });
    fileInput.value = '';
});

// Render playlist
function renderPlaylist() {
    playlist.innerHTML = '';
    songs.forEach((song, index) => {
        const li = document.createElement('li');
        li.className = 'playlist-item';
        if (index === currentIndex) li.classList.add('active');
        li.textContent = `${index + 1}. ${song.title}`;
        li.addEventListener('click', () => {
            currentIndex = index;
            loadSong();
            play();
        });
        playlist.appendChild(li);
    });
}

// Load song
function loadSong() {
    if (songs.length === 0) return;
    
    const song = songs[currentIndex];
    audioPlayer.src = song.url;
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    albumArt.src = song.image;
    
    updatePlaylistUI();
}

// Update playlist UI
function updatePlaylistUI() {
    document.querySelectorAll('.playlist-item').forEach((item, index) => {
        item.classList.remove('active');
        if (index === currentIndex) item.classList.add('active');
    });
}

// Play
function play() {
    if (songs.length === 0) {
        alert('Please upload songs first!');
        return;
    }
    audioPlayer.play();
    isPlaying = true;
    playBtn.textContent = '⏸ Pause';
    playBtn.classList.add('playing');
}

// Pause
function pause() {
    audioPlayer.pause();
    isPlaying = false;
    playBtn.textContent = '▶ Play';
    playBtn.classList.remove('playing');
}

// Toggle play/pause
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        pause();
    } else {
        play();
    }
});

// Next song
nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % songs.length;
    loadSong();
    if (isPlaying) play();
});

// Previous song
prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong();
    if (isPlaying) play();
});

// Update progress bar
audioPlayer.addEventListener('timeupdate', () => {
    const percentage = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.value = percentage || 0;
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
});

// Update duration
audioPlayer.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audioPlayer.duration);
});

// Seek song
progressBar.addEventListener('input', (e) => {
    const time = (e.target.value / 100) * audioPlayer.duration;
    audioPlayer.currentTime = time;
});

// Volume control
volumeControl.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value / 100;
});

// Auto play next song when current ends
audioPlayer.addEventListener('ended', () => {
    nextBtn.click();
});

// Format time (mm:ss)
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Initialize
loadSongs();
if (songs.length > 0) {
    loadSong();
} else {
    // Add sample songs
    songs = [
        {
            title: 'Sample Song 1',
            artist: 'Unknown Artist',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            image: 'https://via.placeholder.com/300?text=Song+1'
        },
        {
            title: 'Sample Song 2',
            artist: 'Unknown Artist',
            url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            image: 'https://via.placeholder.com/300?text=Song+2'
        }
    ];
    saveSongs();
    renderPlaylist();
    loadSong();
}
