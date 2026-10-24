const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function fixture({saved, deferred=false, fail=false}={}) {
  const elements = new Map(), events = {}, sources=[];
  let requests=0, finish;
  const pending = new Promise(resolve=>finish=resolve);
  const gain = () => ({value:0,cancelScheduledValues(){},setTargetAtTime(value){this.value=value;}});
  class Context {
    constructor(){ this.currentTime=0; this.state='running'; this.destination={}; }
    createGain(){return {gain:gain(),connect(){}};}
    createDynamicsCompressor(){return {threshold:{},knee:{},ratio:{},attack:{},release:{},connect(){}};}
    createBufferSource(){const source={connect(){},disconnect(){},start(...args){this.started=args;},stop(){this.stopped=true;}};sources.push(source);return source;}
    resume(){this.state='running';return Promise.resolve();}
    suspend(){this.state='suspended';return Promise.resolve();}
    decodeAudioData(){return Promise.resolve({duration:68.571417});}
  }
  const store = new Map(saved ? [['stickwar.audio.v1',saved]] : []);
  const document = {hidden:false,getElementById(id){
    if(!elements.has(id)) elements.set(id,{value:0,textContent:'',setAttribute(name,value){this[name]=value;},addEventListener(event,fn){this[event]=fn;}});
    return elements.get(id);
  },addEventListener(event,fn){events[event]=fn;}};
  const sandbox={state:{screen:'title-screen',muted:false},document,Date,Math,Number,JSON,Promise,
    localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},
    window:{AudioContext:Context,addEventListener(event,fn){events[event]=fn;}},
    fetch:async()=>{requests++;if(deferred) await pending;if(fail) throw Error('offline');return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)};}};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync('audio.js','utf8')+`
    globalThis.api={initializeAudioControls,unlockAudioFromGesture,startBgm,stopBgm,setMuted,syncAudioScene,
      get context(){return audioCtx;},get source(){return musicSource;},get settings(){return audioSettings;}};`,sandbox);
  sandbox.api.initializeAudioControls();
  return {api:sandbox.api,state:sandbox.state,document,elements,events,sources,store,finish,get requests(){return requests;}};
}
const settle = ()=>new Promise(resolve=>setImmediate(resolve));

test('menus are silent; a gesture starts exactly one looping music source',async()=>{
  const f=fixture();f.api.unlockAudioFromGesture();await settle();
  assert.equal(f.requests,0);
  f.state.screen='battle-screen';
  f.api.startBgm();f.api.startBgm();f.api.startBgm();await settle();
  assert.equal(f.requests,1);assert.equal(f.sources.length,1);
  assert.equal(f.sources[0].loop,true);assert.equal(f.sources[0].loopEnd,68.571417);
});
test('exiting while decoding must not start music in the menu',async()=>{
  const f=fixture({deferred:true});f.state.screen='battle-screen';f.api.unlockAudioFromGesture();
  f.state.screen='title-screen';f.api.syncAudioScene();f.finish();await settle();
  assert.equal(f.sources.length,0);
});
test('mute stops music; unmute resumes at the saved offset without fetching again',async()=>{
  const f=fixture();f.state.screen='battle-screen';f.api.unlockAudioFromGesture();await settle();
  f.api.context.currentTime=9.5;f.api.setMuted(true);
  assert.equal(f.sources[0].stopped,true);assert.equal(f.api.source,null);
  f.api.setMuted(false);await settle();
  assert.equal(f.sources.length,2);assert.equal(f.sources[1].started[1],9.5);assert.equal(f.requests,1);
});
test('background pauses the audio context; foreground resumes a single source',async()=>{
  const f=fixture();f.state.screen='battle-screen';f.api.unlockAudioFromGesture();await settle();
  f.document.hidden=true;f.events.visibilitychange();await settle();
  assert.equal(f.api.context.state,'suspended');assert.equal(f.api.source,null);
  f.document.hidden=false;f.events.visibilitychange();await settle();
  assert.equal(f.api.context.state,'running');assert.equal(f.sources.length,2);
});
test('volume preferences and mute persist; a zero music level leaves effects enabled',async()=>{
  const f=fixture({saved:JSON.stringify({music:0,effects:.3,muted:false})});
  f.state.screen='battle-screen';f.api.unlockAudioFromGesture();await settle();
  assert.equal(f.requests,0);assert.equal(f.api.settings.effects,.3);assert.equal(f.state.muted,false);
  const slider=f.elements.get('musicVolume');slider.value='70';slider.input();await settle();
  assert.equal(f.api.settings.music,.7);assert.equal(f.sources.length,1);
  f.api.setMuted(true);assert.equal(JSON.parse(f.store.get('stickwar.audio.v1')).muted,true);
});
test('failed audio loads report a recoverable status, without rejecting the game flow',async()=>{
  const f=fixture({fail:true});f.state.screen='battle-screen';f.api.unlockAudioFromGesture();await settle();
  assert.equal(f.sources.length,0);assert.match(f.elements.get('audioStatus').textContent,/重试/);
});
test('broken saved settings cannot prevent startup',()=>{
  const f=fixture({saved:'{broken'});assert.equal(f.api.settings.music,.42);
});
