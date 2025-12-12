document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('playButton');
    const audioPlayer = document.getElementById('audioPlayer');
    const controlsWrapper = document.getElementById('controls-wrapper');
    const timerDisplay = document.getElementById('timerDisplay');
    const speedSlider = document.getElementById('speedSlider');

    const offImage = 'media/Switch-OFF.png';
    const onImage = 'media/Switch-ON.png';
    const midwayImage = 'media/Switch-midway.png';

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

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateTimer() {
        if (isPlaying) {
            const currentTotalElapsed = sessionElapsedTime + audioPlayer.currentTime;
            timerDisplay.textContent = `${formatTime(currentTotalElapsed)} / ${formatTime(totalAlbumDuration)}`;
            animationFrameId = requestAnimationFrame(updateTimer);
        }
    }

    function playNextSong() {
        if (!isPlaying) return;
        sessionElapsedTime += audioPlayer.duration;
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        audioPlayer.src = playlist[currentSongIndex];
        audioPlayer.play().catch(error => console.error("Erreur de lecture audio:", error));
    }

    function startPlayback() {
        if (isPlaying) return;
        isPlaying = true;
        
        playButton.src = midwayImage;
        setTimeout(() => {
            if(isPlaying) playButton.src = onImage;
        }, 75);

        controlsWrapper.classList.add('visible');
        
        audioPlayer.src = playlist[currentSongIndex];
        audioPlayer.play().catch(error => console.error("Erreur de lecture audio:", error));
        
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(updateTimer);
    }

    function stopPlayback() {
        if (!isPlaying) return;
        
        playButton.src = midwayImage;
        setTimeout(() => {
            playButton.src = offImage;
        }, 75);

        isPlaying = false;
        controlsWrapper.classList.remove('visible');

        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        sessionElapsedTime = 0;
        audioPlayer.playbackRate = 1; // Réinitialise la vitesse
        speedSlider.value = 1; // Réinitialise la position du slider
        
        cancelAnimationFrame(animationFrameId);
        setTimeout(() => {
            timerDisplay.textContent = `00:00 / ${formatTime(totalAlbumDuration)}`;
        }, 400);
    }

    function handleSpeedChange() {
        audioPlayer.playbackRate = speedSlider.value;
    }

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

        // Démarrage sur le bouton
        playButton.addEventListener('mousedown', startPlayback);
        playButton.addEventListener('touchstart', e => {
            e.preventDefault();
            startPlayback();
        });

        // Arrêt n'importe où sur la page
        window.addEventListener('mouseup', stopPlayback);
        window.addEventListener('touchend', stopPlayback);
        window.addEventListener('touchcancel', stopPlayback);

        speedSlider.addEventListener('input', handleSpeedChange);
    }

    initialize();
});
