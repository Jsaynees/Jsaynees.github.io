/* Entrada numérica accesible, con teclado táctil independiente del teclado del teléfono. */
(function(root){'use strict';
function normalize(value){return String(value??'').replace(/,/g,'.').replace(/[−–]/g,'-').replace(/\s+/g,'').replace(/[×xX*]10\^?\(?([+-]?\d*)\)?$/,'e$1');}
function edit(value,start,end,key){
 const original=String(value??''),atEnd=end===original.length,v=normalize(original);start=Math.max(0,Math.min(v.length,start??v.length));end=Math.max(start,Math.min(v.length,end??start));if(original!==v&&atEnd)start=end=v.length;
 function result(text,pos,note=''){return {value:text,start:pos,end:pos,note};}
 function insert(text){return result(v.slice(0,start)+text+v.slice(end),start+text.length);}
 if(key==='clear')return result('',0);
 if(key==='backspace'){if(start!==end)return insert('');if(!start)return result(v,0);return result(v.slice(0,start-1)+v.slice(end),start-1);}
 if(key==='left'||key==='right')return result(v,key==='left'?Math.max(0,start-1):Math.min(v.length,end+1));
 if(/^\d$/.test(key))return insert(key);
 if(key==='exponent'){
  if(/[eE]/.test(v))return result(v,v.length,'Ya hay un exponente. Puedes cambiar su signo y sus cifras.');
  let coefficient=v||'1';if(coefficient==='-'||coefficient==='+')coefficient+='1';
  if(!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(coefficient))return result(v,start,'Completa primero el número que va antes de ×10ⁿ.');
  return result(coefficient+'e',coefficient.length+1);
 }
 const exponent=v.search(/[eE]/),base=exponent>=0&&start>exponent?exponent+1:0;
 if(key==='negative'||key==='positive'){
  const first=v[base],hasSign=first==='-'||first==='+';let sign=key==='positive'?'+':first==='-'?'':'-';
  const text=v.slice(0,base)+sign+v.slice(base+(hasSign?1:0));let pos=start+(sign.length-(hasSign?1:0));if(start===base)pos=base+sign.length;return result(text,Math.max(base+sign.length,Math.min(text.length,pos)));
 }
 if(key==='decimal'){
  if(exponent>=0&&start>exponent)return result(v,start,'El exponente debe ser entero; el decimal va antes de ×10ⁿ.');
  const rest=v.slice(0,start)+v.slice(end),coefficient=rest.split(/[eE]/)[0];
  if(coefficient.includes('.'))return result(v,start,'El número ya tiene punto decimal.');
  const prefix=v.slice(0,start);return insert(prefix===''||prefix==='-'||prefix==='+'?'0.':'.');
 }
 return result(v,start);
}
function presentation(value,unit){const v=normalize(value);if(!v)return 'Usa las teclas o escribe directamente tu resultado.';if(!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(v)||!Number.isFinite(Number(v)))return /e[+-]?$/i.test(v)?'Completa las cifras del exponente.':'Completa el número; escribe solo el resultado, sin operaciones.';const parts=v.split(/e/i);return 'Se leerá como: '+parts[0]+(parts.length>1?' × 10'+parts[1].replace(/[0-9+-]/g,c=>'⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻'['0123456789+-'.indexOf(c)]):'')+(unit?' '+unit:'');}
function mount(container,input,unit){
 const touch=window.matchMedia('(pointer: coarse), (max-width: 800px)').matches;let custom=touch;input.inputMode=custom?'none':'text';input.setAttribute('autocapitalize','off');input.spellcheck=false;input.setAttribute('enterkeyhint','done');
 const panel=document.createElement('div');panel.className='numeric-tools';
 const toolbar=document.createElement('div');toolbar.className='keypad-toolbar';const title=document.createElement('span');title.textContent='TECLADO CIENTÍFICO';toolbar.append(title);
 function keyButton(label,key,aria){const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.numericKey=key;b.setAttribute('aria-label',aria);b.addEventListener('pointerdown',e=>e.preventDefault());b.addEventListener('click',()=>{const change=edit(input.value,input.selectionStart,input.selectionEnd,key);input.value=change.value;input.focus({preventScroll:true});input.setSelectionRange(change.start,change.end);input.dispatchEvent(new Event('input',{bubbles:true}));if(change.note)preview.textContent=change.note;});return b;}
 const arrows=document.createElement('div');arrows.className='keypad-cursor';arrows.append(keyButton('←','left','Mover cursor a la izquierda'),keyButton('→','right','Mover cursor a la derecha'));toolbar.append(arrows);
 const grid=document.createElement('div');grid.className='answer-keypad';grid.setAttribute('role','group');grid.setAttribute('aria-label','Teclado numérico y científico');
 [['7','7','Siete'],['8','8','Ocho'],['9','9','Nueve'],['⌫','backspace','Borrar una cifra'],['4','4','Cuatro'],['5','5','Cinco'],['6','6','Seis'],['C','clear','Borrar todo el resultado'],['1','1','Uno'],['2','2','Dos'],['3','3','Tres'],['−','negative','Cambiar signo menos del número o del exponente'],['0','0','Cero'],['.','decimal','Punto decimal'],['+','positive','Signo positivo del número o del exponente'],['×10ⁿ','exponent','Añadir potencia de diez, notación científica']].forEach(([label,key,aria])=>grid.append(keyButton(label,key,aria)));
 const preview=document.createElement('p');preview.className='numeric-preview';preview.setAttribute('role','status');preview.setAttribute('aria-live','polite');input.addEventListener('input',()=>{preview.textContent=presentation(input.value,unit);});preview.textContent=presentation(input.value,unit);
 const hint=document.createElement('p');hint.className='fine keypad-hint';hint.textContent='×10ⁿ escribe «e». Para 1.6 × 10⁻⁷: 1 · punto · 6 · ×10ⁿ · − · 7. La tecla − cambia el signo en la posición del cursor.';
 const toggle=document.createElement('button');toggle.type='button';toggle.className='text-button keyboard-toggle';function updateToggle(){toggle.textContent=custom?'Usar teclado del dispositivo':'Usar solo teclado en pantalla';toggle.setAttribute('aria-pressed',String(custom));}updateToggle();toggle.onclick=()=>{custom=!custom;input.blur();input.inputMode=custom?'none':'text';updateToggle();input.focus({preventScroll:true});};
 input.setAttribute('aria-describedby','numeric-preview');preview.id='numeric-preview';panel.append(toolbar,grid,preview,hint,toggle);container.append(panel);
}
const api={normalize,edit,presentation,mount};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DesafioNumeric=api;
})(typeof globalThis!=='undefined'?globalThis:this);
