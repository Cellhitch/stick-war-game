const test=require('node:test');
const assert=require('node:assert/strict');
const banks=require('../learning-data.js');
const {LearningSession,shuffleLearningItems}=require('../learning-core.js');
function rng(seed=17){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function session(role='brother'){const s=new LearningSession(banks,rng());s.chooseRole(role);s.start();return s;}
function answer(s,correct=true){s.select(correct?s.question.answer:s.question.choices.find(c=>c!==s.question.answer));s.submit();}

test('each original bank contains 20 distinct questions with four unique choices and a single answer',()=>{
  assert.deepEqual(Object.keys(banks),['brother','sister']);
  for(const bank of Object.values(banks)){
    assert.equal(bank.length,20);assert.equal(new Set(bank.map(q=>q.id)).size,20);
    assert.equal(new Set(bank.map(q=>q.prompt)).size,20);
    for(const q of bank){assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);assert.equal(q.choices.filter(c=>c===q.answer).length,1);assert.ok(q.explanation.length>15);}
  }
});
test('arithmetic answers match independently evaluated six-grade calculations',()=>{
  const expected=[`${3/4*2/3===.5?'1/2':''}`,String(5/6/(5/12)),String((3/4+1/8)*8),String(18/(3/5)),
    `${150*2/5} 页`,`${200*.8} 元`,`${40*.45} 人`,`${80*1.25} 本`,`${(150-120)/120*100}%`,`${40*3/5} 人`,
    `${12/6}∶${18/6}`,`${5*1000/100} 米`,`${2*3.14*3} 厘米`,`${3.14*(10/2)**2} 平方厘米`,`${2**2} 倍`,
    `${12*5} 立方厘米`,`${90/3} 立方厘米`,`${3**3} 立方厘米`,'反比例','1/8'];
  banks.sister.forEach((q,i)=>assert.equal(q.answer,expected[i],q.id));
  assert.equal(3/8-1/4,1/8);
});
test('an identity and both answers are required; early enter/continue/submit cannot unlock',()=>{
  const s=new LearningSession(banks,rng());
  assert.equal(s.start(),false);assert.equal(s.chooseRole('unknown'),false);
  assert.equal(s.enter(),false);assert.equal(s.continue(),false);assert.equal(s.submit(),false);
  s.chooseRole('brother');s.start();assert.equal(s.enter(),false);assert.equal(s.submit(),false);assert.equal(s.passed,false);
});
test('draws two distinct questions from the selected bank without mutating it',()=>{
  const before=JSON.stringify(banks);
  for(const role of ['brother','sister']){
    const draws=new Set();
    for(let seed=0;seed<100;seed++){
      const s=new LearningSession(banks,rng(seed));s.chooseRole(role);s.start();
      assert.equal(s.questions.length,2);assert.notEqual(s.questions[0].id,s.questions[1].id);
      s.questions.forEach(q=>{assert.ok(banks[role].includes(q));draws.add(q.id);});
    }
    assert.equal(draws.size,20);
  }
  assert.equal(JSON.stringify(banks),before);
});
test('wrong answer locks choices until explanation confirmation, then retries the same question',()=>{
  const s=session();const id=s.question.id;answer(s,false);
  assert.equal(s.phase,'feedback');assert.equal(s.feedback.correct,false);
  assert.equal(s.select(s.question.answer),false);assert.equal(s.submit(),false);assert.equal(s.enter(),false);
  s.continue();assert.equal(s.phase,'question');assert.equal(s.question.id,id);assert.equal(s.index,0);assert.equal(s.selected,null);assert.equal(s.passed,false);
});
test('both questions must be correct and the final confirmation must be acknowledged',()=>{
  const s=session('sister');answer(s);assert.equal(s.passed,false);s.continue();
  assert.equal(s.index,1);assert.equal(s.enter(),false);
  answer(s,false);s.continue();assert.equal(s.index,1);assert.equal(s.passed,false);
  answer(s);assert.equal(s.enter(),false);s.continue();assert.equal(s.phase,'complete');assert.equal(s.passed,false);
  assert.equal(s.enter(),true);assert.equal(s.passed,true);assert.equal(s.submit(),false);assert.equal(s.continue(),false);
});
test('re-entering or changing identity uses a fresh locked session',()=>{
  const old=session();answer(old);old.continue();answer(old);old.continue();old.enter();assert.equal(old.passed,true);
  const fresh=new LearningSession(banks,rng());assert.equal(fresh.phase,'identity');assert.equal(fresh.passed,false);assert.equal(fresh.role,null);
  fresh.chooseRole('sister');fresh.start();assert.ok(fresh.questions.every(q=>q.id.startsWith('m')));
});
test('shuffle preserves every choice and moves the answer away from a fixed position',()=>{
  const locations=new Set();const original=['a','b','c','d'];
  for(let seed=0;seed<80;seed++){const shuffled=shuffleLearningItems(original,rng(seed));assert.deepEqual([...shuffled].sort(),original);locations.add(shuffled.indexOf('a'));}
  assert.equal(locations.size,4);assert.deepEqual(original,['a','b','c','d']);
});
test('start, rules shortcut, replay and battle entry are all gated in the application',()=>{
  const fs=require('node:fs'),vm=require('node:vm');
  const html=fs.readFileSync('index.html','utf8');
  const scripts=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  let starts=0,unlocked=false;
  const nodes={};const document={getElementById:id=>nodes[id]||(nodes[id]={style:{},addEventListener(){}})};
  const sandbox={document,startLearningGate:()=>starts++,learningGatePassed:()=>unlocked,unlockAudioFromGesture(){}};
  vm.createContext(sandbox);
  for(const name of ['btnStart','btnRulesOk','btnReplay']){
    const binding=scripts.match(new RegExp("document\\.getElementById\\('"+name+"'\\)\\.onclick = \\(\\) => \\{[\\s\\S]*?\\n\\};"))[0];
    vm.runInContext(binding,sandbox);document.getElementById(name).onclick();
  }
  assert.equal(starts,3);
  const begin=scripts.slice(scripts.indexOf('function beginBattle('),scripts.indexOf('/* ========== 按钮绑定'));
  vm.runInContext(begin,sandbox);sandbox.beginBattle('hotseat',null);assert.equal(starts,4);
});
