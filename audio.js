/* One AudioContext for music and effects. Music starts only after a gesture. */
let audioCtx = null;
let masterGain = null; // Effects bus (legacy SFX use this name).
let musicGain = null;
let musicSource = null;
let musicBuffer = null;
let musicLoad = null;
let musicOffset = 0;
let musicStartedAt = 0;
let audioUnlocked = false;
let musicRetryAfter = 0;
const AUDIO_KEY = 'stickwar.audio.v1';
const MUSIC_SECONDS = 68.571417;
let audioSettings = { music: .42, effects: .55, muted: false };
try {
  const saved = JSON.parse(localStorage.getItem(AUDIO_KEY) || 'null');
  if (saved && typeof saved === 'object') {
    for (const key of ['music','effects']) {
      if (typeof saved[key] === 'number' && Number.isFinite(saved[key]))
        audioSettings[key] = Math.max(0,Math.min(1,saved[key]));
    }
    audioSettings.muted = saved.muted === true;
  }
} catch (_) { /* Storage can be unavailable in private browsing. */ }

function saveAudioSettings() {
  try { localStorage.setItem(AUDIO_KEY,JSON.stringify(audioSettings)); } catch (_) {}
}
function audioStatus(text) {
  document.getElementById('audioStatus').textContent = text;
}
function musicWanted() {
  return audioUnlocked && state.screen === 'battle-screen' && !document.hidden &&
    !state.muted && audioSettings.music > 0;
}
function ensureAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error('Web Audio unavailable');
    audioCtx = new AudioContext();
    const limiter = audioCtx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 12;
    limiter.ratio.value = 5;
    limiter.attack.value = .004;
    limiter.release.value = .16;
    limiter.connect(audioCtx.destination);
    masterGain = audioCtx.createGain();
    musicGain = audioCtx.createGain();
    masterGain.connect(limiter);
    musicGain.connect(limiter);
    applyAudioLevels();
  }
  if (audioCtx.state === 'suspended' && !document.hidden)
    audioCtx.resume().catch(() => audioStatus('点击声音按钮启用音乐'));
  return audioCtx;
}
function applyAudioLevels() {
  if (!audioCtx) return;
  const muted = state.muted || document.hidden;
  const time = audioCtx.currentTime;
  for (const [bus,value] of [[masterGain,audioSettings.effects],[musicGain,audioSettings.music*.55]]) {
    bus.gain.cancelScheduledValues(time);
    bus.gain.setTargetAtTime(muted ? 0 : value,time,.035);
  }
}
function refreshMuteButton() {
  const btn = document.getElementById('muteBtn');
  btn.textContent = state.muted ? '🔇' : '♫';
  btn.setAttribute('aria-pressed',String(state.muted));
  btn.setAttribute('aria-label',state.muted ? '取消静音' : '静音');
  btn.title = state.muted ? '取消静音' : '静音';
}
function setMuted(muted) {
  state.muted = !!muted;
  audioSettings.muted = state.muted;
  saveAudioSettings();
  refreshMuteButton();
  applyAudioLevels();
  syncAudioScene();
}
function stopBgm() {
  if (!musicSource) return;
  const source = musicSource;
  musicOffset = (musicOffset + audioCtx.currentTime - musicStartedAt) % source.loopEnd;
  musicSource = null;
  // A short gain ramp prevents clicks on mute, exit, or backgrounding.
  const time = audioCtx.currentTime;
  musicGain.gain.cancelScheduledValues(time);
  musicGain.gain.setTargetAtTime(0,time,.015);
  source.stop(time+.08);
}
async function startBgm() {
  if (!musicWanted() || musicSource || Date.now() < musicRetryAfter) return;
  try {
    ensureAudio();
    if (!musicBuffer) {
      audioStatus('正在准备音乐…');
      if (!musicLoad) musicLoad = fetch('assets/audio/paper-kingdom.mp3')
        .then(response => {
          if (!response.ok) throw new Error('Music request failed');
          return response.arrayBuffer();
        })
        .then(bytes => audioCtx.decodeAudioData(bytes))
        .then(buffer => { musicBuffer = buffer; })
        .finally(() => { musicLoad = null; });
      await musicLoad;
    }
    // A menu transition/mute while the file loads must not start playback.
    if (!musicWanted() || musicSource) return;
    if (audioCtx.state !== 'running') {
      await audioCtx.resume();
      if (audioCtx.state !== 'running') {
        audioStatus('点击声音按钮启用音乐');
        return;
      }
    }
    if (!musicWanted() || musicSource) return;
    const source = audioCtx.createBufferSource();
    source.buffer = musicBuffer;
    source.loop = true;
    source.loopStart = 0;
    source.loopEnd = Math.min(MUSIC_SECONDS,musicBuffer.duration);
    source.connect(musicGain);
    source.onended = () => source.disconnect();
    musicOffset %= source.loopEnd;
    musicStartedAt = audioCtx.currentTime;
    musicSource = source;
    applyAudioLevels();
    source.start(0,musicOffset);
    audioStatus('正在播放 · 纸上王国进行曲');
  } catch (_) {
    musicRetryAfter = Date.now()+5000;
    audioStatus('音乐暂不可用，可点击声音按钮重试');
  }
}
function syncAudioScene() {
  applyAudioLevels();
  if (musicWanted()) startBgm();
  else {
    stopBgm();
    audioStatus(state.muted ? '已静音' : audioSettings.music === 0 ? '音乐已关闭' : '进入战场后播放');
  }
}
function unlockAudioFromGesture() {
  try {
    audioUnlocked = true;
    ensureAudio();
    syncAudioScene();
  } catch (_) { audioStatus('此浏览器暂不支持游戏声音'); }
}
function initializeAudioControls() {
  state.muted = audioSettings.muted;
  refreshMuteButton();
  for (const key of ['music','effects']) {
    const slider = document.getElementById(key+'Volume');
    const output = document.getElementById(key+'VolumeValue');
    slider.value = Math.round(audioSettings[key]*100);
    output.value = slider.value+'%';
    slider.addEventListener('input',() => {
      audioSettings[key] = Number(slider.value)/100;
      output.value = slider.value+'%';
      saveAudioSettings();
      unlockAudioFromGesture();
    });
  }
  document.getElementById('muteBtn').onclick = () => {
    musicRetryAfter = 0;
    unlockAudioFromGesture();
    setMuted(!state.muted);
  };
  for (const event of ['pointerdown','keydown'])
    document.addEventListener(event,unlockAudioFromGesture,{passive:true});
  document.addEventListener('visibilitychange',() => {
    syncAudioScene();
    if (document.hidden && audioCtx) audioCtx.suspend().catch(()=>{});
  });
  window.addEventListener('pagehide',stopBgm);
  window.addEventListener('pageshow',syncAudioScene);
}
