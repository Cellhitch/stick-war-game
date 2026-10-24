"""Render the original, seamlessly repeating 'Paper Kingdom March'.

Requires Python + numpy and ffmpeg. No samples or third-party compositions.
Run from the repository root: python scripts/compose_music.py
"""
from pathlib import Path
import subprocess
import tempfile
import wave
import numpy as np

SR, BPM, BARS = 24000, 112, 32
N = round(SR * 60 / BPM * 4 * BARS)
BEAT = N / SR / (4 * BARS)
mix = np.zeros((N, 2), dtype=np.float64)
rng = np.random.default_rng(414)

def add(signal, beat, gain, pan=0):
    indices = (round(beat * BEAT * SR) + np.arange(len(signal))) % N
    # Wrap note releases into the opening: the loop has no artificial fade.
    np.add.at(mix[:, 0], indices, signal * gain * np.sqrt((1-pan)/2))
    np.add.at(mix[:, 1], indices, signal * gain * np.sqrt((1+pan)/2))

def tone(midi, beats, kind='pluck'):
    duration = beats * BEAT
    t = np.arange(round((duration + .28) * SR)) / SR
    f = 440 * 2 ** ((midi - 69) / 12)
    release = np.clip((duration + .28 - t) / .28, 0, 1)
    if kind == 'flute':
        phase = 2*np.pi*f*t + .015*np.sin(2*np.pi*4.5*t)
        sound = np.sin(phase) + .13*np.sin(phase*2) + .035*np.sin(phase*3)
        env = np.minimum(t/.055, 1) * release * np.exp(-t*.25)
    elif kind == 'bass':
        sound = np.sin(2*np.pi*f*t) + .2*np.sin(4*np.pi*f*t)
        env = (1-np.exp(-t*90))*np.exp(-t*3)*release
    else:
        sound = sum(np.sin(2*np.pi*f*k*t)*np.exp(-t*k*1.5)/k**1.7 for k in range(1,6))
        env = (1-np.exp(-t*250))*np.exp(-t*4.3)*release
    return sound*env

# Eight-bar harmony, four orchestrated phrases; C major, gently marching.
chords = [(48,52,55),(45,48,52),(41,45,48),(43,47,50),
          (40,43,47),(45,48,52),(42,45,50),(43,47,50)]
melody = [
    [(72,1),(76,.5),(79,.5),(76,1),(74,1)],
    [(72,1.5),(69,.5),(72,1),(76,1)],
    [(77,1),(76,.5),(74,.5),(72,1),(69,1)],
    [(71,1),(74,1),(79,1.5),(74,.5)],
    [(76,1),(79,.5),(83,.5),(79,1),(76,1)],
    [(81,1.5),(79,.5),(76,1),(72,1)],
    [(74,1),(77,.5),(76,.5),(74,1),(69,1)],
    [(71,1),(74,1),(67,1),(71,1)],
]
for bar in range(BARS):
    chord = chords[bar % 8]
    phrase = bar // 8
    # Lute-like arpeggio, separated in stereo from the melody.
    for step, degree in enumerate([0,2,1,2,0,1,2,1]):
        add(tone(chord[degree]+12,.45),bar*4+step*.5,.12 if step%2==0 else .085,-.3)
    for beat in (0,2):
        add(tone(chord[0] if beat==0 else chord[0]+7,1.35,'bass'),bar*4+beat,.17,.05)
    pos = bar*4
    for note, duration in melody[bar % 8]:
        # B phrase lifts the melody; final phrase returns home.
        if phrase == 2 and bar%8 < 4:
            note += 12
        add(tone(note,duration*.82,'flute'),pos,.105 if phrase!=1 else .073,.23)
        if phrase in (1,3):
            add(tone(note-12,duration*.65),pos,.065,-.12)
        pos += duration
    for beat in range(4):
        t = np.arange(round(.22*SR))/SR
        if beat in (0,2):
            drum = np.sin(2*np.pi*(62*t+8*(1-np.exp(-t*22)))) * np.exp(-t*23) * np.minimum(t/.004,1)
            add(drum,bar*4+beat,.14,0)
        else:
            noise = rng.standard_normal(len(t))
            brush = np.concatenate(([0],np.diff(noise))) * np.exp(-t*35) * np.minimum(t/.006,1)
            add(brush,bar*4+beat,.013,.15)
        if phrase in (1,2,3):
            tap = rng.standard_normal(len(t))*np.exp(-t*65)*np.minimum(t/.003,1)
            add(tap,bar*4+beat+.5,.008,-.2)

# Small circular room reflections preserve the exact loop boundary.
dry = mix.copy()
for delay, gain in [(.071,.11),(.139,.075),(.227,.045)]:
    mix += np.roll(dry[:, ::-1],round(delay*SR),axis=0)*gain
mix = np.tanh(mix*1.1)
mix *= .78 / np.max(np.abs(mix))
out = Path('assets/audio')
out.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory() as temp:
    wav = Path(temp)/'paper-kingdom.wav'
    with wave.open(str(wav),'wb') as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes((mix*32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(wav),'-ar','24000',
                    '-codec:a','libmp3lame','-b:a','56k',
                    '-metadata','title=Paper Kingdom March',
                    '-metadata','artist=Stick War Game — Original Soundtrack',
                    str(out/'paper-kingdom.mp3')],check=True)
print(f'{N/SR:.6f}s / {BPM} BPM / {BARS} bars / peak {np.max(np.abs(mix)):.3f}')
