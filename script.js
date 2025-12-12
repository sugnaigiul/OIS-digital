document.addEventListener('DOMContentLoaded', () => {
    const playButton = document.getElementById('playButton');
    const audioPlayer = document.getElementById('audioPlayer');

    const offImage = 'media/Switch-OFF.png';
    const onImage = 'media/Switch-ON.png';

    const playlist = [
        'album/01.mp3',
        'album/02.mp3',
        'album/03.mp3',
        'album/04.mp3',
        'album/05.mp3',
        'album/06.mp3',
        'album/07.mp3',
        'album/08.mp3',
        'album/09.mp3',
        'album/10.mp3',
        'album/11.mp3'
    ];

    let currentSongIndex = 0;
    let isPlaying = false;

    function playNextSong() {
        if (!isPlaying) return;
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        audioPlayer.src = playlist[currentSongIndex];
        audioPlayer.play().catch(error => console.error("Erreur de lecture audio:", error));
    }

    function startPlayback() {
        if (isPlaying) return;
        isPlaying = true;
        playButton.src = onImage;
        audioPlayer.src = playlist[currentSongIndex];
        audioPlayer.play().catch(error => console.error("Erreur de lecture audio:", error));
    }

    function stopPlayback() {
        if (!isPlaying) return;
        isPlaying = false;
        playButton.src = offImage;
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        // On ne change pas l'index pour reprendre là où on s'est arrêté si on appuie à nouveau
    }

    // Événement pour enchaîner les musiques
    audioPlayer.addEventListener('ended', playNextSong);

    // Événements pour le bureau
    playButton.addEventListener('mousedown', startPlayback);
    playButton.addEventListener('mouseup', stopPlayback);
    playButton.addEventListener('mouseleave', stopPlayback); // Arrête si la souris quitte le bouton

    // Événements pour le mobile
    playButton.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Empêche les événements de souris simulés
        startPlayback();
    });
    playButton.addEventListener('touchend', stopPlayback);
    playButton.addEventListener('touchcancel', stopPlayback);
});
