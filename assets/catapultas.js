'use strict';
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbyzXCZRbDaDYC9gavs-rn814J2UmN4gRLc6LtIYoHMCPy72QG-0IX2ff9c4pMBGrQKA/exec';
const CIERRE = '2026-10-30T23:00:00-06:00';
const DRAFT_KEY='catapultas-2026-borrador-v1', PENDING_KEY='catapultas-2026-envio-v1';
const $=id=>document.getElementById(id);
let abierto=false, enviando=false, pendiente=null, recibo=null;
const normal=s=>s.trim().replace(/\s+/g,' ');
function storageRead(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch(_){return null;}}
function storageWrite(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(_){}}
function storageRemove(key){try{localStorage.removeItem(key);}catch(_){}}
function addMember(data={}){
  if($('integrantes').children.length>=4)return;
  const i=$('integrantes').children.length;
  const row=document.createElement('div');row.className='member';
  const caption=document.createElement('div');caption.className='member-caption';
  const title=document.createElement('span');title.textContent=i===0?'Integrante 1 · Representante':`Integrante ${i+1}`;caption.append(title);
  if(i===3){const remove=document.createElement('button');remove.type='button';remove.className='remove';remove.textContent='Quitar';remove.addEventListener('click',()=>{row.remove();updateMembers();saveDraft();});caption.append(remove);}
  const fields=document.createElement('div');fields.className='member-fields';
  for(const [key,label,max] of [['nombre','Nombre completo',100],['grupo','Grupo',4]]){
    const box=document.createElement('div'), l=document.createElement('label'), input=document.createElement('input');
    input.id=`${key}-${i}`;input.name=`${key}-${i}`;input.required=true;input.maxLength=max;input.autocomplete='off';input.dataset.field=key;input.value=data[key]||'';
    if(key==='nombre'){input.minLength=5;input.placeholder='Nombre(s) y apellidos';}else{input.pattern='[0-9]{4}';input.inputMode='numeric';input.placeholder='0000';input.title='Grupo de cuatro dígitos';}
    l.htmlFor=input.id;l.textContent=label;box.append(l,input);fields.append(box);
  }
  row.append(caption,fields);$('integrantes').append(row);updateMembers();
}
function updateMembers(){const n=$('integrantes').children.length;$('cantidad').textContent=`${n} de 4`;$('agregar').hidden=n===4;}
function fields(){return {equipo:normal($('equipo').value),docente:$('docente').value,integrantes:[...$('integrantes').children].map(row=>({nombre:normal(row.querySelector('[data-field=nombre]').value),grupo:normal(row.querySelector('[data-field=grupo]').value)})),acepta:$('acepta').checked};}
function saveDraft(){if(!pendiente)storageWrite(DRAFT_KEY,fields());}
function loadDraft(){const d=storageRead(DRAFT_KEY);if(!d)return;$('equipo').value=d.equipo||'';$('docente').value=d.docente||'';if(Array.isArray(d.integrantes)&&d.integrantes.length>=3&&d.integrantes.length<=4){$('integrantes').replaceChildren();d.integrantes.forEach(addMember);} $('acepta').checked=d.acepta===true;}
function mensaje(text){$('mensaje').textContent=text;$('mensaje').hidden=false;$('mensaje').focus();}
async function availability(){
  try{
    const response=await fetch(ENDPOINT+'?t='+Date.now(),{cache:'no-store',signal:AbortSignal.timeout(20000)});
    const data=await response.json();
    if(!response.ok||!data.ok)throw new Error('No disponible');
    abierto=data.abierto===true;$('estado').textContent=abierto?'Inscripciones abiertas · Cierre: 30 oct, 23:00 h':'Inscripciones cerradas · 30 de octubre, 23:00 h';$('estado').className='status'+(abierto?' open':'');
    $('campos').disabled=!abierto||!!pendiente;
    if(pendiente){$('enviar').disabled=false;mensaje('Hay un envío pendiente de confirmar en este dispositivo. Reintenta para recuperar su folio.');showRetry();}
  }catch(_){$('estado').textContent='No pudimos comprobar el registro. Puedes reintentar la conexión.';const b=document.createElement('button');b.type='button';b.className='outline';b.textContent='Reintentar conexión';b.addEventListener('click',()=>{b.remove();availability();});$('estado').append(document.createElement('br'),b);}
}
function showRetry(){if($('reintentar-envio'))return;const b=document.createElement('button');b.id='reintentar-envio';b.type='button';b.className='primary';b.textContent='Confirmar envío pendiente';b.addEventListener('click',()=>send(pendiente));$('mensaje').append(document.createElement('br'),b);}
function confirm(data,payload){
  recibo={...data,...payload};storageRemove(PENDING_KEY);storageRemove(DRAFT_KEY);pendiente=null;
  $('equipo-form').hidden=true;$('mensaje').hidden=true;$('comprobante').hidden=false;$('estado').textContent='Registro guardado correctamente';
  $('equipo-confirmado').textContent=payload.equipo;$('folio').textContent=data.folio;
  $('fecha-confirmada').textContent=new Date(data.fecha).toLocaleString('es-MX',{timeZone:'America/Mexico_City',dateStyle:'long',timeStyle:'short'})+' · Ciudad de México';
  $('miembros-confirmados').replaceChildren();payload.integrantes.forEach((m,i)=>{const li=document.createElement('li');li.textContent=`${m.nombre} · ${m.grupo}${i===0?' · Representante':''}`;$('miembros-confirmados').append(li);});$('comprobante').focus();
}
async function send(payload){
  if(enviando||!payload)return;enviando=true;$('campos').disabled=true;$('mensaje').hidden=true;$('estado').textContent='Guardando el registro. Espera la confirmación…';const retry=$('reintentar-envio');if(retry)retry.disabled=true;
  pendiente=payload;storageWrite(PENDING_KEY,payload);
  try{
    const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),signal:AbortSignal.timeout(35000)});
    const data=await response.json();if(!response.ok)throw new Error('Sin confirmación');
    if(data.ok===true&&data.folio&&data.fecha){confirm(data,payload);return;}
    if(data.retryable===true)throw new Error('Reintento necesario');
    if(data.ok===false&&typeof data.error==='string'){
      pendiente=null;storageRemove(PENDING_KEY);$('campos').disabled=!abierto;$('estado').textContent=abierto?'Revisa los datos antes de volver a enviar.':'Inscripciones cerradas';mensaje(data.error);return;
    }
    throw new Error('Sin confirmación');
  }catch(_){$('estado').textContent='El envío aún no está confirmado.';mensaje('No recibimos la confirmación. Conservamos el envío en este dispositivo; reintenta sin cambiar los datos para evitar duplicados.');showRetry();}
  finally{enviando=false;}
}
$('agregar').addEventListener('click',()=>{addMember();saveDraft();});
for(let i=0;i<3;i++)addMember();loadDraft();pendiente=storageRead(PENDING_KEY);
$('equipo-form').addEventListener('input',saveDraft);
$('equipo-form').addEventListener('submit',e=>{e.preventDefault();if(!abierto||enviando)return;if(!$('equipo-form').reportValidity())return;const d=fields();const keys=d.integrantes.map(m=>m.nombre.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z]/g,'')+'|'+m.grupo);if(new Set(keys).size!==keys.length){mensaje('Hay integrantes repetidos. Revisa los nombres y grupos.');return;}send({...d,id:crypto.randomUUID(),website:$('website').value});});
$('descargar').addEventListener('click',()=>{if(!recibo)return;const text=['COMPROBANTE DE INSCRIPCIÓN · CATAPULTAS 2026',`Folio: ${recibo.folio}`,`Equipo: ${recibo.equipo}`,`Fecha: ${$('fecha-confirmada').textContent}`,`Docente de referencia: ${recibo.docente}`,'',...recibo.integrantes.map((m,i)=>`${i+1}. ${m.nombre} · Grupo ${m.grupo}${i===0?' · Representante':''}`),'','Evento: 20 de noviembre de 2026 · Cancha de básquetbol.','Para corregir datos, consulta a tu docente.'].join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=recibo.folio+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
availability();
