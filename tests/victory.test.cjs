const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup() {
  const events={},elements={};
  const video={currentTime:3,paused:true,ended:false,muted:false,calls:0,
    pause(){this.paused=true;},play(){this.calls++;this.paused=false;return Promise.resolve();},
    addEventListener(name,fn){events['video:'+name]=fn;}};
  elements.victoryVideo=video;
  for(const id of ['victoryVideoNotice','victoryVideoReplay','victoryVideoSound'])
    elements[id]={hidden:true,setAttribute(name,value){this[name]=value;}};
  const context={state:{screen:'victory-screen',muted:false},audioSettings:{music:.42},
    document:{hidden:false,getElementById:id=>elements[id],addEventListener(name,fn){events[name]=fn;}},
    window:{addEventListener(name,fn){events['window:'+name]=fn;}}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('victory.js','utf8')+'\nglobalThis.api={playVictoryCelebration,stopVictoryCelebration,syncVictoryAudio};',context);
  return {context,video,events,elements,api:context.api};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
test('each victory starts at zero, plays once muted, and replay restarts',()=>{
  const f=setup();f.api.playVictoryCelebration();
  assert.equal(f.video.currentTime,0);assert.equal(f.video.calls,1);assert.equal(f.video.muted,true);
  assert.equal(f.video.loop,undefined);
  f.video.currentTime=4;f.elements.victoryVideoReplay.onclick();assert.equal(f.video.currentTime,0);
});
test('leaving the victory screen stops playback',()=>{
  const f=setup();f.api.playVictoryCelebration();f.context.state.screen='title-screen';f.api.stopVictoryCelebration();
  assert.equal(f.video.paused,true);assert.equal(f.video.currentTime,0);
  f.api.playVictoryCelebration();assert.equal(f.video.calls,1);
});
test('video sound follows global mute and music volume',()=>{
  const f=setup();f.api.playVictoryCelebration();f.elements.victoryVideoSound.onclick();
  assert.equal(f.video.muted,false);assert.equal(f.video.volume,.42);
  f.context.state.muted=true;f.api.syncVictoryAudio();assert.equal(f.video.muted,true);
  assert.equal(f.elements.victoryVideoSound.disabled,true);
  f.context.state.muted=false;f.context.audioSettings.music=0;f.api.syncVictoryAudio();
  assert.equal(f.video.muted,true);assert.equal(f.elements.victoryVideoSound.disabled,true);
});
test('background pauses and foreground resumes without rewinding',()=>{
  const f=setup();f.api.playVictoryCelebration();f.video.currentTime=2;
  f.context.document.hidden=true;f.events.visibilitychange();assert.equal(f.video.paused,true);
  f.context.document.hidden=false;f.events.visibilitychange();
  assert.equal(f.video.currentTime,2);assert.equal(f.video.calls,2);
  f.video.ended=true;f.video.paused=true;f.events['video:ended']();
  f.context.document.hidden=true;f.events.visibilitychange();
  f.context.document.hidden=false;f.events.visibilitychange();assert.equal(f.video.calls,2);
});
test('a blocked play exposes a retry message without blocking navigation',async()=>{
  const f=setup();f.video.play=()=>Promise.reject(Error('not allowed'));
  f.api.playVictoryCelebration();await settle();assert.equal(f.elements.victoryVideoNotice.hidden,false);
  f.context.state.screen='title-screen';f.api.stopVictoryCelebration();assert.equal(f.video.paused,true);
});
test('a hidden victory waits until foreground before starting',()=>{
  const f=setup();f.context.document.hidden=true;f.api.playVictoryCelebration();assert.equal(f.video.calls,0);
  f.context.document.hidden=false;f.events.visibilitychange();assert.equal(f.video.calls,1);
});
