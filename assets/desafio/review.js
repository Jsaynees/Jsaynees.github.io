(()=>{'use strict';
const $=s=>document.querySelector(s), result=$('#result-dialog');
const dialog=document.createElement('dialog');
dialog.id='history-dialog';
dialog.innerHTML=`<button type="button" class="close" aria-label="Cerrar historial">×</button><p class="eyebrow">TUS ENTREGAS</p><h2>Vuelve a tus procedimientos.</h2><p>Escribe los mismos datos que usaste al participar. Consultar no consume intentos y sigue disponible después del cierre.</p><form id="history-form"><label>Nombre(s)<input name="first" autocomplete="given-name" required minlength="2" maxlength="60"></label><label>Apellidos<input name="last" autocomplete="family-name" required minlength="2" maxlength="70"></label><label>Grupo<select name="group" required></select></label><button class="button" type="submit">Consultar mis intentos</button></form><p id="history-status" role="status" aria-live="polite"></p><div id="history-list"></div>`;
document.body.append(dialog);
dialog.querySelector('select').innerHTML=$('#register-form select[name=group]').innerHTML;
dialog.querySelector('.close').onclick=()=>dialog.close();
let mission=null,owner=null,loading=false;
document.querySelectorAll('[data-mission]').forEach(start=>{
 const b=document.createElement('button');b.type='button';b.className='text-button history-button';b.textContent='Ver mis intentos y retroalimentación';
 b.onclick=()=>{mission=start.dataset.mission;$('#history-status').textContent='';$('#history-list').replaceChildren();
  try{const saved=JSON.parse(localStorage.getItem('desafio-fisica-v1')||'{}');if(saved.identity)for(const k of ['first','last','group'])$('#history-form').elements[k].value=saved.identity[k]||'';}catch(e){}
  dialog.showModal();};start.after(b);
});
$('#history-form').onsubmit=async e=>{
 e.preventDefault();if(loading)return;loading=true;const form=e.target,button=form.querySelector('button');button.disabled=true;
 $('#history-list').replaceChildren();$('#history-status').textContent='Consultando tus entregas…';
 const identity={first:form.elements.first.value.trim(),last:form.elements.last.value.trim(),group:form.elements.group.value};
 try{const data=await window.DesafioAPI('history',{...identity,mission});owner=identity;
  $('#history-status').textContent=data.rows.length?'Elige el intento que quieras revisar.':'No hay intentos entregados con estos datos en esta misión. Revisa cómo escribiste tu nombre, apellidos y grupo.';
  for(const row of data.rows){const b=document.createElement('button');b.type='button';b.className='button secondary history-attempt';
   b.textContent='Intento '+row.attempt+' · '+row.score+' puntos'+(row.late?' · Fuera de tiempo':'');
   b.onclick=async()=>{if(loading)return;loading=true;b.disabled=true;$('#history-status').textContent='Recuperando retroalimentación…';
    try{const r=await window.DesafioAPI('review',{...owner,mission,session:row.session});dialog.close();window.DesafioShowResult(r,owner);}
    catch(err){$('#history-status').textContent=err.message;}finally{loading=false;b.disabled=false;}};
   $('#history-list').append(b);
  }
 }catch(err){$('#history-status').textContent=err.message;}finally{loading=false;button.disabled=false;}
};
// Medidas disuasorias: el navegador no controla las capturas del sistema.
const cover=document.createElement('div');cover.className='review-cover';cover.hidden=true;
cover.innerHTML='<p>La consulta quedó en pausa al salir de la ventana.</p><button type="button" class="button">Continuar leyendo</button>';
result.append(cover);
cover.querySelector('button').onclick=()=>{cover.hidden=true;result.classList.remove('review-paused');};
const stamp=document.createElement('p');stamp.className='review-owner';$('#result-review').before(stamp);
window.DesafioReview={protect(r,identity){
 cover.hidden=true;result.classList.remove('review-paused');
 const label=(identity?identity.first+' '+identity.last+' · Grupo '+identity.group:'Consulta personal')+' · Intento '+r.attempt;
 stamp.textContent=label+' · Retroalimentación para tu estudio personal.';
 result.querySelectorAll('.review').forEach(el=>{const mark=document.createElement('p');mark.className='review-watermark';mark.textContent=label;el.append(mark);});
}};
function pause(){if(result.open){cover.hidden=false;result.classList.add('review-paused');}}
window.addEventListener('blur',pause);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
document.addEventListener('keydown',e=>{if(!result.open)return;if(e.key==='PrintScreen'||((e.ctrlKey||e.metaKey)&&['p','s'].includes(e.key.toLowerCase()))){e.preventDefault();pause();}},true);
for(const name of ['copy','cut','contextmenu','dragstart'])result.addEventListener(name,e=>e.preventDefault());
result.addEventListener('close',()=>{$('#result-review').replaceChildren();stamp.textContent='';cover.hidden=true;result.classList.remove('review-paused');});
})();
