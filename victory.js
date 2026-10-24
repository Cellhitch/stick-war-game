/* Play the five-second celebration once; leave navigation immediately usable. */
const victoryVideo = document.getElementById('victoryVideo');
const victoryNotice = document.getElementById('victoryVideoNotice');
const victorySoundButton = document.getElementById('victoryVideoSound');
let victoryPlayback = 0;
let victorySoundEnabled = false;
let victoryResumePending = false;

function syncVictoryAudio() {
  const unavailable = state.muted || audioSettings.music === 0;
  victoryVideo.volume = Math.max(0,Math.min(1,audioSettings.music));
  victoryVideo.muted = unavailable || !victorySoundEnabled || document.hidden;
  victorySoundButton.disabled = unavailable;
  victorySoundButton.setAttribute('aria-pressed',String(victorySoundEnabled && !unavailable));
  victorySoundButton.textContent = unavailable ? '视频声音已关闭' : victorySoundEnabled ? '关闭视频声音' : '开启视频声音';
}
function victoryPlaybackFailed(token) {
  if (token !== victoryPlayback || state.screen !== 'victory-screen') return;
  victoryNotice.hidden = false;
  victoryNotice.textContent = '庆祝动画暂未播放，可点击“重播庆祝”重试。';
}
async function resumeVictoryVideo(token) {
  try {
    await victoryVideo.play();
  } catch (_) {
    // A sound-enabled replay may be blocked by autoplay policies; retry muted.
    if (token !== victoryPlayback || state.screen !== 'victory-screen') return;
    if (!victoryVideo.muted) {
      victorySoundEnabled = false;
      syncVictoryAudio();
      try { await victoryVideo.play(); return; } catch (_) {}
    }
    victoryPlaybackFailed(token);
  }
}
function playVictoryCelebration() {
  if (state.screen !== 'victory-screen') return;
  const token = ++victoryPlayback;
  victoryVideo.pause();
  victoryVideo.currentTime = 0;
  victorySoundEnabled = false;
  victoryResumePending = false;
  victoryNotice.hidden = true;
  syncVictoryAudio();
  if (document.hidden) { victoryResumePending = true; return; }
  resumeVictoryVideo(token);
}
function stopVictoryCelebration() {
  ++victoryPlayback;
  victoryResumePending = false;
  victoryVideo.pause();
  victoryVideo.currentTime = 0;
}
document.getElementById('victoryVideoReplay').onclick = playVictoryCelebration;
victorySoundButton.onclick = () => {
  if (state.screen !== 'victory-screen' || state.muted || audioSettings.music === 0) return;
  victorySoundEnabled = !victorySoundEnabled;
  syncVictoryAudio();
  if (victoryVideo.ended || victoryVideo.paused) {
    if (victoryVideo.ended) victoryVideo.currentTime = 0;
    victoryNotice.hidden = true;
    resumeVictoryVideo(++victoryPlayback);
  }
};
victoryVideo.addEventListener('error',() => victoryPlaybackFailed(victoryPlayback));
victoryVideo.addEventListener('ended',() => { victoryResumePending = false; });
document.addEventListener('visibilitychange',() => {
  if (state.screen !== 'victory-screen') return;
  if (document.hidden) {
    victoryResumePending = !victoryVideo.paused && !victoryVideo.ended;
    victoryVideo.pause();
  } else if (victoryResumePending) {
    victoryResumePending = false;
    syncVictoryAudio();
    resumeVictoryVideo(++victoryPlayback);
  }
});
window.addEventListener('pagehide',stopVictoryCelebration);
