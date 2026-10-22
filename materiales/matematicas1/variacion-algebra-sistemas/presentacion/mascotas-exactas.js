/* Composición SVG: disfraces conservados y ojos extraídos del original, sin regenerarlos. */
window.MASCOTS=(()=>{
let counter=0;
const config={
 curie:[1263,1246,1.02,1.02,0,6],lavoisier:[1263,1246,1.02,1.02,0,6],kepler:[1263,1246,1.02,1.02,0,6],galileo:[1263,1246,1.02,1.02,0,6],pascal:[1265,1243,1.02,1.02,15,6],boyle:[1263,1246,1.02,1.02,0,6],arquimedes:[1263,1246,1.02,1.02,0,6],torricelli:[1263,1246,1.02,1.02,0,6],bourdon:[1263,1246,1.02,1.02,0,6],
 descartes:[1128,1394,.60,.60,84,44],hipatia:[1024,1536,.62,.62,17,16],aljwarizmi:[1024,1536,.60,.60,134,114],gauss:[1024,1536,.62,.62,137,89]
};
const names={curie:'Marie Curie',lavoisier:'Antoine Lavoisier',kepler:'Johannes Kepler',galileo:'Galileo Galilei',pascal:'Blaise Pascal',boyle:'Robert Boyle',arquimedes:'Arquímedes',torricelli:'Evangelista Torricelli',bourdon:'Eugène Bourdon',descartes:'René Descartes',hipatia:'Hipatia de Alejandría',aljwarizmi:'Al-Juarismi',gauss:'Carl Friedrich Gauss'};
// Coordenadas de los lentes completos en el archivo original del usuario.
const lenses='M626 380C565 373 504 416 493 477C480 537 505 611 558 635C609 664 682 638 708 603C741 553 723 478 686 422C666 393 643 380 626 380Z M883 313C833 303 778 337 767 394C746 451 760 512 802 544L831 556C862 541 910 535 965 550C997 513 1006 453 980 395C957 339 917 309 883 313Z M695 457L773 437L792 489L708 512Z';
function choose(block,title=''){
 if(/densidad|Hidrostática|Fluidos|Síntesis/i.test(block))return 'curie';
 if(/Masa y volumen/i.test(block))return /volumen|geometría|desplazamiento|tanque/i.test(title)?'kepler':'lavoisier';
 if(/Gravedad/i.test(block))return 'galileo';if(/Pascal/i.test(block))return 'pascal';if(/Manómetro/i.test(block))return 'boyle';if(/Empuje/i.test(block))return 'arquimedes';if(/Presión absoluta/i.test(block))return /manométrica|vacío|signo|sensor/i.test(title)?'bourdon':'torricelli';if(/Presión/i.test(block))return 'torricelli';
 if(/^0[12]/.test(block))return 'hipatia';if(/^0[38]/.test(block))return 'descartes';if(/^10/.test(block))return 'gauss';if(/^0[4-79]/.test(block))return 'aljwarizmi';return 'descartes';
}
function html(name,cls='mascot'){
 if(!config[name])name='curie';let [w,h,sx,sy,x,y]=config[name],id='mascota-'+(++counter);
 const math=['descartes','hipatia','aljwarizmi','gauss'].includes(name);
 return `<svg xmlns="http://www.w3.org/2000/svg" class="${cls}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Changuito disfrazado de ${names[name]}, con los ojos originales" data-costume="${name}"><defs><filter id="${id}-feather"><feGaussianBlur stdDeviation="3"/></filter><mask id="${id}-eyes" maskUnits="userSpaceOnUse" x="0" y="0" width="1261" height="1247"><g filter="url(#${id}-feather)"><path d="${lenses}" fill="white" stroke="white" stroke-width="32" stroke-linejoin="round"/><ellipse cx="790" cy="580" rx="60" ry="25" fill="black"/><rect x="0" y="645" width="1261" height="602" fill="black"/></g></mask></defs><image href="recursos/disfraz-${name}.png" width="${w}" height="${h}"/>${math?'':`<g transform="matrix(${sx} 0 0 ${sy} ${x} ${y})"><image href="recursos/original-usuario.png" width="1261" height="1247" mask="url(#${id}-eyes)"/></g>`}</svg>`;
}
function mount(root=document){root.querySelectorAll('[data-mascot]').forEach(e=>{let name=e.dataset.mascot;e.outerHTML=html(name,e.className||'mascot')})}
document.addEventListener('DOMContentLoaded',()=>mount());return {html,mount,choose,names};
})();
