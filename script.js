document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('playButton');
    const audioPlayer = document.getElementById('audioPlayer');
    const timerDisplay = document.getElementById('timerDisplay');

    const offImage = 'media/Switch-OFF.png';
    const onImage = 'media/Switch-ON.png';
    const midwayImage = 'media/Switch-midway.png'; // Nouvelle image

    const playlist = [
        'album/01.mp3', 'album/02.mp3', 'album/03.mp3', 'album/04.mp3', 
        'album/05.mp3', 'album/06.mp3', 'album/07.mp3', 'album/08.mp3', 
        'album/09.mp3', 'album/10.mp3', 'album/11.mp3'
    ];

    let currentSongIndex = 0;
    let isPlaying = false;
    let totalAlbumDuration = 0;
    let sessionElapsedTime = 0;
    let animationFrameId;

    // --- Helper Functions ---
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // --- Core Logic ---
    function updateTimer() {
        if (isPlaying) {
            const currentTotalElapsed = sessionElapsedTime + audioPlayer.currentTime;
            timerDisplay.textContent = `${formatTime(currentTotalElapsed)} / ${formatTime(totalAlbumDuration)}`;
            animationFrameId = requestAnimationFrame(updateTimer);
        }
    }

    function playNextSong() {
        if (!isPlaying) return;
        sessionElapsedTime += audioPlayer.duration; // Add finished song's duration
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        audioPlayer.src = playlist[currentSongIndex];
        audioPlayer.play().catch(error => console.error("Erreur de lecture audio:", error));
    }

    function startPlayback() {
        if (isPlaying) return;
        isPlaying = true;
        
        playButton.src = midwayImage; // Passage à l'image intermédiaire
        setTimeout(() => {
            if(isPlaying) playButton.src = onImage;
        }, 25); // Court délai

        timerDisplay.classList.add('visible');
        
        audioPlayer.src = playlist[currentSongIndex];
        audioPlayer.play().catch(error => console.error("Erreur de lecture audio:", error));
        
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(updateTimer);
    }

    function stopPlayback() {
        if (!isPlaying) return;
        
        playButton.src = midwayImage; // Passage à l'image intermédiaire
        setTimeout(() => {
            playButton.src = offImage;
        }, 25); // Court délai

        isPlaying = false;
        timerDisplay.classList.remove('visible');

        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        sessionElapsedTime = 0;
        
        cancelAnimationFrame(animationFrameId);
        setTimeout(() => {
            timerDisplay.textContent = `00:00 / ${formatTime(totalAlbumDuration)}`;
        }, 400);
    }

    // --- Initialization ---
    function initialize() {
        const promises = playlist.map(src => {
            return new Promise((resolve, reject) => {
                const audio = new Audio();
                audio.addEventListener('loadedmetadata', () => resolve(audio.duration));
                audio.addEventListener('error', reject);
                audio.src = src;
            });
        });

        Promise.all(promises)
            .then(durations => {
                totalAlbumDuration = durations.reduce((total, duration) => total + duration, 0);
                timerDisplay.textContent = `00:00 / ${formatTime(totalAlbumDuration)}`;
            })
            .catch(error => {
                console.error("Erreur lors du chargement des métadonnées des pistes audio:", error);
                timerDisplay.textContent = "Erreur de chargement";
            });
        
        audioPlayer.addEventListener('ended', playNextSong);
        playButton.addEventListener('mousedown', startPlayback);
        playButton.addEventListener('mouseup', stopPlayback);
        playButton.addEventListener('mouseleave', stopPlayback);

        playButton.addEventListener('touchstart', e => {
            e.preventDefault();
            startPlayback();
        });
        playButton.addEventListener('touchend', stopPlayback);
        playButton.addEventListener('touchcancel', stopPlayback);
    }

    initialize();
});
