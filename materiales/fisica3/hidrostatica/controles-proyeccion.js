/* Controles de proyección tomados de Física I: zoom, arrastre, teclado y pantalla completa. */
(()=>{'use strict';
const by=id=>document.getElementById(id);let zoom=1,panX=0,panY=0,drag=null;
function paint(){by('deck').style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`;by('zoom-reset').textContent=Math.round(zoom*100)+' %';by('viewport').style.cursor=zoom>1?'grab':'';}
function zoomTo(v){zoom=Math.max(1,Math.min(2.5,v));if(zoom===1)panX=panY=0;paint();}
by('zoom-in').onclick=()=>zoomTo(zoom+.25);by('zoom-out').onclick=()=>zoomTo(zoom-.25);by('zoom-reset').onclick=()=>zoomTo(1);
by('viewport').addEventListener('pointerdown',e=>{if(zoom<=1||e.target.closest('button,input,select,a,summary'))return;drag={x:e.clientX,y:e.clientY,px:panX,py:panY};by('viewport').setPointerCapture(e.pointerId);});
by('viewport').addEventListener('pointermove',e=>{if(!drag)return;const mx=by('viewport').clientWidth*(zoom-1)/2,my=by('viewport').clientHeight*(zoom-1)/2;panX=Math.max(-mx,Math.min(mx,drag.px+e.clientX-drag.x));panY=Math.max(-my,Math.min(my,drag.py+e.clientY-drag.y));paint();});
['pointerup','pointercancel'].forEach(t=>by('viewport').addEventListener(t,()=>drag=null));
by('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{by('toast').textContent='Usa F11 para ampliar la ventana del navegador.';setTimeout(()=>by('toast').textContent='',4000);}};
document.addEventListener('fullscreenchange',()=>{by('fullscreen').textContent=document.fullscreenElement?'Salir de pantalla completa':'Pantalla completa';by('fullscreen').setAttribute('aria-pressed',String(!!document.fullscreenElement));});
window.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select')||e.ctrlKey||e.metaKey||e.altKey)return;
 const dialog=document.querySelector('dialog[open]');if(dialog){if(dialog.id==='exercises'&&['ArrowRight','ArrowLeft'].includes(e.key)){e.preventDefault();by(e.key==='ArrowRight'?'step-next':'step-prev').click();}return;}
 if(e.key==='Escape'){zoomTo(1);if(by('menu'))by('menu').hidden=true;return;}
 if(by('menu')&&!by('menu').hidden)return;
 if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();by('next').click();zoomTo(1);}
 if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();by('prev').click();zoomTo(1);}
 if(e.key==='Home'){e.preventDefault();window.CLASSROOM.first();zoomTo(1);}if(e.key==='End'){e.preventDefault();window.CLASSROOM.last();zoomTo(1);}
 if(e.key==='+'||e.key==='='){e.preventDefault();zoomTo(zoom+.25);}if(e.key==='-'||e.key==='_'){e.preventDefault();zoomTo(zoom-.25);}
 if(e.key==='0')zoomTo(1);if(e.key.toLowerCase()==='m')by('menu-btn').click();if(e.key.toLowerCase()==='f')by('fullscreen').click();
});window.PROJECTION={zoomTo,get zoom(){return zoom}};
})();
