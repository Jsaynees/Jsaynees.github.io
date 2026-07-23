(function(){
  'use strict';

  const $=id=>document.getElementById(id);
  const body=document.body;
  const course=body.dataset.course;
  const Bank=window.PracticeBankV9;
  if(!course||!Bank||!Bank.meta[course]) return;

  const meta=Bank.meta[course];
  const topicKeys=Object.keys(meta.topics);
  const levels=['easy','medium','challenge'];
  const modeLabels={guided:'Práctica guiada',session:'Sesión de práctica',mixed:'Repaso mixto',worksheet:'Hoja imprimible'};
  const courseCodes={matematicas1:'M1',fisica1:'F1',fisica3:'F3'};
  const courseByCode={M1:'matematicas1',F1:'fisica1',F3:'fisica3'};
  const levelCodes={easy:'I',medium:'M',challenge:'R'};
  const levelByCode={I:'easy',M:'medium',R:'challenge'};
  const topicCodes={
    matematicas1:{numeros:'NUM',rectas:'REC',ecuaciones:'ECU',sistemas:'SIS'},
    fisica1:{medicion:'MED',cinematica:'CIN',newton:'NEW',energia:'ENE'},
    fisica3:{vectores:'VEC',torca:'TOR',rotacion:'ROT',hidro:'HID',flujo:'FLU'}
  };
  const topicByCode={};
  Object.entries(topicCodes).forEach(([c,map])=>{
    topicByCode[c]=Object.fromEntries(Object.entries(map).map(([key,value])=>[value,key]));
  });

  const state={
    mode:'guided', topic:topicKeys[0], level:'easy', adaptive:false, count:10,
    exercise:null, scored:false, firstOutcome:null, usedHint:false, usedSolution:false,
    session:null, sessionIndex:0, sessionResults:[], sessionStartedAt:0,
    adaptiveLevel:'easy', adaptivePoints:0, seed:randomSeed(), worksheet:null
  };

  const statsKey='practice-v9-stats-'+course;
  let stats=loadStats();

  function defaultStats(){
    return {attempts:0,correct:0,streak:0,best:0,topics:{},sessions:0};
  }

  function loadStats(){
    try{
      const current=localStorage.getItem(statsKey);
      if(current) return Object.assign(defaultStats(),JSON.parse(current));
      const old=localStorage.getItem('practice-v8-stats-'+course);
      if(old){
        const legacy=JSON.parse(old);
        const migrated=Object.assign(defaultStats(),legacy);
        localStorage.setItem(statsKey,JSON.stringify(migrated));
        return migrated;
      }
    }catch(_){}
    return defaultStats();
  }

  function saveStats(){
    try{localStorage.setItem(statsKey,JSON.stringify(stats));}catch(_){}
    updateStats();
  }

  function topicStats(topic){
    if(!stats.topics[topic]) stats.topics[topic]={attempts:0,correct:0};
    return stats.topics[topic];
  }

  function recordAttempt(topic,correct){
    stats.attempts++;
    const t=topicStats(topic);
    t.attempts++;
    if(correct){
      stats.correct++;t.correct++;stats.streak++;stats.best=Math.max(stats.best,stats.streak);
    }else stats.streak=0;
    saveStats();
  }

  function updateStats(){
    $('stat-attempts').textContent=stats.attempts;
    $('stat-accuracy').textContent=stats.attempts?Math.round(stats.correct/stats.attempts*100)+'%':'—';
    $('stat-streak').textContent=stats.streak;
    $('stat-level').textContent=levelName(state.mode==='guided'?state.level:state.adaptiveLevel);
  }

  function levelName(level){
    return {easy:'Inicial',medium:'Intermedia',challenge:'Reto'}[level]||'Inicial';
  }

  function randomSeed(){
    const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let output='';
    if(window.crypto&&crypto.getRandomValues){
      const values=new Uint32Array(6);crypto.getRandomValues(values);
      values.forEach(value=>output+=alphabet[value%alphabet.length]);
      return output;
    }
    for(let i=0;i<6;i++) output+=alphabet[Math.floor(Math.random()*alphabet.length)];
    return output;
  }

  function seededChoice(items,seed){
    return Bank.withSeed(seed,()=>items[Math.floor(Math.random()*items.length)]);
  }

  function parseNumber(value){
    const normalized=String(value==null?'':value).trim().replace(',','.');
    if(!normalized) return null;
    const number=Number(normalized);
    return Number.isFinite(number)?number:null;
  }

  function close(a,b,tolerance){
    return a!==null&&Math.abs(a-b)<=Math.max(tolerance||.01,Math.abs(b)*.002);
  }

  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g,char=>({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[char]));
  }

  function stripHtml(value){
    const temp=document.createElement('div');temp.innerHTML=value;return temp.textContent||'';
  }

  function answerText(ex){
    if(ex.kind==='number') return Bank.utils.fmt(ex.answer,4)+(ex.unit?' '+ex.unit:'');
    if(ex.kind==='fraction') return ex.num+'/'+ex.den;
    if(ex.kind==='pair') return ex.labels.map((label,index)=>label+'='+Bank.utils.fmt(ex.answers[index],4)).join(', ');
    return '';
  }

  function feedback(message,type){
    const box=$('practice-feedback');
    box.className='practice-feedback'+(type?' is-'+type:'');
    box.innerHTML=message;
    box.classList.remove('practice-hidden');
  }

  function hideFeedback(){
    const box=$('practice-feedback');box.className='practice-feedback practice-hidden';box.innerHTML='';
  }

  function populate(){
    $('topic-select').innerHTML=Object.entries(meta.topics).map(([key,t])=>`<option value="${key}">${t.label}</option>`).join('');
    $('topic-select').value=state.topic;
    $('subject-chip').textContent=meta.title+' · práctica autónoma';
    $('back-subject').href=meta.back;
    $('back-subject').textContent=meta.title;
    updateStats();
  }

  function setMode(mode){
    if(!modeLabels[mode]) return;
    state.mode=mode;
    document.querySelectorAll('.practice-mode-button').forEach(button=>button.classList.toggle('is-active',button.dataset.mode===mode));
    $('topic-field').classList.toggle('practice-hidden',mode==='mixed');
    $('count-field').classList.toggle('practice-hidden',mode==='guided');
    $('adaptive-field').classList.toggle('practice-hidden',!(mode==='session'||mode==='mixed'));
    $('start-button').classList.toggle('practice-hidden',mode==='guided');
    $('new-button').classList.toggle('practice-hidden',mode!=='guided');
    $('workspace').classList.toggle('practice-hidden',mode==='worksheet');
    $('worksheet-panel').classList.toggle('practice-hidden',mode!=='worksheet');
    $('session-summary').classList.add('practice-hidden');
    $('session-progress').classList.add('practice-hidden');
    $('practice-code-card').classList.toggle('practice-hidden',mode==='guided');
    if(mode==='guided') newGuidedExercise();
    else if(mode==='worksheet') prepareWorksheet(false);
    else resetWorkspace(modeLabels[mode],'Configura la sesión y presiona “Comenzar”.');
    updateCodeDisplay();
  }

  function resetWorkspace(tag,title){
    $('work-mode').textContent=tag;
    $('work-title').textContent=title;
    $('practice-prompt').textContent='Selecciona las opciones de arriba para iniciar.';
    $('answer-area').innerHTML='';
    $('practice-actions').classList.add('practice-hidden');
    hideFeedback();
    $('hint-box').classList.add('practice-hidden');
    $('solution-box').classList.add('practice-hidden');
  }

  function readConfiguration(){
    state.topic=$('topic-select').value;
    state.level=$('level-select').value;
    state.count=Number($('count-select').value)||10;
    state.adaptive=$('adaptive-toggle').checked;
  }

  function updateReference(topic){
    const current=meta.topics[topic||state.topic];
    const link=$('study-link');
    link.href=meta.pdf+'#page='+current.page;
    link.textContent='Abrir la antología en la página '+current.page+' →';
  }

  function newGuidedExercise(){
    readConfiguration();
    state.exercise=Bank.create(course,state.topic,state.level);
    state.scored=false;state.firstOutcome=null;state.usedHint=false;state.usedSolution=false;
    renderExercise();
  }

  function startConfigured(){
    readConfiguration();
    state.seed=randomSeed();
    if(state.mode==='worksheet'){
      prepareWorksheet(true);
      return;
    }
    startSession();
  }

  function startSession(config){
    if(config){
      state.mode=config.topic==='mixed'?'mixed':'session';
      document.querySelectorAll('.practice-mode-button').forEach(button=>button.classList.toggle('is-active',button.dataset.mode===state.mode));
      state.topic=config.topic==='mixed'?topicKeys[0]:config.topic;
      state.level=config.level;
      state.count=config.count;
      state.adaptive=false;
      state.seed=config.seed;
      $('topic-select').value=state.topic;
      $('level-select').value=state.level;
      $('count-select').value=String(state.count);
      $('adaptive-toggle').checked=false;
      $('topic-field').classList.toggle('practice-hidden',state.mode==='mixed');
    }
    state.session={mode:state.mode,count:state.count,seed:state.seed};
    state.sessionIndex=0;state.sessionResults=[];state.sessionStartedAt=Date.now();
    state.adaptiveLevel=state.level;state.adaptivePoints=0;
    stats.sessions=(stats.sessions||0)+1;saveStats();
    $('workspace').classList.remove('practice-hidden');
    $('worksheet-panel').classList.add('practice-hidden');
    $('session-summary').classList.add('practice-hidden');
    $('session-progress').classList.remove('practice-hidden');
    $('practice-actions').classList.remove('practice-hidden');
    $('next-button').classList.add('practice-hidden');
    loadSessionQuestion();
    updateCodeDisplay();
  }

  function sessionTopic(index){
    return state.mode==='mixed'?seededChoice(topicKeys,state.seed+'-topic-'+index):state.topic;
  }

  function loadSessionQuestion(){
    const topic=sessionTopic(state.sessionIndex);
    const level=state.adaptive?state.adaptiveLevel:state.level;
    state.exercise=uniqueExercise(topic,level,state.seed+'-'+state.sessionIndex);
    state.exercise._topic=topic;
    state.exercise._level=level;
    state.scored=false;state.firstOutcome=null;state.usedHint=false;state.usedSolution=false;
    renderExercise();
    updateSessionProgress();
  }

  function uniqueExercise(topic,level,seed){
    const prior=new Set(state.sessionResults.map(result=>result.prompt));
    let exercise;
    for(let attempt=0;attempt<12;attempt++){
      exercise=Bank.createSeeded(course,topic,level,seed+'-'+attempt);
      if(!prior.has(stripHtml(exercise.prompt))) break;
    }
    return exercise;
  }

  function updateSessionProgress(){
    const current=state.sessionIndex+1;
    $('progress-text').textContent=`Ejercicio ${current} de ${state.count}`;
    $('progress-level').textContent='Nivel '+levelName(state.exercise._level||state.level);
    $('progress-fill').style.width=Math.round(((state.sessionIndex+1)/state.count)*100)+'%';
  }

  function renderExercise(){
    const ex=state.exercise;
    const topic=ex._topic||state.topic;
    $('work-mode').textContent=state.mode==='guided'?'Práctica guiada':modeLabels[state.mode];
    $('work-title').textContent=meta.topics[topic].label;
    $('practice-prompt').innerHTML=ex.prompt;
    renderAnswerArea(ex);
    $('practice-actions').classList.remove('practice-hidden');
    $('check-button').disabled=false;
    $('check-button').textContent='Comprobar respuesta';
    $('next-button').classList.add('practice-hidden');
    $('hint-box').classList.add('practice-hidden');
    $('solution-box').classList.add('practice-hidden');
    $('hint-box').innerHTML='<strong>Pista conceptual</strong>'+ex.hint;
    $('solution-box').innerHTML='<strong>Procedimiento completo</strong>'+ex.solution;
    hideFeedback();
    updateReference(topic);
    updateStats();
  }

  function renderAnswerArea(ex){
    const area=$('answer-area');
    if(ex.kind==='number'){
      area.innerHTML=`<div class="practice-input-row"><label for="answer-number">Tu respuesta</label><input class="practice-input" id="answer-number" inputmode="decimal" autocomplete="off"><span class="practice-unit">${escapeHtml(ex.unit||'')}</span></div>`;
    }else if(ex.kind==='fraction'){
      area.innerHTML=`<div class="practice-input-row"><label>Tu fracción simplificada</label><div class="practice-fraction-input"><input class="practice-input" id="answer-num" inputmode="numeric" aria-label="Numerador"><span class="practice-fraction-line"></span><input class="practice-input" id="answer-den" inputmode="numeric" aria-label="Denominador"></div></div>`;
    }else if(ex.kind==='pair'){
      area.innerHTML=`<div class="practice-pair"><label>${escapeHtml(ex.labels[0])} =</label><input class="practice-input" id="answer-a" inputmode="decimal"><label>${escapeHtml(ex.labels[1])} =</label><input class="practice-input" id="answer-b" inputmode="decimal"></div>`;
    }
    const first=area.querySelector('input');if(first) setTimeout(()=>first.focus(),60);
  }

  function collectAnswer(ex){
    if(ex.kind==='number') return {kind:'number',values:[parseNumber($('answer-number').value)]};
    if(ex.kind==='fraction') return {kind:'fraction',values:[parseNumber($('answer-num').value),parseNumber($('answer-den').value)]};
    if(ex.kind==='pair') return {kind:'pair',values:[parseNumber($('answer-a').value),parseNumber($('answer-b').value)]};
    return {kind:'unknown',values:[]};
  }

  function evaluate(ex,response){
    if(ex.kind==='number') return close(response.values[0],ex.answer,ex.tolerance);
    if(ex.kind==='fraction'){
      const [n,d]=response.values;if(n===null||d===null||d===0)return false;
      const fraction=Bank.utils.frac(n,d);return fraction.n===ex.num&&fraction.d===ex.den;
    }
    if(ex.kind==='pair') return close(response.values[0],ex.answers[0],ex.tolerance)&&close(response.values[1],ex.answers[1],ex.tolerance);
    return false;
  }

  function checkAnswer(){
    const ex=state.exercise;
    const response=collectAnswer(ex);
    if(response.values.some(value=>value===null)){
      feedback('<strong>Falta una respuesta.</strong> Escribe un valor antes de comprobar.','wrong');return;
    }
    const correct=evaluate(ex,response);
    if(!state.scored){
      state.scored=true;state.firstOutcome=correct;
      const topic=ex._topic||state.topic;
      recordAttempt(topic,correct);
      if(state.mode!=='guided'){
        state.sessionResults.push({
          topic,level:ex._level||state.level,correct,assisted:state.usedHint||state.usedSolution,
          prompt:stripHtml(ex.prompt),answer:answerText(ex)
        });
        if(state.adaptive) updateAdaptive(correct);
      }
    }

    if(correct){
      feedback('<strong>Correcto.</strong> '+(state.mode==='guided'?'Genera otro ejercicio cuando estés listo.':'Puedes continuar con el siguiente ejercicio.'),'correct');
      $('check-button').disabled=true;
      if(state.mode!=='guided') $('next-button').classList.remove('practice-hidden');
    }else{
      feedback('<strong>Todavía no coincide.</strong> '+diagnoseMistake(ex,response),'wrong');
      if(state.mode!=='guided') $('next-button').classList.remove('practice-hidden');
    }
  }

  function diagnoseMistake(ex,response){
    const topic=ex._topic||state.topic;
    if(ex.kind==='number'){
      const value=response.values[0],answer=ex.answer;
      if(close(value,-answer,ex.tolerance)) return 'El valor tiene la magnitud correcta, pero el signo es contrario. Revisa la dirección o la convención de signos.';
      if(value!==0&&answer!==0){
        const ratio=Math.abs(value/answer);
        if([.001,.01,.1,10,100,1000].some(factor=>Math.abs(ratio-factor)<factor*.015)) return 'El resultado difiere por una potencia de diez. Revisa la conversión de unidades o la posición del punto decimal.';
        if(Math.abs(ratio-3.6)<.03||Math.abs(ratio-1/3.6)<.003) return 'Parece una conversión entre km/h y m/s aplicada en el sentido contrario.';
      }
    }
    if(ex.kind==='pair'){
      const [a,b]=response.values;
      if(close(a,ex.answers[1],ex.tolerance)&&close(b,ex.answers[0],ex.tolerance)) return 'Los dos valores parecen estar intercambiados. Revisa cuál corresponde a cada variable.';
    }
    const suggestions={
      numeros:'Busca un denominador común o convierte el porcentaje a decimal antes de operar.',
      rectas:'Revisa la sustitución de x o conserva el mismo orden al calcular Δy y Δx.',
      ecuaciones:'Haz la misma operación en ambos lados y revisa el signo al trasladar términos.',
      sistemas:'Comprueba el par ordenado sustituyéndolo en las dos ecuaciones.',
      medicion:'Trabaja con factores de conversión y verifica que las unidades se cancelen.',
      cinematica:'Identifica si el movimiento es uniforme o acelerado y revisa si aparece t².',
      newton:'Calcula primero la fuerza neta; si hay fricción, debe restarse en la dirección opuesta.',
      energia:'Revisa si la rapidez está elevada al cuadrado y conserva las unidades del SI.',
      vectores:'Separa correctamente las componentes x e y y revisa signos según el cuadrante.',
      torca:'Usa el brazo perpendicular y verifica el sentido horario o antihorario.',
      rotacion:'Distingue entre torca, momento de inercia y aceleración angular.',
      hidro:'Convierte la profundidad a metros antes de usar P=ρgh.',
      flujo:'En continuidad, una menor área implica una mayor velocidad.'
    };
    return suggestions[topic]||ex.hint;
  }

  function updateAdaptive(correct){
    const assisted=state.usedHint||state.usedSolution;
    if(correct&&!assisted) state.adaptivePoints++;
    else if(!correct) state.adaptivePoints--;
    if(state.adaptivePoints>=2){
      const index=levels.indexOf(state.adaptiveLevel);
      if(index<levels.length-1) state.adaptiveLevel=levels[index+1];
      state.adaptivePoints=0;
    }else if(state.adaptivePoints<=-2){
      const index=levels.indexOf(state.adaptiveLevel);
      if(index>0) state.adaptiveLevel=levels[index-1];
      state.adaptivePoints=0;
    }
    updateStats();
  }

  function nextQuestion(){
    if(state.mode==='guided'){newGuidedExercise();return;}
    state.sessionIndex++;
    if(state.sessionIndex>=state.count){finishSession();return;}
    loadSessionQuestion();
  }

  function finishSession(){
    const elapsed=Math.max(1,Math.round((Date.now()-state.sessionStartedAt)/1000));
    const correct=state.sessionResults.filter(result=>result.correct).length;
    const grouped={};
    state.sessionResults.forEach(result=>{
      if(!grouped[result.topic]) grouped[result.topic]={attempts:0,correct:0};
      grouped[result.topic].attempts++;if(result.correct)grouped[result.topic].correct++;
    });
    const weakest=Object.entries(grouped).sort((a,b)=>(a[1].correct/a[1].attempts)-(b[1].correct/b[1].attempts))[0];
    $('session-progress').classList.add('practice-hidden');
    $('workspace').classList.add('practice-hidden');
    $('session-summary').classList.remove('practice-hidden');
    $('summary-score').textContent=correct+' / '+state.count;
    $('summary-percent').textContent=Math.round(correct/state.count*100)+'%';
    $('summary-time').textContent=formatTime(elapsed);
    $('summary-topic').textContent=correct===state.count?'Ninguno':(weakest?meta.topics[weakest[0]].label:'—');
    $('summary-message').textContent=correct/state.count>=.8?'Buen dominio. Intenta el nivel siguiente o un repaso mixto.':correct/state.count>=.6?'Vas avanzando. Revisa el tema marcado y repite una sesión corta.':'Conviene abrir la antología, revisar un ejemplo y volver a intentar con nivel inicial.';
    $('progress-fill').style.width='100%';
  }

  function formatTime(seconds){
    const minutes=Math.floor(seconds/60),remaining=seconds%60;
    return minutes?`${minutes} min ${remaining} s`:`${remaining} s`;
  }

  function showHint(){
    state.usedHint=true;$('hint-box').classList.toggle('practice-hidden');
  }

  function showSolution(){
    state.usedSolution=true;$('solution-box').classList.toggle('practice-hidden');
  }

  function makeCode(config){
    const topicCode=config.topic==='mixed'?'MIX':topicCodes[course][config.topic];
    return [courseCodes[course],topicCode,levelCodes[config.level],String(config.count),config.seed].join('-');
  }

  function parseCode(value){
    const clean=String(value||'').trim().toUpperCase().replace(/\s+/g,'');
    const parts=clean.split('-');
    if(parts.length!==5) throw new Error('El código debe tener cinco bloques separados por guiones.');
    const [courseCode,topicCode,levelCode,countText,seed]=parts;
    const codeCourse=courseByCode[courseCode];
    if(codeCourse!==course) throw new Error('El código corresponde a otra materia.');
    const topic=topicCode==='MIX'?'mixed':topicByCode[course][topicCode];
    const level=levelByCode[levelCode],count=Number(countText);
    if(!topic||!level||![5,10,15,20].includes(count)||!/^[A-Z2-9]{4,10}$/.test(seed)) throw new Error('El código no tiene un formato válido.');
    return {topic,level,count,seed};
  }

  function currentCode(){
    readConfiguration();
    const topic=state.mode==='mixed'?'mixed':state.topic;
    return makeCode({topic,level:state.level,count:state.count,seed:state.seed});
  }

  function updateCodeDisplay(){
    if(state.mode==='guided') return;
    $('practice-code').value=currentCode();
    $('code-note').textContent=state.adaptive?'El código comparte tema, cantidad y nivel inicial; con adaptación los ejercicios pueden variar según los aciertos.':'El código reproduce la misma selección de ejercicios.';
  }

  async function copyCode(){
    const code=$('practice-code').value;
    try{await navigator.clipboard.writeText(code);$('code-note').textContent='Código copiado. Ya puedes compartirlo.';if(window.PortalUI)PortalUI.notify('Código de práctica copiado.','success',2600);}
    catch(_){$('practice-code').select();document.execCommand('copy');$('code-note').textContent='Código copiado. Ya puedes compartirlo.';}
  }

  function loadCode(){
    try{
      const config=parseCode($('code-input').value);
      state.seed=config.seed;
      $('level-select').value=config.level;
      $('count-select').value=String(config.count);
      $('adaptive-toggle').checked=false;
      if(config.topic==='mixed') setMode('mixed');
      else{setMode('session');$('topic-select').value=config.topic;state.topic=config.topic;}
      startSession(config);
    }catch(error){feedback('<strong>Código no válido.</strong> '+escapeHtml(error.message),'wrong');}
  }

  function buildFixedSet(config){
    const items=[],seen=new Set();
    for(let index=0;index<config.count;index++){
      const topic=config.topic==='mixed'?seededChoice(topicKeys,config.seed+'-topic-'+index):config.topic;
      let exercise;
      for(let attempt=0;attempt<15;attempt++){
        exercise=Bank.createSeeded(course,topic,config.level,config.seed+'-'+index+'-'+attempt);
        const key=stripHtml(exercise.prompt);
        if(!seen.has(key)){seen.add(key);break;}
      }
      items.push({topic,exercise});
    }
    return items;
  }

  function prepareWorksheet(regenerate){
    readConfiguration();
    if(regenerate||!state.worksheet) state.seed=randomSeed();
    const config={topic:state.mode==='mixed'?'mixed':state.topic,level:state.level,count:state.count,seed:state.seed};
    state.worksheet={config,items:buildFixedSet(config)};
    renderWorksheet();updateCodeDisplay();
  }

  function renderWorksheet(){
    if(!state.worksheet)return;
    const {config,items}=state.worksheet;
    $('worksheet-title').textContent=config.topic==='mixed'?'Repaso mixto de '+meta.title:meta.topics[config.topic].label;
    $('worksheet-code').textContent=makeCode(config);
    $('worksheet-list').innerHTML=items.map((item,index)=>`<li><span class="worksheet-topic">${escapeHtml(meta.topics[item.topic].label)}</span><div>${item.exercise.prompt}</div><div class="worksheet-space" aria-hidden="true"></div></li>`).join('');
    $('answer-key-list').innerHTML=items.map((item,index)=>`<li><strong>${index+1}.</strong> ${escapeHtml(answerText(item.exercise))}<div class="answer-key-solution">${item.exercise.solution}</div></li>`).join('');
  }

  function printWorksheet(){
    if(!state.worksheet)prepareWorksheet(true);
    window.print();
  }

  function repeatSession(){
    state.seed=randomSeed();startSession();
  }

  document.querySelectorAll('.practice-mode-button').forEach(button=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
  $('topic-select').addEventListener('change',()=>{state.topic=$('topic-select').value;if(state.mode==='guided')newGuidedExercise();else if(state.mode==='worksheet')prepareWorksheet(true);updateCodeDisplay();});
  $('level-select').addEventListener('change',()=>{state.level=$('level-select').value;if(state.mode==='guided')newGuidedExercise();else if(state.mode==='worksheet')prepareWorksheet(true);updateCodeDisplay();});
  $('count-select').addEventListener('change',()=>{state.count=Number($('count-select').value);if(state.mode==='worksheet')prepareWorksheet(true);updateCodeDisplay();});
  $('adaptive-toggle').addEventListener('change',()=>{state.adaptive=$('adaptive-toggle').checked;updateCodeDisplay();});
  $('start-button').addEventListener('click',startConfigured);
  $('new-button').addEventListener('click',newGuidedExercise);
  $('check-button').addEventListener('click',checkAnswer);
  $('next-button').addEventListener('click',nextQuestion);
  $('hint-button').addEventListener('click',showHint);
  $('solution-button').addEventListener('click',showSolution);
  $('copy-code').addEventListener('click',copyCode);
  $('load-code').addEventListener('click',loadCode);
  $('worksheet-generate').addEventListener('click',()=>prepareWorksheet(true));
  $('worksheet-print').addEventListener('click',printWorksheet);
  $('worksheet-toggle-key').addEventListener('click',()=>$('answer-key').classList.toggle('practice-hidden'));
  $('summary-repeat').addEventListener('click',repeatSession);
  $('summary-guided').addEventListener('click',()=>setMode('guided'));
  $('reset-stats').addEventListener('click',()=>{
    if(confirm('¿Borrar el progreso local de esta materia?')){stats=defaultStats();saveStats();}
  });

  populate();
  setMode('guided');
})();
