/* Diagramas matemáticos y laboratorios locales. */
window.MathVisuals=(()=>{
let seq=0;const C=['#c74735','#244b78','#69416f'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const M=(t,d=false)=>`<span class="math${d?' display':''}" data-tex="${esc(t)}"></span>`;
function plot({lines=[],points=[],xlim=[-5,5],ylim=[-5,5],triangle=null}={}){
 let [xmin,xmax]=xlim,[ymin,ymax]=ylim,W=600,H=440,L=55,R=565,T=35,B=390,id='clip'+(++seq);
 let X=x=>L+(x-xmin)/(xmax-xmin)*(R-L),Y=y=>B-(y-ymin)/(ymax-ymin)*(B-T);
 let step=(max,min)=>{let raw=(max-min)/10;return [1,2,5,10,20,50,100].find(v=>v>=raw)||Math.ceil(raw/100)*100};
 let dx=step(xmax,xmin),dy=step(ymax,ymin),zeroX=Math.max(xmin,Math.min(0,xmax)),zeroY=Math.max(ymin,Math.min(0,ymax));
 let s=`<svg class="plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica en el plano cartesiano"><defs><clipPath id="${id}"><rect x="${L}" y="${T}" width="${R-L}" height="${B-T}"/></clipPath></defs>`;
 for(let x=Math.ceil(xmin/dx)*dx;x<=xmax;x+=dx){s+=`<path d="M${X(x)} ${T}V${B}" stroke="#d9d0c2"/><text x="${X(x)}" y="${Y(zeroY)+23}" text-anchor="middle" font-size="17">${x}</text>`}
 for(let y=Math.ceil(ymin/dy)*dy;y<=ymax;y+=dy){s+=`<path d="M${L} ${Y(y)}H${R}" stroke="#d9d0c2"/>`;if(y!==0)s+=`<text x="${X(zeroX)-10}" y="${Y(y)+6}" text-anchor="end" font-size="17">${y}</text>`}
 s+=`<path d="M${L} ${Y(zeroY)}H${R}M${X(zeroX)} ${T}V${B}" stroke="#242126" stroke-width="2"/><text x="585" y="${Y(zeroY)-8}" font-size="21">x</text><text x="${X(zeroX)+12}" y="23" font-size="21">y</text>`;
 lines.forEach((l,i)=>{let [m,b]=l;let p=m===null?`M${X(b)} ${T}V${B}`:`M${X(xmin)} ${Y(m*xmin+b)}L${X(xmax)} ${Y(m*xmax+b)}`;s+=`<path d="${p}" clip-path="url(#${id})" stroke="${C[i%C.length]}" stroke-width="4" fill="none"/>`});
 if(triangle){let [x1,y1,x2,y2]=triangle;s+=`<path d="M${X(x1)} ${Y(y1)}H${X(x2)}V${Y(y2)}" stroke="#287268" stroke-width="3" stroke-dasharray="7 5" fill="none"/><text x="${(X(x1)+X(x2))/2}" y="${Y(y1)+32}" text-anchor="middle" font-size="19" fill="#287268">Δx = ${x2-x1}</text><text x="${X(x2)+12}" y="${(Y(y1)+Y(y2))/2}" font-size="19" fill="#287268">Δy = ${y2-y1}</text>`}
 points.forEach(([x,y,label])=>{s+=`<circle cx="${X(x)}" cy="${Y(y)}" r="6" fill="#69416f"/><text x="${X(x)+10}" y="${Y(y)-12}" font-size="18" fill="#69416f">${esc(label||'')}</text>`});return s+'</svg>';
}
const captions={plano:'Primero se lee x y después y. La escala aparece en ambos ejes.','pendiente-2':'El triángulo compara el cambio vertical con el mismo avance horizontal.','pendiente-negativa':'El avance horizontal es positivo y el cambio vertical es negativo.','factor-area':'Una misma altura multiplica la suma de las dos bases.','sistema-rectas':'Un punto común debe estar sobre las dos rectas.',paralelas:'Misma pendiente y distinto corte: no hay intersección.',coincidentes:'Las dos ecuaciones describen la misma recta.'};
function pieces(groups,unit='x'){
 return groups.map((n,i)=>`<div class="piece-row"><strong>Grupo ${i+1}: ${n>0?'+':''}${n}${unit}</strong><div class="pieces">${Array.from({length:Math.abs(n)},()=>`<span class="tile${n<0?' negative':''}">${n<0?'−':''}${unit}</span>`).join('')}</div></div>`).join('');
}
function balance(stage=0,bad=false){
 let left=stage===0?'x + 3':'x',right=stage===0?'8':'5';if(bad){left='x';right='8'}
 return `<svg class="plot" viewBox="0 0 600 360" role="img" aria-label="Modelo de balanza: ${left} igual a ${right}"><path d="M300 70V310M240 310H360" stroke="#244b78" stroke-width="8" fill="none"/><path d="M95 ${bad?120:90}L505 ${bad?60:90}" stroke="#244b78" stroke-width="7"/><path d="M95 ${bad?120:90}L35 225H155ZM505 ${bad?60:90}L445 225H565Z" stroke="#244b78" stroke-width="3" fill="none"/><text x="95" y="205" font-size="43" fill="#69416f" text-anchor="middle">${left}</text><text x="505" y="205" font-size="43" fill="#c74735" text-anchor="middle">${right}</text><text x="300" y="270" font-size="39" text-anchor="middle">${bad?'≠':'='}</text></svg>`;
}
function area(a='a',b='b',c='c',weights=[2,1]){
 return `<div class="area-labels">${M(b)}${M(c)}</div><div class="area-model" style="grid-template-columns:${weights[0]}fr ${weights[1]}fr"><span class="area-height">${M(a)}</span><div>${M(a+'('+b+')')}</div><div>${M(a+'('+c+')')}</div></div>${M(a+'('+b+'+'+c+')='+a+'('+b+')+'+a+'('+c+')',true)}`;
}
const systemConfig={
 43:[[2,0],[-1,3],[1,2]],44:[[-1,7],[1,-1],[4,3]],45:[[-1.5,8],[-.5,4],[4,2]],46:[[-2/3,4],[1,-1],[3,2]],47:[[-2/3,13/3],[1.5,0],[2,3]],48:[[1,-2],[-1,8],[5,3]],49:[[-2,11],[3,-9],[4,3]],50:[[-1,5],[2,-2],[7/3,8/3]],51:[[-1,7],[2,-2],[3,4]],52:[[-2,8],[3,-7],[3,2]],53:[[-1,4],[-1,4]],54:[[-1,4],[-1,5]],55:[[-1,20],[-5/3,760/30],[8,12]]
};
function visual(kind,ctx={}){
 let n=ctx.example||0,k=ctx.frame||0,s='';let cap=captions[kind]||'';
 switch(kind){
 case 'plano':s=plot({points:[[3,2,'A'],[-2,3,'B'],[-3,-2,'C'],[2,-3,'D']]});break;
 case 'pendiente-2':s=plot({lines:[[2,1]],points:[[0,1,'A(0,1)'],[2,5,'B(2,5)']],xlim:[-1,5],ylim:[-1,7],triangle:[0,1,2,5]});break;
 case 'pendiente-fraccion':s=plot({lines:[[1.5,-.5]],points:[[-1,-2,'A'],[3,4,'B']],triangle:[-1,-2,3,4]});break;
 case 'pendiente-negativa':s=plot({lines:[[-2,1]],points:[[-2,5,'A'],[2,-3,'B']],ylim:[-5,7],triangle:[-2,5,2,-3]});break;
 case 'horizontal-vertical':s=plot({lines:[[0,2],[null,2]]});cap='Roja: y = 2, horizontal. Azul: x = 2, vertical.';break;
 case 'recta-b':s=plot({lines:[[-2,6]],points:[[1,4,'A'],[3,0,'B']],xlim:[-1,6],ylim:[-1,7]});break;
 case 'recta-decreciente':s=plot({lines:[[-1,3]],points:[[0,3,'A'],[1,2,'B'],[2,1,'C'],[3,0,'D']]});break;
 case 'recta-cortes':s=plot({lines:[[-2,4]],points:[[0,4,'(0,4)'],[2,0,'(2,0)']]});break;
 case 'recta-parejas':s=plot({lines:[[-1,6]],points:[[0,6,'A'],[2,4,'B'],[6,0,'C']],xlim:[-2,8],ylim:[-2,8]});break;
 case 'puntos':s=plot({lines:[[-2,7]],points:[[2,3,'P: sí'],[3,2,'Q: no']],xlim:[-1,6],ylim:[-1,8]});break;
 case 'sistema-rectas':s=plot({lines:n===43?[[2,0],[-1,3]]:[[1,1],[-1,5]],points:n===43?[[1,2,'(1,2)']]:[[2,3,'(2,3)']],xlim:[-1,6],ylim:[-1,7]});break;
 case 'paralelas':s=plot({lines:[[1,1],[1,-2]]});break;
 case 'coincidentes':s=plot({lines:[[-1,4]],points:[[0,4,''],[2,2,''],[4,0,'']]});break;
 case 'proporcion':s=n===5?plot({lines:[[35,0]],points:[[4,140,'4 boletos'],[7,245,'7 boletos']],xlim:[0,8],ylim:[0,280]}):plot({lines:[[2,0]],points:[[0,0,'Origen'],[2,4,'Doble']],xlim:[0,6],ylim:[0,12]});cap=n===5?'Eje horizontal: boletos. Eje vertical: costo en pesos.':'Modelo ilustrado: y = 2x. La recta pasa por el origen.';break;
 case 'tanque':case 'tabla-tanque':s=plot({lines:[[6,n===2?10:0]],points:n===2?[[0,10,'Inicio'],[6,46,'6 min']]:[[0,0,'Inicio'],[4,24,'4 min']],xlim:[0,8],ylim:[0,60]});cap='Eje x: minutos. Eje y: litros de agua.';break;
 case 'taxi':s=plot({lines:[[15,30]],points:[[0,30,'Inicio'],[4,90,'4 km']],xlim:[0,6],ylim:[0,130]});cap='Eje x: kilómetros. Eje y: costo en pesos.';break;
 case 'semejantes':s=pieces(n===12?[6,2,5]:n===13?[-3,-7,-1]:n===16?[12,3,-5,-8,-1]:[3,5],n===12?'x²':n===13?'ab':n===16?'a':'x');cap='Cada ficha representa la misma parte de letras. El color distingue el signo.';break;
 case 'recta-numerica':{let X=x=>40+(x+14)/16*520;s=`<svg class="plot" viewBox="0 0 600 190" role="img" aria-label="Suma de −12 y +5 sobre la recta numérica"><path d="M30 100H575" stroke="#242126" stroke-width="3"/>`;for(let x=-14;x<=2;x+=2)s+=`<path d="M${X(x)} 93v14" stroke="#242126"/><text x="${X(x)}" y="135" text-anchor="middle" font-size="20">${x}</text>`;s+=`<path d="M${X(-12)} 65H${X(-7)}l-13 -8m13 8l-13 8" stroke="#244b78" stroke-width="4" fill="none"/><circle cx="${X(-12)}" cy="100" r="6" fill="#c74735"/><circle cx="${X(-7)}" cy="100" r="7" fill="#69416f"/><text x="${X(-10)}" y="42" font-size="25" text-anchor="middle">+5</text></svg>`;cap='Partimos de −12 y avanzamos 5 hacia la derecha. Llegamos a −7.';break;}
 case 'cancelacion':s=pieces([9,-9],'a²')+M('9a^2-9a^2=0',true);cap='Cada ficha positiva tiene una opuesta que la cancela.';break;
 case 'clases':s='<div class="piece-row"><strong>Clase a²</strong>'+M('4a^2+2a^2=6a^2',true)+'</div><div class="piece-row"><strong>Clase a</strong>'+M('-3a+8a=5a',true)+'</div><div class="piece-row"><strong>Constantes</strong>'+M('7-5=2',true)+'</div>';break;
 case 'signos':s='<div class="flow"><div class="line">'+M('-(2x-3)',true)+'</div><div class="line">'+M('(-1)(2x)+(-1)(-3)',true)+'</div><div class="line">'+M('-2x+3',true)+'</div></div>';cap='El factor −1 multiplica a todos los términos del paréntesis.';break;
 case 'factor-area':s=n===20?'<div class="flow">'+M('4ab\\,(2a-3b)',true)+M('4ab(2a)\\quad+\\quad4ab(-3b)',true)+'</div>':area(n===19?'6x^2':'a',n===19?'2x':'b',n===19?'3':'c');cap=n===20?'Esquema algebraico: el factor 4ab multiplica las dos partes.':'Modelo de la distributiva. Las longitudes con letras se muestran sin escala.';break;
 case 'pieza':s='<div class="flow"><div class="line">'+M('P=(a-b)',true)+'</div><div class="line">'+M('2xP+7P',true)+'</div><div class="line">'+M('P(2x+7)',true)+'</div></div>';if(n===22)s='<div class="flow">'+M('1-x=-(x-1)',true)+M('3(x-1)+2(x-1)',true)+M('5(x-1)',true)+'</div>';cap='Una expresión completa puede ser la pieza que se repite.';break;
 case 'agrupacion':s=n===24?M('\\underbrace{3a(x-2)}_{\\text{grupo 1}}+\\underbrace{b(x-2)}_{\\text{grupo 2}}',true):M('\\underbrace{x(x+3)}_{\\text{grupo 1}}+\\underbrace{2(x+3)}_{\\text{grupo 2}}',true);cap='El segundo factor coincide en ambos grupos.';break;
 case 'balanza':
  if(n===26){s=pieces([4],'x')+M('4x=28',true);cap='Cuatro paquetes iguales contienen 28 lápices en total.'}
  else if(n===27){s=pieces([3],'x')+M('3x+2=14',true);cap='Tres artículos del mismo precio y una bolsa de 2 pesos.'}
  else if(n===28||n===29){s=plot({lines:[[2,6],[2,n===28?6:9]],xlim:[-2,5],ylim:[0,20]});cap=n===28?'Las dos expresiones valen lo mismo para todo x.':'La segunda expresión siempre supera a la primera por 3.'}
  else if(n===30){s=plot({lines:[[5,-7],[2,8]],points:[[5,18,'Ambos lados: 18']],xlim:[0,8],ylim:[0,35]});cap='Cuando x = 5, las dos expresiones de la ecuación tienen el mismo valor.'}
  else if(n===31){s=plot({lines:[[3,-2],[2,9]],points:[[11,31,'Ambos lados: 31']],xlim:[0,14],ylim:[-5,45]});cap='La primera expresión reducida es 3x − 2 y la segunda es 2x + 9.'}
  else if(n===34){s=plot({lines:[[-2,7],[0,15]],points:[[-4,15,'x = −4']],xlim:[-6,2],ylim:[0,20]});cap='La altura de 7 − 2x llega a 15 cuando x = −4.'}
  else{s=balance(n===25&&k>=2?1:0);cap='La caja representa la misma cantidad antes y después de una operación válida.'}break;
 case 'compra':s=M('\\underbrace{x}_{\\text{mochila}}+\\underbrace{25+25+25}_{\\text{cuadernos}}=235',true);cap='Cada parte de la compra aparece una vez en el total.';break;
 case 'fracciones':s=n===33?M('6\\left(\\frac{x-1}{2}+\\frac{x}{3}\\right)=6(4)',true):M('\\frac{x}{3}+2=5',true);cap='El denominador y los paréntesis indican exactamente qué cantidad se divide.';break;
 case 'despeje':s=n===36?`<svg class="plot" viewBox="0 0 600 380" role="img" aria-label="Triángulo de base 8 centímetros y altura 6 centímetros"><path d="M70 310H530L290 55Z" fill="#e4edf4" stroke="#244b78" stroke-width="4"/><path d="M290 55V310h23v-23h-23" fill="none" stroke="#69416f" stroke-width="3" stroke-dasharray="7 5"/><text x="300" y="350" text-anchor="middle" font-size="27">b = 8 cm</text><text x="305" y="180" font-size="27">${k>=4?"h = 6 cm":"h = ?"}</text></svg>`:n===38?`<svg class="plot" viewBox="0 0 600 320" role="img" aria-label="Rectángulo de lados 10 y 5 centímetros"><rect x="80" y="50" width="440" height="220" fill="#e4edf4" stroke="#244b78" stroke-width="4"/><text x="300" y="300" text-anchor="middle" font-size="27">${k>=4?"a = 10 cm":"a = ?"}</text><text x="300" y="33" text-anchor="middle" font-size="27">${k>=4?"a = 10 cm":"a = ?"}</text><text x="300" y="170" text-anchor="middle" font-size="28">b = 5 cm en cada lado corto</text></svg>`:n===39?area('x','a','b'):'<div class="flow">'+M('y=mx+b',true)+M('\\text{restar }b\\text{ en ambos lados}',true)+M('y-b=mx',true)+M('\\text{dividir ambos lados entre }m\\ne0',true)+M('x=\\frac{y-b}{m}',true)+'</div>';break;
 case 'sistema':{let conf=systemConfig[n]||systemConfig[44];let pt=conf[2];s=plot({lines:conf.slice(0,2),points:pt?[[pt[0],pt[1],'Solución']]:[],xlim:n===55?[0,20]:[-1,8],ylim:n===55?[0,28]:[-1,9]});cap=pt?'La pareja encontrada es el punto donde se cumplen las dos ecuaciones.':n===53?'La información se repite: ambas ecuaciones dan la misma recta.':'Las rectas son paralelas y distintas.';break;}
 case 'eliminacion3':s='<div class="flow"><div class="line">'+M('E_1,\\ E_2,\\ E_3',true)+'</div><div class="line">'+M('\\Downarrow\\ \\text{eliminar la misma letra}',true)+'</div><div class="line">'+M('A(x,y),\\ B(x,y)',true)+'</div><div class="line">'+M('\\Downarrow\\ \\text{resolver y sustituir}',true)+'</div>'+M('(x,y,z)',true)+'</div>';cap='El regreso a las ecuaciones originales permite recuperar la tercera incógnita.';break;
 case 'boletos':s='<div class="piece-row"><strong>Cantidad de boletos</strong>'+M('a+e=20',true)+'</div><div class="piece-row"><strong>Recaudación en pesos</strong>'+M('50a+30e=760',true)+'</div>';break;
 case 'compras3':s='<table><thead><tr><th>Compra</th><th>Cuadernos</th><th>Lápices</th><th>Gomas</th><th>Total</th></tr></thead><tbody><tr><td>1</td><td>1</td><td>1</td><td>1</td><td>$30</td></tr><tr><td>2</td><td>2</td><td>1</td><td>1</td><td>$48</td></tr><tr><td>3</td><td>1</td><td>2</td><td>1</td><td>$35</td></tr></tbody></table>';cap='Comparar compras que cambian solo un producto simplifica el sistema.';break;
 }
 return s?'<figure class="support">'+s+(cap?'<figcaption class="visual-caption">'+cap+'</figcaption>':'')+'</figure>':'';
}
function lab(host,type,renderMath){
 let state={t:4,m:2,b:1,a:3,c:4,d:2,stage:0,mode:'cruce'};
 function slider(id,label,min,max,value,step=1){return `<label>${label}: <output data-value="${id}">${value}</output><input type="range" data-field="${id}" min="${min}" max="${max}" value="${value}" step="${step}" aria-label="${label}"></label>`}
 function repaint(){
 let control='',body='',right='';
 if(type==='tanque'){
  control=slider('t','Tiempo (min)',0,10,state.t);body=plot({lines:[[6,0],[6,10]],points:[[state.t,6*state.t,'A'],[state.t,6*state.t+10,'B']],xlim:[0,10],ylim:[0,80]});right=M('V_A=6t,\\qquad V_B=6t+10',true)+M(`V_A(${state.t})=${6*state.t},\\quad V_B(${state.t})=${6*state.t+10}`,true)+'<p>Roja: tanque inicialmente vacío. Azul: tanque con 10 litros al inicio.</p><p>Ambos aumentan 6 litros por minuto. Solo A representa proporcionalidad directa.</p>';
 }else if(type==='pendiente'){
  control=slider('m','Pendiente m',-3,3,state.m,.5)+slider('b','Corte b',-4,4,state.b);
  body=plot({lines:[[state.m,state.b]],points:[[0,state.b,'b'],[1,state.m+state.b,'']],ylim:[-7,7]});right=M(`y=${state.m}x${state.b>=0?'+':''}${state.b}`,true)+`<p>La recta es <strong>${state.m>0?'creciente':state.m<0?'decreciente':'horizontal'}</strong>.</p><p>Por cada unidad que aumenta x, y cambia ${state.m} unidades. Cuando x = 0, y = ${state.b}.</p><p>Cambia primero solo m. Después cambia solo b y compara.</p>`;
 }else if(type==='terminos'){
  control=['mismo','opuestos','clases'].map((x,i)=>`<button data-mode="${x}" aria-pressed="${(state.mode==='cruce'?'mismo':state.mode)===x}">${['Misma clase','Signos opuestos','Clases diferentes'][i]}</button>`).join('');let md=state.mode==='cruce'?'mismo':state.mode;
  if(md==='mismo'){body=pieces([3,2],'x');right=M('3x+2x=(3+2)x=5x',true)+'<p>Las cinco fichas representan el mismo tipo de cantidad.</p>'}
  if(md==='opuestos'){body=pieces([3,-2],'x');right=M('3x-2x=x',true)+'<p>Dos pares opuestos se cancelan. Queda una ficha positiva.</p>'}
  if(md==='clases'){body=pieces([3],'x')+pieces([2],'x²');right=M('3x+2x^2',true)+'<p>Las partes literales son distintas. Conservamos dos clases en el resultado.</p>'}
 }else if(type==='factor'){
  control=slider('a','Altura a',1,6,state.a)+slider('c','Base b',1,6,state.c)+slider('d','Base c',1,6,state.d);body=area(String(state.a),String(state.c),String(state.d),[state.c,state.d]);right=M(`${state.a}(${state.c}+${state.d})=${state.a*state.c}+${state.a*state.d}=${state.a*(state.c+state.d)}`,true)+'<p>El área del rectángulo completo es la suma de las áreas de sus dos partes.</p>'+M('a(b+c)=ab+ac',true);
 }else if(type==='balanza'){
  control='<button data-act="reset">Reiniciar</button><button data-act="remove" class="primary" '+(state.stage?'disabled':'')+'>Quitar 3 de ambos lados</button><button data-act="bad" '+(state.stage?'disabled':'')+'>Quitar 3 solo a la izquierda</button>';body=balance(state.stage,state.mode==='bad');right=state.mode==='bad'?M('x\\ne8',true)+'<p>La caja seguía valiendo 5. Quitar 3 de un solo lado rompió la igualdad.</p>':state.stage?M('x+3-3=8-3\\quad\\Longrightarrow\\quad x=5',true)+'<p>La caja no cambió. Solo retiramos la misma cantidad en los dos lados.</p>':M('x+3=8',true)+'<p>La caja vale 5. Usa los controles para observar qué operaciones conservan el equilibrio.</p>';
 }else if(type==='sistemas'){
  control=['cruce','paralelas','coincidentes'].map((x,i)=>`<button data-mode="${x}" aria-pressed="${state.mode===x}">${['Una solución','Ninguna','Infinitas'][i]}</button>`).join('');let conf=state.mode==='paralelas'?[[1,1],[1,-2]]:state.mode==='coincidentes'?[[-1,4],[-1,4]]:[[1,1],[-1,5]];body=plot({lines:conf,points:state.mode==='cruce'?[[2,3,'(2,3)']]:[]});right=state.mode==='paralelas'?M('y=x+1,\\qquad y=x-2',true)+'<p>Misma pendiente, distinto corte. No hay un punto común.</p>':state.mode==='coincidentes'?M('x+y=4,\\qquad2x+2y=8',true)+'<p>Las ecuaciones representan la misma recta. Todos sus puntos son comunes.</p>':M('y=x+1,\\qquad y=-x+5',true)+'<p>Las rectas se cruzan en (2,3). La pareja cumple las dos ecuaciones.</p>';
 }else if(type==='sustitucion'){
  control='<button data-act="reset">Reiniciar</button><button data-act="step" class="primary">Siguiente sustitución</button>';let f=[['x=y+2,\\qquad x+y=8','Sabemos cuánto vale x en términos de y.'],['(y+2)+y=8','Reemplazamos la x por toda la expresión y + 2.'],['2y+2=8\\quad\\Longrightarrow\\quad y=3','La nueva ecuación contiene solo y.'],['x=3+2=5','Regresamos al despeje para recuperar x.'],['5=3+2,\\qquad5+3=8','La comprobación usa las dos ecuaciones originales.']][Math.min(state.stage,4)];body=M(f[0],true);right='<p>'+f[1]+'</p><p>Etapa '+(Math.min(state.stage,4)+1)+' de 5.</p>';
 }else if(type==='tres'){
  control='<button data-act="reset">Reiniciar</button><button data-act="step" class="primary">Siguiente combinación</button>';let f=[['\\begin{cases}x+y+z=6\\\\2x-y+z=3\\\\x+2y-z=2\\end{cases}','Numeramos E₁, E₂ y E₃.'],['E_2-E_1:\\quad x-2y=-3','Primera eliminación de z. Llamamos A a esta ecuación.'],['E_3+E_1:\\quad2x+3y=8','Segunda eliminación de z. Llamamos B a esta ecuación.'],['-2A+B:\\quad7y=14\\quad\\Longrightarrow\\quad y=2','Eliminamos x en el sistema reducido.'],['x=1,\\qquad z=3','Sustituimos hacia atrás para recuperar las otras letras.'],['1+2+3=6,\\quad2-2+3=3,\\quad1+4-3=2','La terna (1,2,3) cumple las tres originales.']][Math.min(state.stage,5)];body=M(f[0],true);right='<p>'+f[1]+'</p><p>Etapa '+(Math.min(state.stage,5)+1)+' de 6.</p>';
 }
 host.innerHTML='<div class="lab-controls">'+control+'</div><div class="lab-layout"><div>'+body+'</div><div class="lab-output">'+right+'</div></div>';
 host.querySelectorAll('[data-field]').forEach(x=>x.oninput=()=>{state[x.dataset.field]=Number(x.value);repaint()});host.querySelectorAll('[data-mode]').forEach(x=>x.onclick=()=>{state.mode=x.dataset.mode;repaint()});host.querySelectorAll('[data-act]').forEach(x=>x.onclick=()=>{if(x.dataset.act==='reset'){state.stage=0;state.mode='cruce'}if(x.dataset.act==='remove'){state.stage=1;state.mode='cruce'}if(x.dataset.act==='bad'){state.mode='bad';state.stage=1}if(x.dataset.act==='step')state.stage++;repaint()});renderMath(host);
 }
 repaint();
}
return{visual,lab,plot};})();
