(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const body=document.body;
  const course=body.dataset.course;
  const Bank=window.PracticeBank;
  if(!course||!Bank||!Bank.meta[course]) return;

  const meta=Bank.meta[course];
  const state={mode:'generator',topic:Object.keys(meta.topics)[0],level:'easy',exercise:null,counted:false,selectedStep:null};
  const statsKey='practice-v8-stats-'+course;
  let stats=loadStats();

  function loadStats(){
    try{return Object.assign({attempts:0,correct:0,streak:0,best:0},JSON.parse(localStorage.getItem(statsKey)||'{}'));}
    catch(_){return {attempts:0,correct:0,streak:0,best:0};}
  }
  function saveStats(){ try{localStorage.setItem(statsKey,JSON.stringify(stats));}catch(_){} updateStats(); }
  function updateStats(){
    $('stat-attempts').textContent=stats.attempts;
    $('stat-accuracy').textContent=stats.attempts?Math.round(stats.correct/stats.attempts*100)+'%':'—';
    $('stat-streak').textContent=stats.streak;
  }
  function record(correct){
    if(state.counted)return;
    state.counted=true; stats.attempts++;
    if(correct){stats.correct++;stats.streak++;stats.best=Math.max(stats.best,stats.streak);}else stats.streak=0;
    saveStats();
  }
  function parseNumber(value){ const n=Number(String(value).trim().replace(',','.')); return Number.isFinite(n)?n:null; }
  function close(a,b,tol){ return a!==null&&Math.abs(a-b)<=Math.max(tol||.01,Math.abs(b)*.002); }
  function feedback(text,type){ const box=$('practice-feedback'); box.className='practice-feedback'+(type?' is-'+type:''); box.innerHTML=text; box.classList.remove('practice-hidden'); }
  function hideFeedback(){ const box=$('practice-feedback'); box.className='practice-feedback practice-hidden'; box.innerHTML=''; }

  function populate(){
    $('topic-select').innerHTML=Object.entries(meta.topics).map(([key,t])=>`<option value="${key}">${t.label}</option>`).join('');
    $('topic-select').value=state.topic;
    $('subject-chip').textContent=meta.title+' · práctica autónoma';
    $('back-subject').href=meta.back;
    $('back-subject').textContent=meta.title;
  }
  function setMode(mode){
    state.mode=mode;
    const level=$('level-select');
    level.disabled=mode!=='generator';
    $('level-label').textContent=mode==='generator'?'Dificultad':'Dificultad (solo generador)';
    document.querySelectorAll('.practice-mode-button').forEach(btn=>btn.classList.toggle('is-active',btn.dataset.mode===mode));
    newExercise();
  }
  function newExercise(){
    state.topic=$('topic-select').value;
    state.level=$('level-select').value;
    state.exercise=Bank.create(course,state.mode,state.topic,state.level);
    state.counted=false; state.selectedStep=null; hideFeedback();
    render(); updateReference();
  }
  function updateReference(){
    const t=meta.topics[state.topic];
    const link=$('study-link');
    link.href=meta.pdf+'#page='+t.page;
    link.textContent='Abrir la antología en la página '+t.page+' →';
  }
  function render(){
    const ex=state.exercise;
    const modeTitles={generator:'Generador infinito',detective:'Detective de errores',procedure:'Completar el procedimiento'};
    $('work-mode').textContent=modeTitles[state.mode];
    $('work-title').textContent=meta.topics[state.topic].label;
    $('practice-prompt').innerHTML=ex.prompt;
    const area=$('answer-area');
    if(state.mode==='detective') renderDetective(area,ex);
    else if(state.mode==='procedure') renderProcedure(area,ex);
    else renderGenerator(area,ex);
    $('check-button').textContent=state.mode==='detective'?'Comprobar selección':'Comprobar respuesta';
    $('check-button').disabled=false;
    $('hint-box').classList.add('practice-hidden');
    $('solution-box').classList.add('practice-hidden');
    $('hint-box').innerHTML='<strong>Pista</strong>'+ex.hint;
    $('solution-box').innerHTML='<strong>Procedimiento</strong>'+ex.solution;
  }
  function renderGenerator(area,ex){
    if(ex.kind==='number') area.innerHTML=`<div class="practice-input-row"><label for="answer-number">Tu respuesta</label><input class="practice-input" id="answer-number" inputmode="decimal" autocomplete="off"><span class="practice-unit">${ex.unit||''}</span></div>`;
    else if(ex.kind==='fraction') area.innerHTML=`<div class="practice-input-row"><label>Tu fracción simplificada</label><div class="practice-fraction-input"><input class="practice-input" id="answer-num" inputmode="numeric" aria-label="Numerador"><span class="practice-fraction-line"></span><input class="practice-input" id="answer-den" inputmode="numeric" aria-label="Denominador"></div></div>`;
    else if(ex.kind==='pair') area.innerHTML=`<div class="practice-pair"><label>${ex.labels[0]} =</label><input class="practice-input" id="answer-a" inputmode="decimal"><label>${ex.labels[1]} =</label><input class="practice-input" id="answer-b" inputmode="decimal"></div>`;
  }
  function renderDetective(area,ex){
    area.innerHTML='<div class="practice-steps">'+ex.steps.map((step,i)=>`<button type="button" class="practice-step-button" data-step="${i}"><span class="practice-step-number">${i+1}</span><span>${step}</span></button>`).join('')+'</div>';
    area.querySelectorAll('.practice-step-button').forEach(btn=>btn.addEventListener('click',()=>{
      state.selectedStep=Number(btn.dataset.step);
      area.querySelectorAll('.practice-step-button').forEach(b=>b.classList.toggle('is-selected',b===btn));
    }));
  }
  function renderProcedure(area,ex){
    area.innerHTML='<div class="practice-procedure">'+ex.rows.map((row,i)=>`<div class="practice-procedure-row" data-row="${i}"><span>${row.before}</span><input class="practice-input" data-part="${i}" inputmode="decimal" autocomplete="off"><span>${row.after||''}</span></div>`).join('')+'</div>';
  }
  function check(){
    const ex=state.exercise;
    let ok=false;
    if(state.mode==='detective'){
      if(state.selectedStep==null){feedback('Selecciona el paso donde comienza el error.','wrong');return;}
      ok=state.selectedStep===ex.wrongIndex;
      const buttons=$('answer-area').querySelectorAll('.practice-step-button');
      buttons.forEach((b,i)=>{b.classList.remove('is-selected');if(i===ex.wrongIndex)b.classList.add('is-wrong');});
      if(ok) buttons[ex.wrongIndex].classList.add('is-correct');
      record(ok);
      feedback(ok?`<strong>Correcto.</strong> ${ex.explanation}<br>${ex.corrected}`:`<strong>Todavía no.</strong> El primer error está en el paso ${ex.wrongIndex+1}. ${ex.explanation}<br>${ex.corrected}`,ok?'correct':'wrong');
    } else if(state.mode==='procedure'){
      ok=true;
      ex.rows.forEach((row,i)=>{
        const input=document.querySelector(`[data-part="${i}"]`), val=parseNumber(input.value), good=close(val,row.answer,row.tolerance||.01), container=document.querySelector(`[data-row="${i}"]`);
        container.classList.toggle('is-correct',good); container.classList.toggle('is-wrong',!good); if(!good)ok=false;
      });
      record(ok);
      feedback(ok?'<strong>Procedimiento completo.</strong> Todos los pasos son correctos.':`<strong>Revisa los pasos marcados.</strong> ${ex.hint}`,ok?'correct':'wrong');
    } else {
      if(ex.kind==='number') ok=close(parseNumber($('answer-number').value),ex.answer,ex.tolerance);
      else if(ex.kind==='fraction'){
        const n=parseNumber($('answer-num').value),d=parseNumber($('answer-den').value); if(n!==null&&d){const f=Bank.utils.frac(n,d);ok=f.n===ex.num&&f.d===ex.den;}
      } else if(ex.kind==='pair') ok=close(parseNumber($('answer-a').value),ex.answers[0],ex.tolerance)&&close(parseNumber($('answer-b').value),ex.answers[1],ex.tolerance);
      record(ok);
      feedback(ok?'<strong>Correcto.</strong> Genera otro ejercicio para seguir practicando.':`<strong>No coincide todavía.</strong> ${ex.hint}`,ok?'correct':'wrong');
    }
    $('check-button').disabled=ok;
  }

  document.querySelectorAll('.practice-mode-button').forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.mode)));
  $('topic-select').addEventListener('change',newExercise);
  $('level-select').addEventListener('change',newExercise);
  $('new-button').addEventListener('click',newExercise);
  $('check-button').addEventListener('click',check);
  $('hint-button').addEventListener('click',()=>$('hint-box').classList.toggle('practice-hidden'));
  $('solution-button').addEventListener('click',()=>$('solution-box').classList.toggle('practice-hidden'));
  $('reset-stats').addEventListener('click',()=>{if(confirm('¿Borrar tu progreso local de esta materia?')){stats={attempts:0,correct:0,streak:0,best:0};saveStats();}});

  populate(); updateStats(); newExercise();
})();
