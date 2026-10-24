/* A per-entry learning session; never persist or reuse an unlocked pass. */
function shuffleLearningItems(items, random=Math.random) {
  const result=[...items];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
class LearningSession {
  constructor(banks,random=Math.random){this.banks=banks;this.random=random;this.role=null;this.phase='identity';this.questions=[];this.index=0;this.selected=null;this.feedback=null;this.choices=[];}
  chooseRole(role){if(this.phase!=='identity'||!Object.hasOwn(this.banks,role))return false;this.role=role;return true;}
  start(){if(this.phase!=='identity'||!this.role)return false;this.questions=shuffleLearningItems(this.banks[this.role],this.random).slice(0,2);this.prepareQuestion();return true;}
  prepareQuestion(){this.phase='question';this.selected=null;this.feedback=null;this.choices=shuffleLearningItems(this.question.choices,this.random);}
  get question(){return this.questions[this.index];}
  get passed(){return this.phase==='unlocked';}
  select(answer){if(this.phase!=='question'||!this.choices.includes(answer))return false;this.selected=answer;return true;}
  submit(){if(this.phase!=='question'||this.selected===null)return false;this.feedback={correct:this.selected===this.question.answer};this.phase='feedback';return true;}
  continue(){
    if(this.phase!=='feedback')return false;
    if(!this.feedback.correct){this.prepareQuestion();return true;}
    if(this.index===this.questions.length-1){this.phase='complete';return true;}
    this.index++;this.prepareQuestion();return true;
  }
  enter(){if(this.phase!=='complete')return false;this.phase='unlocked';return true;}
}
if(typeof module!=='undefined'&&module.exports)module.exports={LearningSession,shuffleLearningItems};
