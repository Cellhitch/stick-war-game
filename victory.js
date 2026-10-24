/* Play the five-second celebration once; leave navigation immediately usable. */
const victoryVideo = document.getElementById('victoryVideo');
const victoryNotice = document.getElementById('victoryVideoNotice');
let victoryPlayback = 0;
let victoryResumePending = false;

function victoryPlaybackFailed(token) {
  if (token !== victoryPlayback || state.screen !== 'victory-screen') return;
  victoryNotice.hidden = false;
  victoryNotice.textContent = '庆祝动画暂未播放，可点击“重播庆祝”重试。';
}
async function resumeVictoryVideo(token) {
  try {
    victoryVideo.muted = true;
    await victoryVideo.play();
  } catch (_) {
    victoryPlaybackFailed(token);
  }
}
function playVictoryCelebration() {
  if (state.screen !== 'victory-screen') return;
  const token = ++victoryPlayback;
  victoryVideo.pause();
  victoryVideo.currentTime = 0;
  victoryResumePending = false;
  victoryNotice.hidden = true;
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
victoryVideo.addEventListener('error',() => victoryPlaybackFailed(victoryPlayback));
victoryVideo.addEventListener('ended',() => { victoryResumePending = false; });
document.addEventListener('visibilitychange',() => {
  if (state.screen !== 'victory-screen') return;
  if (document.hidden) {
    victoryResumePending = !victoryVideo.paused && !victoryVideo.ended;
    victoryVideo.pause();
  } else if (victoryResumePending) {
    victoryResumePending = false;
    resumeVictoryVideo(++victoryPlayback);
  }
});
window.addEventListener('pagehide',stopVictoryCelebration);
