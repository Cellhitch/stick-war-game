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
Spectator cats retain their visual animations but make no sounds; there are no
cat samples, synthesized meows, or cat-audio network requests.

To reproduce the soundtrack (requires Python, numpy, ffmpeg):

```sh
python scripts/compose_music.py
```

## Checks

```sh
node --check audio.js
node --test tests/audio.test.cjs
node --test tests/victory.test.cjs
node --test tests/learning.test.cjs
```

The audio lifecycle tests cover repeated start requests, leaving during loading,
mute/resume, background/foreground, saved volumes and failed requests. They use
an AudioContext mock; real-device checks, especially iOS autoplay restrictions,
remain useful.

`style.css` contains presentation overrides. Game rules and combat remain in
`index.html`. No bundler or framework is required.

## Victory celebration

After the winner is determined, the results screen plays
the existing six watercolor soldiers celebrating for five seconds (1280×720).
`assets/video/victory-5s-silent.webm` (VP9) is the preferred source; browsers that
do not support it use `assets/video/victory-5s-silent.mp4` (H.264). Both files have
no audio track. This keeps the GIF-like animation smaller and avoids audio-based
autoplay restrictions. The winner's name and army remain visible above it.
Playback is muted and inline, plays once, and loads only when needed.
Replay and navigation remain available if
playback is blocked or the video fails. Leaving the results screen stops the
video, and hiding the browser tab pauses it without losing playback position.

## Pre-game learning gate

Every new game and replay starts with two checkpoints: select 弟弟 or 姐姐, then
answer two distinct questions randomly sampled from the matching 20-item bank.
弟弟 uses original Grade 2 Chinese word/pronunciation practice. 姐姐 uses original
Grade 6 mathematics revision questions, including fractions, percentages, ratio,
circles, solids and proportion, with a Shenzhen park application. The mathematics
bank covers whole-year revision rather than a specified textbook edition or term;
these are practice questions, not official Shenzhen examination items.

An incorrect response shows the correct answer and explanation. The child must
acknowledge it and answer the same question again; it does not count as passed.
Choices are reshuffled on retries. Correct responses also provide explanations.
Both answers and the final confirmation are required before the battle-mode
selector opens. Rules and replay shortcuts pass through the same gate. Progress
is kept only in memory for the current entry; nothing is sent to a server.

Edit `learning-data.js` to adjust either bank. `learning-core.js` holds the
session rules; `learning.js` and `learning.css` implement the watercolor screens.
The gate is a browser-local learning flow, not a server-enforced access control.
