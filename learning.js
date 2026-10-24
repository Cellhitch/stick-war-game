const learningRoot=document.getElementById('learning-screen');
let learningSession=new LearningSession(LEARNING_BANKS);
const LEARNING_PROFILES={
  brother:{name:'弟弟',subject:'拼音',title:'拼音小勇士',detail:'二年级 · 字词与拼音',sprite:'spear_cone',symbol:'ā',tone:'sage'},
  sister:{name:'姐姐',subject:'数学',title:'数学探险家',detail:'深圳六年级 · 数学复习',sprite:'sword_tall',symbol:'π',tone:'lilac'}
};
function learnEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function learningGatePassed(){return learningSession.passed;}
function startLearningGate(){
  learningSession=new LearningSession(LEARNING_BANKS);
  showScreen('learning-screen');
  renderLearningGate();
  focusLearningTitle();
}
function focusLearningTitle(){document.getElementById('learnTitle')?.focus({preventScroll:true});}
function learningRoad(){
  const identity=learningSession.phase==='identity';
  return `<nav class="learn-navigation" aria-label="开战前的两关">
    <button type="button" class="learn-back" data-learn-action="back">← ${identity?'回到首页':'更换身份'}</button>
    <ol class="learn-road"><li class="${identity?'current':'done'}" ${identity?'aria-current="step"':''}><span>${identity?'1':'✓'}</span>选择身份</li><li class="${identity?'':'current'}" ${identity?'':'aria-current="step"'}><span>2</span>智慧试炼</li></ol>
  </nav>`;
}
function renderLearningGate(){
  const s=learningSession;
  if(s.phase==='identity'){
    learningRoot.innerHTML=learningRoad()+`
      <header class="learn-heading"><p class="eyebrow">出征之前 · 第一关</p><h2 id="learnTitle" tabindex="-1">今天，谁来出征？</h2><p>选择你的身份，带着智慧进入纸上王国。</p></header>
      <div class="learn-profiles">${Object.entries(LEARNING_PROFILES).map(([key,p])=>`
        <button type="button" data-learn-role="${key}" class="learn-profile ${p.tone} ${s.role===key?'selected':''}" aria-pressed="${s.role===key}">
          <span class="profile-check" aria-hidden="true">${s.role===key?'✓':'＋'}</span>
          <span class="profile-art"><span class="profile-orbit" aria-hidden="true">${p.symbol}</span><img src="assets/sprites/${p.sprite}.png" alt="" draggable="false"></span>
          <span class="profile-name">${p.name}</span><span class="profile-title">${p.title}</span><span class="profile-detail">${p.detail}</span>
        </button>`).join('')}</div>
      <div class="learn-start"><p><span aria-hidden="true">✦</span> 两道小挑战，开启一场大冒险</p><button type="button" class="primary" data-learn-action="start" ${s.role?'':'disabled'}>${s.role?'和'+LEARNING_PROFILES[s.role].name+'一起闯关':'先选择弟弟或姐姐'} <span aria-hidden="true">→</span></button><small>每个题库 20 题，每次随机抽取 2 题</small></div>`;
    return;
  }
  if(!s.question)return;
  const p=LEARNING_PROFILES[s.role],q=s.question,feedback=s.phase==='feedback',correct=feedback&&s.feedback.correct;
  const complete=s.index+(correct?1:0);
  learningRoot.innerHTML=learningRoad()+`
    <header class="learn-heading quiz-heading"><p class="eyebrow">智慧试炼 · 第二关</p><h2 id="learnTitle" tabindex="-1">${p.name}的${p.subject}小挑战</h2><p>想一想，选一选。学会了，就离出征更近一步。</p></header>
    <div class="learn-quest-layout">
      <aside class="learn-companion ${p.tone}" aria-label="你的冒险伙伴"><span class="companion-symbol" aria-hidden="true">${p.symbol}</span><img src="assets/sprites/${p.sprite}.png" alt="" draggable="false"><strong>${p.title}</strong><p>不着急，慢慢想。<br>每一次思考，都有收获。</p><span class="companion-caption">勇气，也来自智慧。</span></aside>
      <div class="learn-question-area">
        <div class="learn-progress"><span>通行印记 <strong>${complete} / 2</strong></span><div class="learn-stamps" aria-label="已通过 ${complete} 道题">${[0,1].map(i=>`<span class="${i<complete?'stamped':''}" aria-hidden="true">${i<complete?'✓':'✦'}</span>`).join('')}</div></div>
        <article class="learn-question-card">
          <div class="learn-question-meta"><span>第 ${s.index+1} 题 <i>/ 2</i></span><span class="learn-topic">${learnEscape(q.topic)}</span></div>
          <h3 class="learn-question-text">${learnEscape(q.prompt)}</h3>
          <div class="learn-options" role="group" aria-label="选择一个答案">${s.choices.map((choice,i)=>{
            const chosen=s.selected===choice,answer=feedback&&choice===q.answer;
            return `<button type="button" data-learn-option="${i}" class="learn-option ${chosen?'chosen':''} ${answer?'answer-correct':''} ${feedback&&chosen&&!correct?'answer-wrong':''}" aria-pressed="${chosen}" ${feedback?'disabled':''}><span class="option-letter">${'ABCD'[i]}</span><span class="option-text">${learnEscape(choice)}</span>${answer?'<span class="option-result" aria-label="正确答案">✓</span>':''}</button>`;
          }).join('')}</div>
          ${feedback?`<div id="learnFeedback" class="learn-feedback ${correct?'success':'retry'}" role="status"><span class="feedback-icon" aria-hidden="true">${correct?'✓':'↺'}</span><div><strong>${correct?(s.index===1?'两题都答对啦，准备出征！':'答对啦，获得一枚通行印记！'):'先学会，再试一次'}</strong>${!correct?`<p class="feedback-answer">正确答案：<b>${learnEscape(q.answer)}</b></p>`:''}<p>${learnEscape(q.explanation)}</p></div></div>`:''}
          <div class="learn-question-footer">${feedback?`<p>${correct?(s.index===1?'带着新的收获，去开启冒险吧。':'再完成一道题，就可以出征了。'):'看懂解析后，重新回答这一题。'}</p><button type="button" class="primary" data-learn-action="continue">${correct?(s.index===1?'确认，进入游戏':'继续下一题'):'我明白了，再试一次'} <span aria-hidden="true">→</span></button>`:`<p>选好后，记得确认答案。</p><button type="button" class="primary" data-learn-action="submit" ${s.selected===null?'disabled':''}>确认答案 <span aria-hidden="true">→</span></button>`}</div>
        </article>
        <p class="learn-quiet-note">没有倒计时，也不用担心答错。理解比速度更重要。</p>
      </div>
    </div>`;
}
learningRoot.addEventListener('click',event=>{
  const button=event.target.closest('button');
  if(!button||button.disabled||!learningRoot.contains(button))return;
  if(button.dataset.learnRole){
    if(learningSession.chooseRole(button.dataset.learnRole)){renderLearningGate();learningRoot.querySelector(`[data-learn-role="${learningSession.role}"]`).focus({preventScroll:true});}
    return;
  }
  if(button.dataset.learnOption!==undefined){
    const index=Number(button.dataset.learnOption);
    if(learningSession.select(learningSession.choices[index])){renderLearningGate();learningRoot.querySelector(`[data-learn-option="${index}"]`).focus({preventScroll:true});}
    return;
  }
  switch(button.dataset.learnAction){
    case 'back': if(learningSession.phase==='identity')showScreen('title-screen');else startLearningGate();break;
    case 'start':if(learningSession.start()){renderLearningGate();focusLearningTitle();}break;
    case 'submit':if(learningSession.submit()){renderLearningGate();document.getElementById('learnFeedback').scrollIntoView({block:'nearest'});}break;
    case 'continue':
      if(!learningSession.continue())break;
      if(learningSession.phase==='complete'){
        learningSession.enter();document.getElementById('aiSidePick').style.display='none';showScreen('side-screen');
      }else{renderLearningGate();focusLearningTitle();}
      break;
  }
});
