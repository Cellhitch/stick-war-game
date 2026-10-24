const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync('index.html', 'utf8');
const resizeCode = html.slice(html.indexOf('function resizeCanvas()'), html.indexOf('\nwindow.addEventListener(\'resize\', refreshArenaSize)'));
function setup(dpr, width=348) {
  const ctx = {setTransform(...args) {this.transform=args;}};
  let resets=0, backingWidth=640, backingHeight=220;
  const canvas = {parentElement:{clientWidth:width},style:{},
    get width(){return backingWidth;},set width(v){backingWidth=v;resets++;ctx.imageSmoothingQuality='low';},
    get height(){return backingHeight;},set height(v){backingHeight=v;resets++;ctx.imageSmoothingQuality='low';}};
  const state={screen:'battle-screen',arenaPose:{L:{pose:'strike',ox:12}}};
  let frames=0;
  const env={canvas,ctx,state,window:{devicePixelRatio:dpr},drawArenaFrame(){frames++;}};
  vm.createContext(env);vm.runInContext(resizeCode,env);
  return {env,ctx,canvas,state,resets:()=>resets,frames:()=>frames};
}
test('canvas uses native density through 3x and restores high-quality smoothing after resize',()=>{
  for(const dpr of [1,1.25,2,2.625,3,4]){
    const {env,canvas,ctx}=setup(dpr);env.resizeCanvas();
    const ratio=Math.min(dpr,3);
    assert.equal(canvas.width,Math.round(348*ratio));assert.equal(canvas.height,Math.round(245*ratio));
    assert.equal(ctx.imageSmoothingEnabled,true);assert.equal(ctx.imageSmoothingQuality,'high');
    assert.deepEqual(ctx.transform,[canvas.width/348,0,0,canvas.height/245,0,0]);
  }
});
test('resizing preserves battle pose, skips hidden screens and avoids repeated canvas resets',()=>{
  const r=setup(3);r.env.refreshArenaSize();const resets=r.resets();
  r.env.refreshArenaSize();assert.equal(r.resets(),resets);assert.equal(r.state.arenaPose.L.pose,'strike');
  r.canvas.parentElement.clientWidth=720;r.env.refreshArenaSize();assert.equal(r.canvas.width,2160);
  assert.equal(r.ctx.imageSmoothingQuality,'high');assert.equal(r.state.arenaPose.L.ox,12);
  r.state.screen='title-screen';const frames=r.frames();r.env.refreshArenaSize();assert.equal(r.frames(),frames);
  r.canvas.parentElement.clientWidth=0;r.env.resizeCanvas();assert.equal(r.canvas.width,2160);
});
test('all six sprites remain inside the arena in both directions and every combat pose',()=>{
  const drawCode=html.slice(html.indexOf('function drawUnitSprite('),html.indexOf('/* ========== Canvas 火柴人绘制'));
  for(const [width,height] of [[290,245],[360,245],[718,320],[1030,320]]){
    let matrix=[1,0,0,1,0,0],stack=[];
    const multiply=([a,b,c,d,e,f])=>{const [A,B,C,D,E,F]=matrix;matrix=[A*a+C*b,B*a+D*b,A*c+C*d,B*c+D*d,A*e+C*f+E,B*e+D*f+F];};
    const ctx={save(){stack.push([...matrix]);},restore(){matrix=stack.pop();},
      translate(x,y){multiply([1,0,0,1,x,y]);},rotate(r){multiply([Math.cos(r),Math.sin(r),-Math.sin(r),Math.cos(r),0,0]);},scale(x,y){multiply([x,0,0,y,0,0]);},
      beginPath(){},ellipse(){},fill(){},fillText(){},drawImage(img,x,y,w,h){
        const [a,b,c,d,e,f]=matrix;
        for(const [px,py] of [[x,y],[x+w,y],[x,y+h],[x+w,y+h]]){
          const X=a*px+c*py+e,Y=b*px+d*py+f;
          assert.ok(X>=4.99&&X<=width-4.99,`x=${X} at ${width}`);
          assert.ok(Y>=4.99&&Y<=height-4.99,`y=${Y} at ${height}`);
        }
      }};
    const names=['blue_king','red_king','spear_cone','spear_bowl','sword_tall','sword_blue'];
    const sprites=Object.fromEntries(names.map(n=>[n,{complete:true,naturalWidth:1024,naturalHeight:1536}]));
    const env={ctx,canvas:{clientWidth:width,clientHeight:height},SPRITES:sprites,drawStick(){assert.fail('Unexpected fallback');}};
    vm.createContext(env);vm.runInContext(drawCode,env);
    for(const sprite of names)for(const facing of [1,-1])for(const pose of ['idle','windup','strike','hurt','dead'])for(const ox of [-70,0,70]){
      env.drawUnitSprite(width*(facing===1?.28:.72),height-56,facing,{sprite,isKing:sprite.endsWith('king')},pose,ox);
    }
  }
});
