# 火柴人大战 · 纸上王国

A buildless, watercolor-style turn-based browser game. Deploy the repository
root to GitHub Pages, or serve it with `python -m http.server 8000`.

## Sound

`assets/audio/paper-kingdom.mp3` is the original **Paper Kingdom March / 纸上王国进行曲**:
32 bars at 112 BPM, approximately 69 seconds, with synthesized plucked strings,
flute, bass and soft percussion. No external music or instrument samples are used
in this composition. Its circular note tails and room reflections are designed
for continuous looping. The AudioBuffer loop uses the exact 68.571417-second
musical duration instead of the MP3 container's padded duration.

Music begins after a user gesture when entering the battlefield. It pauses on
mute, leaving the battlefield, and hiding the browser tab; the playback position
is preserved. Music/effect levels and mute preference are stored locally. A
single AudioContext and compressor mix the soundtrack with the existing effects.
The existing cat samples remain unchanged, served as separate files.

To reproduce the soundtrack (requires Python, numpy, ffmpeg):

```sh
python scripts/compose_music.py
```

## Checks

```sh
node --check audio.js
node --test tests/audio.test.cjs
node --test tests/victory.test.cjs
```

The audio lifecycle tests cover repeated start requests, leaving during loading,
mute/resume, background/foreground, saved volumes and failed requests. They use
an AudioContext mock; real-device checks, especially iOS autoplay restrictions,
remain useful.

`style.css` contains presentation overrides. Game rules and combat remain in
`index.html`. No bundler or framework is required.

## Victory celebration

After the winner is determined, the results screen plays
`assets/video/victory-5s.mp4` once: the existing six watercolor soldiers celebrate
for five seconds (1280×720, H.264/AAC). The winner's name and army remain visible
above the video. Playback starts muted for mobile autoplay compatibility; the
player can enable its soundtrack with the video sound button. Its level follows
the music slider and global mute. Replay and navigation remain available if
playback is blocked or the video fails. Leaving the results screen stops the
video, and hiding the browser tab pauses it without losing playback position.
