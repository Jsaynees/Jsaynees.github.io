(function(global){
  'use strict';

  const R = {
    int(min,max){ return Math.floor(Math.random()*(max-min+1))+min; },
    pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; },
    sign(){ return Math.random()<.5?-1:1; },
    nonzero(min,max){ let n=0; while(!n)n=this.int(min,max); return n; },
    gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ const t=b;b=a%b;a=t;} return a||1; },
    frac(n,d){ if(d<0){n=-n;d=-d;} const g=this.gcd(n,d); return {n:n/g,d:d/g}; },
    fmt(n,digits=2){ if(Math.abs(n)<1e-10)n=0; return Number(n.toFixed(digits)).toString(); },
    esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); },
    math(s){ return '<span class="practice-math">'+s+'</span>'; },
    level(level, easy, medium, challenge){ return level==='challenge'?challenge:level==='medium'?medium:easy; }
  };

  function numberExercise(prompt,answer,unit,hint,solution,tolerance){
    return {kind:'number',prompt,answer,unit:unit||'',hint,solution,tolerance:tolerance==null?Math.max(.01,Math.abs(answer)*.005):tolerance};
  }
  function pairExercise(prompt,a,b,labels,hint,solution,tolerance){
    return {kind:'pair',prompt,answers:[a,b],labels:labels||['x','y'],hint,solution,tolerance:tolerance==null?.02:tolerance};
  }
  function fractionExercise(prompt,n,d,hint,solution){ const f=R.frac(n,d); return {kind:'fraction',prompt,num:f.n,den:f.d,hint,solution}; }
  function detective(intro,steps,wrongIndex,explanation,corrected){ return {kind:'detective',prompt:intro,steps,wrongIndex,explanation,corrected,hint:'Busca el primer paso donde se rompe una regla, no solamente el resultado final.',solution:explanation+' '+corrected}; }
  function procedure(intro,rows,hint,solution){ return {kind:'procedure',prompt:intro,rows,hint,solution}; }

  const topicMeta={
    matematicas1:{
      title:'Matemáticas I', back:'mates1.html', pdf:'materiales/matematicas1/antologia-matematicas-1.pdf',
      topics:{
        numeros:{label:'Números, fracciones y porcentajes',page:11},
        rectas:{label:'Variación y funciones lineales',page:32},
        ecuaciones:{label:'Ecuaciones de primer grado',page:42},
        sistemas:{label:'Sistemas de ecuaciones 2×2',page:51}
      }
    },
    fisica1:{
      title:'Física I', back:'fisica1.html', pdf:'materiales/fisica1/antologia-fisica-1.pdf',
      topics:{
        medicion:{label:'Unidades y notación científica',page:18},
        cinematica:{label:'MRU y MRUA',page:31},
        newton:{label:'Leyes de Newton',page:48},
        energia:{label:'Trabajo, energía y calor',page:54}
      }
    },
    fisica3:{
      title:'Física III', back:'fisica3.html', pdf:'materiales/fisica3/antologia-fisica-3.pdf',
      topics:{
        vectores:{label:'Vectores y componentes',page:9},
        torca:{label:'Torca y equilibrio',page:24},
        rotacion:{label:'Dinámica de rotación',page:28},
        hidro:{label:'Hidrostática y Pascal',page:40},
        flujo:{label:'Arquímedes y continuidad',page:44}
      }
    }
  };

  // ---------- Matemáticas I: generador infinito ----------
  function genMathNumeros(level){
    if(Math.random()<.58){
      const max=R.level(level,9,14,20), b=R.int(2,max), d=R.int(2,max), a=R.int(1,b-1), c=R.int(1,d-1), op=R.pick(['+','−']);
      const n=op==='+'?a*d+c*b:a*d-c*b, den=b*d, f=R.frac(n,den);
      return fractionExercise(`Calcula y simplifica: ${R.math(`${a}/${b} ${op} ${c}/${d}`)}.`,n,den,'Busca un denominador común antes de operar los numeradores.',`Denominador común: ${b}·${d}=${den}. El numerador es ${op==='+'?`${a}·${d}+${c}·${b}`:`${a}·${d}−${c}·${b}`}=${n}. Resultado simplificado: ${R.math(`${f.n}/${f.d}`)}.`);
    }
    const p=R.pick(level==='easy'?[10,20,25,50]:level==='medium'?[12,15,18,30,35,45]:[7.5,12.5,17.5,22.5,37.5]);
    const base=R.level(level,R.int(4,30)*10,R.int(8,80)*10,R.int(20,160)*10);
    const ans=base*p/100;
    return numberExercise(`¿Cuánto es ${R.math(`${p}% de ${base}`)}?`,ans,'','Convierte el porcentaje a decimal y multiplícalo por la cantidad.',`${p}%=${R.fmt(p/100,3)}. Entonces ${R.fmt(p/100,3)}·${base}=${R.fmt(ans)}.`,.01);
  }
  function genMathRectas(level){
    if(Math.random()<.55){
      const m=R.nonzero(-R.level(level,4,7,10),R.level(level,4,7,10)), b=R.int(-R.level(level,6,10,15),R.level(level,6,10,15)), x=R.int(-R.level(level,5,8,12),R.level(level,5,8,12)), y=m*x+b;
      return numberExercise(`Para la función ${R.math(`y=${m}x${b>=0?'+':''}${b}`)}, calcula ${R.math(`y`)} cuando ${R.math(`x=${x}`)}.`,y,'','Sustituye el valor de x y respeta la jerarquía de operaciones.',`y=${m}(${x})${b>=0?'+':''}${b}=${m*x}${b>=0?'+':''}${b}=${y}.`,.001);
    }
    const m=R.nonzero(-R.level(level,4,6,9),R.level(level,4,6,9)), x1=R.int(-5,4), dx=R.pick(level==='challenge'?[2,3,4,5]:[1,2,3]), x2=x1+dx, y1=R.int(-8,8), y2=y1+m*dx;
    return numberExercise(`Encuentra la pendiente de la recta que pasa por ${R.math(`(${x1},${y1})`)} y ${R.math(`(${x2},${y2})`)}.`,m,'','Usa m=(y₂−y₁)/(x₂−x₁) conservando el mismo orden arriba y abajo.',`m=(${y2}−${y1})/(${x2}−${x1})=${y2-y1}/${x2-x1}=${m}.`,.001);
  }
  function genMathEcuaciones(level){
    const x=R.int(-R.level(level,8,12,18),R.level(level,8,12,18)), a=R.nonzero(-R.level(level,6,9,12),R.level(level,6,9,12));
    if(level==='challenge' || (level==='medium'&&Math.random()<.45)){
      let c=R.nonzero(-8,8); while(c===a)c=R.nonzero(-8,8); const b=R.int(-12,12), d=(a-c)*x+b;
      return numberExercise(`Resuelve: ${R.math(`${a}x${b>=0?'+':''}${b}=${c}x${d>=0?'+':''}${d}`)}.`,x,'','Reúne los términos con x en un lado y las constantes en el otro.',`${a}x−${c}x=${d}−${b}; ${a-c}x=${d-b}; x=${d-b}/${a-c}=${x}.`,.001);
    }
    const b=R.int(-15,15), c=a*x+b;
    return numberExercise(`Resuelve: ${R.math(`${a}x${b>=0?'+':''}${b}=${c}`)}.`,x,'','Aísla primero el término con x y luego divide entre su coeficiente.',`${a}x=${c}−(${b})=${c-b}; x=${c-b}/${a}=${x}.`,.001);
  }
  function genMathSistemas(level){
    const x=R.int(-R.level(level,6,9,12),R.level(level,6,9,12)), y=R.int(-R.level(level,6,9,12),R.level(level,6,9,12));
    if(level==='easy'){
      const s=x+y,d=x-y;
      return pairExercise(`Resuelve el sistema: ${R.math(`x+y=${s}`)} y ${R.math(`x−y=${d}`)}.`,x,y,['x','y'],'Suma ambas ecuaciones para eliminar y.',`Al sumar: 2x=${s+d}, por tanto x=${x}. Luego y=${s}−${x}=${y}.`,.001);
    }
    let a=R.nonzero(-5,5),b=R.nonzero(-5,5),c=R.nonzero(-5,5),d=R.nonzero(-5,5); while(a*d-b*c===0){d=R.nonzero(-5,5);} const e=a*x+b*y,f=c*x+d*y;
    return pairExercise(`Resuelve: ${R.math(`${a}x${b>=0?'+':''}${b}y=${e}`)} y ${R.math(`${c}x${d>=0?'+':''}${d}y=${f}`)}.`,x,y,['x','y'],'Elimina una variable multiplicando una o ambas ecuaciones.',`La solución que satisface simultáneamente ambas ecuaciones es ${R.math(`(x,y)=(${x},${y})`)}. Sustituirla verifica ${e} y ${f}.`,.001);
  }

  // ---------- Física I: generador infinito ----------
  function genF1Medicion(level){
    if(Math.random()<.58){
      const ms=R.level(level,R.int(2,20),R.int(5,35)+.5,R.int(10,55)+R.pick([.25,.5,.75])), kmh=ms*3.6;
      return numberExercise(`Convierte ${R.math(`${R.fmt(kmh,2)} km/h`)} a ${R.math('m/s')}.`,ms,'m/s','Para pasar de km/h a m/s divide entre 3.6.',`${R.fmt(kmh,2)}÷3.6=${R.fmt(ms,2)} m/s.`,.02);
    }
    const exp=R.int(level==='challenge'?-8:-5,level==='easy'?5:8), coeff=R.level(level,R.int(1,9),R.int(10,99)/10,R.int(100,999)/100), value=coeff*Math.pow(10,exp);
    return numberExercise(`Escribe en forma decimal ${R.math(`${R.fmt(coeff,2)}×10<sup>${exp}</sup>`)}.`,value,'','Un exponente positivo mueve el punto a la derecha; uno negativo, a la izquierda.',`${R.fmt(coeff,2)}×10^${exp}=${value.toExponential(6).replace('e','×10^')}.`,Math.max(Math.abs(value)*.002,1e-10));
  }
  function genF1Cinematica(level){
    const type=R.pick(level==='easy'?['mru','vf']:['mru','vf','dx']);
    if(type==='mru'){
      const v=R.int(2,R.level(level,15,25,40)),t=R.int(2,R.level(level,12,18,25)),x=v*t;
      return numberExercise(`Un móvil mantiene ${R.math(`v=${v} m/s`)} durante ${R.math(`t=${t} s`)}. ¿Qué distancia recorre?`,x,'m','En MRU: Δx=v·t.',`Δx=${v}·${t}=${x} m.`,.01);
    }
    const v0=R.int(0,12),a=R.nonzero(-4,6),t=R.int(2,8),vf=v0+a*t;
    if(type==='vf') return numberExercise(`Un móvil parte con ${R.math(`v₀=${v0} m/s`)}, tiene ${R.math(`a=${a} m/s²`)} durante ${R.math(`t=${t} s`)}. Calcula ${R.math('v_f')}.`,vf,'m/s','Usa v_f=v₀+a·t.',`v_f=${v0}+(${a})(${t})=${vf} m/s.`,.01);
    const dx=v0*t+.5*a*t*t;
    return numberExercise(`Con ${R.math(`v₀=${v0} m/s`)}, ${R.math(`a=${a} m/s²`)} y ${R.math(`t=${t} s`)}, calcula el desplazamiento.`,dx,'m','Usa Δx=v₀t+½at².',`Δx=${v0}(${t})+½(${a})(${t}²)=${R.fmt(dx)} m.`,.02);
  }
  function genF1Newton(level){
    if(level!=='easy'&&Math.random()<.48){
      const m=R.int(2,20),mu=R.pick(level==='challenge'?[.15,.2,.25,.3,.35]:[.1,.2,.25]),F=R.int(Math.ceil(mu*m*9.8)+5,Math.ceil(mu*m*9.8)+60),fr=mu*m*9.8,a=(F-fr)/m;
      return numberExercise(`Sobre un bloque de ${R.math(`${m} kg`)} actúan ${R.math(`${F} N`)}. Si ${R.math(`μ=${mu}`)}, calcula la aceleración usando ${R.math('g=9.8 m/s²')}.`,a,'m/s²','Calcula primero la fricción μmg y réstala de la fuerza aplicada.',`f=(${mu})(${m})(9.8)=${R.fmt(fr)} N; F_neta=${F}−${R.fmt(fr)}=${R.fmt(F-fr)} N; a=F_neta/m=${R.fmt(a)} m/s².`,.03);
    }
    const m=R.int(2,R.level(level,15,25,40)),a=R.int(1,R.level(level,8,12,18)),F=m*a;
    return numberExercise(`¿Qué fuerza neta se requiere para acelerar una masa de ${R.math(`${m} kg`)} a ${R.math(`${a} m/s²`)}?`,F,'N','Aplica la segunda ley: F=m·a.',`F=${m}·${a}=${F} N.`,.01);
  }
  function genF1Energia(level){
    const type=R.pick(level==='easy'?['ec','ep']:['ec','ep','calor']);
    if(type==='ec'){
      const m=R.int(1,R.level(level,10,18,30)),v=R.int(2,R.level(level,12,18,25)),E=.5*m*v*v;
      return numberExercise(`Calcula la energía cinética de un cuerpo de ${R.math(`${m} kg`)} que se mueve a ${R.math(`${v} m/s`)}.`,E,'J','Usa E_c=½mv²; la rapidez se eleva al cuadrado.',`E_c=½(${m})(${v}²)=${R.fmt(E)} J.`,.02);
    }
    if(type==='ep'){
      const m=R.int(1,20),h=R.int(1,R.level(level,10,18,30)),E=m*9.8*h;
      return numberExercise(`Calcula la energía potencial de ${R.math(`${m} kg`)} a una altura de ${R.math(`${h} m`)} con ${R.math('g=9.8 m/s²')}.`,E,'J','Usa E_p=mgh.',`E_p=(${m})(9.8)(${h})=${R.fmt(E)} J.`,.03);
    }
    const m=R.int(1,5),c=R.pick([420,900,4186]),dT=R.int(5,35),Q=m*c*dT;
    return numberExercise(`Una masa de ${R.math(`${m} kg`)} con ${R.math(`c=${c} J/(kg·°C)`)} aumenta ${R.math(`${dT} °C`)}. Calcula el calor absorbido.`,Q,'J','Usa Q=m·c·ΔT.',`Q=(${m})(${c})(${dT})=${Q} J.`,.1);
  }

  // ---------- Física III: generador infinito ----------
  function genF3Vectores(level){
    if(Math.random()<.5){
      const triples=R.pick([[3,4,5],[5,12,13],[8,15,17],[7,24,25]]),scale=R.level(level,1,R.int(1,3),R.int(2,5)),x=triples[0]*scale,y=triples[1]*scale,m=triples[2]*scale;
      return numberExercise(`Un vector tiene componentes ${R.math(`V_x=${x}`)} y ${R.math(`V_y=${y}`)}. Calcula su magnitud.`,m,'u','Usa |V|=√(V_x²+V_y²).',`|V|=√(${x}²+${y}²)=√${x*x+y*y}=${m}.`,.01);
    }
    const ax=R.int(-10,10),ay=R.int(-10,10),bx=R.int(-10,10),by=R.int(-10,10);
    return pairExercise(`Suma ${R.math(`A=(${ax},${ay})`)} y ${R.math(`B=(${bx},${by})`)}. Escribe las componentes de ${R.math('R=A+B')}.`,ax+bx,ay+by,['Rₓ','Rᵧ'],'Suma por separado las componentes x y las componentes y.',`R_x=${ax}+(${bx})=${ax+bx}; R_y=${ay}+(${by})=${ay+by}.`,.001);
  }
  function genF3Torca(level){
    if(level==='easy'||Math.random()<.5){
      const F=R.int(5,R.level(level,60,100,160)),d=R.pick(level==='easy'?[.2,.5,1,1.5,2]:[.15,.25,.4,.75,1.2,1.8,2.5]),tau=F*d;
      return numberExercise(`Una fuerza perpendicular de ${R.math(`${F} N`)} actúa a ${R.math(`${d} m`)} del pivote. Calcula la torca.`,tau,'N·m','Para una fuerza perpendicular: τ=F·d.',`τ=(${F})(${d})=${R.fmt(tau)} N·m.`,.02);
    }
    const F1=R.int(10,80),d1=R.pick([.5,1,1.5,2]),d2=R.pick([.25,.5,1,1.25,2,2.5]),F2=F1*d1/d2;
    return numberExercise(`Para equilibrar una barra: ${R.math(`F₁=${F1} N`)}, ${R.math(`d₁=${d1} m`)} y ${R.math(`d₂=${d2} m`)}. Calcula ${R.math('F₂')}.`,F2,'N','En equilibrio: F₁d₁=F₂d₂.',`F₂=F₁d₁/d₂=(${F1})(${d1})/${d2}=${R.fmt(F2)} N.`,.03);
  }
  function genF3Rotacion(level){
    if(Math.random()<.55){
      const I=R.pick(level==='easy'?[1,2,4,5]:[.5,1.2,2.5,4,6]),alpha=R.int(1,R.level(level,8,12,18)),tau=I*alpha;
      return numberExercise(`Un cuerpo tiene ${R.math(`I=${I} kg·m²`)} y recibe ${R.math(`τ=${R.fmt(tau)} N·m`)}. Calcula ${R.math('α')}.`,alpha,'rad/s²','Usa τ=Iα y despeja α=τ/I.',`α=${R.fmt(tau)}/${I}=${alpha} rad/s².`,.02);
    }
    const I=R.pick([.5,1,1.5,2,3,4]),w=R.int(2,15),L=I*w;
    return numberExercise(`Calcula el momento angular si ${R.math(`I=${I} kg·m²`)} y ${R.math(`ω=${w} rad/s`)}.`,L,'kg·m²/s','Usa L=I·ω.',`L=(${I})(${w})=${R.fmt(L)} kg·m²/s.`,.02);
  }
  function genF3Hidro(level){
    if(level==='challenge'&&Math.random()<.55 || level==='medium'&&Math.random()<.35){
      const F1=R.int(20,150),A1=R.pick([.005,.01,.02,.025]),ratio=R.pick([4,5,8,10,12]),A2=A1*ratio,F2=F1*ratio;
      return numberExercise(`En una prensa hidráulica ${R.math(`F₁=${F1} N`)}, ${R.math(`A₁=${A1} m²`)} y ${R.math(`A₂=${R.fmt(A2,3)} m²`)}. Calcula ${R.math('F₂')}.`,F2,'N','Por Pascal: F₁/A₁=F₂/A₂.',`F₂=F₁(A₂/A₁)=${F1}(${R.fmt(A2,3)}/${A1})=${F2} N.`,.03);
    }
    const rho=R.pick([800,1000,1200,13600]),h=R.pick(level==='easy'?[1,2,3,5]:[.5,1.5,2.5,4,7]),P=rho*9.8*h;
    return numberExercise(`Calcula la presión hidrostática a ${R.math(`h=${h} m`)} en un fluido de ${R.math(`ρ=${rho} kg/m³`)}.`,P,'Pa','Usa P=ρgh.',`P=(${rho})(9.8)(${h})=${R.fmt(P)} Pa.`,.1);
  }
  function genF3Flujo(level){
    if(Math.random()<.5){
      const rho=R.pick([800,1000,1200]),V=R.pick(level==='easy'?[.001,.002,.005]:[.0005,.0015,.003,.007]),E=rho*9.8*V;
      return numberExercise(`Un volumen desplazado de ${R.math(`${V} m³`)} está en un fluido de ${R.math(`ρ=${rho} kg/m³`)}. Calcula el empuje.`,E,'N','Usa E=ρgV desplazado.',`E=(${rho})(9.8)(${V})=${R.fmt(E)} N.`,.03);
    }
    const A1=R.pick([2,3,4,5,6]),A2=R.pick([1,1.5,2]),v1=R.int(1,6),v2=A1*v1/A2;
    return numberExercise(`En una tubería ${R.math(`A₁=${A1} cm²`)}, ${R.math(`v₁=${v1} m/s`)} y ${R.math(`A₂=${A2} cm²`)}. Calcula ${R.math('v₂')}.`,v2,'m/s','Usa A₁v₁=A₂v₂; las áreas están en la misma unidad.',`v₂=A₁v₁/A₂=(${A1})(${v1})/${A2}=${R.fmt(v2)} m/s.`,.03);
  }

  // ---------- Detectives de error ----------
  function detMathNumeros(){
    const a=R.int(1,5),b=R.int(a+1,9),c=R.int(1,5),d=R.int(c+1,9);
    return detective(`Un alumno suma ${R.math(`${a}/${b}+${c}/${d}`)}. Selecciona el primer paso incorrecto.`,[
      `Busca un denominador común: ${b}·${d}=${b*d}.`,
      `Transforma: ${a}/${b}=${a*d}/${b*d} y ${c}/${d}=${c*b}/${b*d}.`,
      `Suma numeradores y denominadores: (${a*d}+${c*b})/(${b*d}+${b*d}).`,
      `Simplifica el resultado.`
    ],2,'Al sumar fracciones con el mismo denominador, el denominador se conserva; no se suma.',`El paso correcto es (${a*d}+${c*b})/${b*d}.`);
  }
  function detMathRectas(){
    const x1=R.int(-4,2),x2=x1+R.int(2,5),m=R.nonzero(-5,5),y1=R.int(-5,5),y2=y1+m*(x2-x1);
    return detective(`Se calcula la pendiente entre ${R.math(`(${x1},${y1})`)} y ${R.math(`(${x2},${y2})`)}. ¿Dónde aparece el error?`,[
      `m=(y₂−y₁)/(x₂−x₁).`,
      `m=(${y2}−${y1})/(${x1}−${x2}).`,
      `m=${y2-y1}/${x1-x2}.`,
      `m=${-m}.`
    ],1,'Se cambió el orden del denominador, pero no el del numerador. Ambos deben conservar el mismo orden.',`m=(${y2}−${y1})/(${x2}−${x1})=${m}.`);
  }
  function detMathEcuaciones(){
    const x=R.int(2,9),a=R.int(2,6),b=R.int(2,8),c=a*x-a*b;
    return detective(`Revisa la resolución de ${R.math(`${a}(x−${b})=${c}`)}.`,[
      `${a}(x−${b})=${c}`,
      `${a}x−${b}=${c}`,
      `${a}x=${c+b}`,
      `x=${R.fmt((c+b)/a)}`
    ],1,`Al distribuir, ${a} multiplica tanto a x como a −${b}.`,`La distribución correcta es ${a}x−${a*b}=${c}; entonces x=${x}.`);
  }
  function detMathSistemas(){
    const x=R.int(1,6),y=R.int(1,6),s=x+y,d=x-y;
    return detective(`Se resuelve ${R.math(`x+y=${s}`)} y ${R.math(`x−y=${d}`)} por suma.`,[
      `Se alinean ambas ecuaciones.`,
      `(x+y)+(x−y)=${s}+${d}.`,
      `2x−2y=${s+d}.`,
      `x=${x}.`
    ],2,'Al sumar +y y −y se cancelan; no queda −2y.',`La suma correcta es 2x=${s+d}; por tanto x=${x} y luego y=${y}.`);
  }
  function detF1Medicion(){
    const kmh=R.pick([36,54,72,90,108]);
    return detective(`Un alumno convierte ${R.math(`${kmh} km/h`)} a m/s.`,[
      `Usa 1 km=1000 m y 1 h=3600 s.`,
      `${kmh}·1000/3600 m/s.`,
      `${kmh}·3.6 m/s.`,
      `Resultado: ${R.fmt(kmh*3.6)} m/s.`
    ],2,'Para pasar de km/h a m/s se divide entre 3.6, no se multiplica.',`${kmh}/3.6=${R.fmt(kmh/3.6)} m/s.`);
  }
  function detF1Cinematica(){
    const v0=R.int(2,8),a=R.int(1,5),t=R.int(2,6);
    return detective(`Se calcula el desplazamiento con ${R.math(`v₀=${v0}`)}, ${R.math(`a=${a}`)} y ${R.math(`t=${t}`)}.`,[
      `Δx=v₀t+½at².`,
      `Δx=${v0}(${t})+½(${a})(${t}).`,
      `Δx=${v0*t}+${R.fmt(.5*a*t)}.`,
      `Δx=${R.fmt(v0*t+.5*a*t)} m.`
    ],1,'En el término acelerado el tiempo debe elevarse al cuadrado.',`Δx=${v0}(${t})+½(${a})(${t}²)=${R.fmt(v0*t+.5*a*t*t)} m.`);
  }
  function detF1Newton(){
    const m=R.int(2,12),a=R.int(2,8);
    return detective(`Se busca la fuerza para ${R.math(`m=${m} kg`)} y ${R.math(`a=${a} m/s²`)}.`,[
      `Segunda ley: F=m·a.`,
      `Se despeja F=a/m.`,
      `F=${a}/${m}.`,
      `F=${R.fmt(a/m)} N.`
    ],1,'F ya está aislada en F=m·a; no se debe dividir la aceleración entre la masa.',`F=${m}·${a}=${m*a} N.`);
  }
  function detF1Energia(){
    const m=R.int(2,8),v=R.int(3,10);
    return detective(`Se calcula la energía cinética de ${R.math(`${m} kg`)} a ${R.math(`${v} m/s`)}.`,[
      `E_c=½mv².`,
      `E_c=½(${m})(${v}).`,
      `E_c=${R.fmt(.5*m*v)}.`,
      `Resultado en joules.`
    ],1,'La rapidez debe elevarse al cuadrado.',`E_c=½(${m})(${v}²)=${R.fmt(.5*m*v*v)} J.`);
  }
  function detF3Vectores(){
    return detective(`Se obtienen las componentes de un vector de magnitud V con ángulo θ medido desde +x.`,[
      `V_x=V cosθ.`,
      `V_y=V sinθ.`,
      `Para θ=0°, V_x=0 y V_y=V.`,
      `La dirección queda sobre el eje x.`
    ],2,'A 0°, cos0=1 y sin0=0; por tanto V_x=V y V_y=0.',`Para θ=0° el vector apunta sobre +x: (V,0).`);
  }
  function detF3Torca(){
    const F=R.int(20,70),d=R.pick([.5,1,1.5]);
    return detective(`Se calcula la torca de una fuerza perpendicular de ${R.math(`${F} N`)} aplicada a ${R.math(`${d} m`)}.`,[
      `τ=F·d.`,
      `τ=${F}+${d}.`,
      `τ=${R.fmt(F+d)}.`,
      `Unidad: N·m.`
    ],1,'La torca es el producto de la fuerza por el brazo de palanca, no la suma.',`τ=(${F})(${d})=${R.fmt(F*d)} N·m.`);
  }
  function detF3Rotacion(){
    const tau=R.int(10,40),I=R.pick([1,2,4,5]);
    return detective(`Se calcula la aceleración angular con ${R.math(`τ=${tau} N·m`)} e ${R.math(`I=${I} kg·m²`)}.`,[
      `τ=Iα.`,
      `α=I/τ.`,
      `α=${I}/${tau}.`,
      `α=${R.fmt(I/tau)} rad/s².`
    ],1,'Al despejar, α=τ/I.',`α=${tau}/${I}=${R.fmt(tau/I)} rad/s².`);
  }
  function detF3Hidro(){
    const rho=1000,hcm=R.pick([50,80,120,150]);
    return detective(`Se calcula presión en agua a ${R.math(`${hcm} cm`)} de profundidad.`,[
      `P=ρgh.`,
      `Se usa h=${hcm} directamente.`,
      `P=(${rho})(9.8)(${hcm}).`,
      `P=${rho*9.8*hcm} Pa.`
    ],1,'La profundidad debe expresarse en metros antes de sustituir en el SI.',`h=${hcm/100} m; P=(${rho})(9.8)(${hcm/100})=${R.fmt(rho*9.8*hcm/100)} Pa.`);
  }
  function detF3Flujo(){
    const A1=4,A2=2,v1=3;
    return detective(`Se aplica continuidad con ${R.math(`A₁=${A1}`)}, ${R.math(`A₂=${A2}`)} y ${R.math(`v₁=${v1}`)}.`,[
      `A₁v₁=A₂v₂.`,
      `v₂=A₂v₁/A₁.`,
      `v₂=(${A2})(${v1})/${A1}.`,
      `v₂=${A2*v1/A1} m/s.`
    ],1,'Al despejar v₂, el área A₁ queda en el numerador y A₂ en el denominador.',`v₂=A₁v₁/A₂=(${A1})(${v1})/${A2}=${A1*v1/A2} m/s.`);
  }

  // ---------- Completar procedimiento ----------
  function procMathNumeros(){
    const a=R.int(1,4),b=R.int(a+1,8),c=R.int(1,4),d=R.int(c+1,8),den=b*d,n=a*d+c*b,f=R.frac(n,den);
    return procedure(`Completa la suma ${R.math(`${a}/${b}+${c}/${d}`)}.`,[
      {before:`Denominador común: ${b}·${d}=`,answer:den,after:''},
      {before:`Numerador: ${a}·${d}+${c}·${b}=`,answer:n,after:''},
      {before:'Numerador simplificado:',answer:f.n,after:''},
      {before:'Denominador simplificado:',answer:f.d,after:''}
    ],'Construye primero una fracción equivalente para cada término.',`Resultado final: ${R.math(`${f.n}/${f.d}`)}.`);
  }
  function procMathRectas(){
    const m=R.nonzero(-5,5),x1=R.int(-4,2),dx=R.int(2,5),x2=x1+dx,y1=R.int(-5,5),y2=y1+m*dx;
    return procedure(`Completa el cálculo de la pendiente entre ${R.math(`(${x1},${y1})`)} y ${R.math(`(${x2},${y2})`)}.`,[
      {before:'Δy=y₂−y₁=',answer:y2-y1,after:''},
      {before:'Δx=x₂−x₁=',answer:x2-x1,after:''},
      {before:'m=Δy/Δx=',answer:m,after:''}
    ],'Usa el mismo orden para restar las coordenadas.',`m=(${y2}−${y1})/(${x2}−${x1})=${m}.`);
  }
  function procMathEcuaciones(){
    const x=R.int(-8,9),a=R.nonzero(-6,6),b=R.int(-10,10),c=a*x+b;
    return procedure(`Completa la resolución de ${R.math(`${a}x${b>=0?'+':''}${b}=${c}`)}.`,[
      {before:`${a}x=${c}−(${b})=`,answer:c-b,after:''},
      {before:`x=(${c-b})/${a}=`,answer:x,after:''}
    ],'Primero elimina la constante y luego divide entre el coeficiente de x.',`x=${x}.`);
  }
  function procMathSistemas(){
    const x=R.int(-5,7),y=R.int(-5,7),s=x+y,d=x-y;
    return procedure(`Completa la solución de ${R.math(`x+y=${s}`)} y ${R.math(`x−y=${d}`)}.`,[
      {before:'Al sumar las ecuaciones: 2x=',answer:s+d,after:''},
      {before:'x=',answer:x,after:''},
      {before:`Sustituyendo en x+y=${s}: y=`,answer:y,after:''}
    ],'La suma elimina y.',`La solución es (x,y)=(${x},${y}).`);
  }
  function procF1Medicion(){
    const kmh=R.pick([36,54,72,90,108,126]),ms=kmh/3.6;
    return procedure(`Completa la conversión de ${R.math(`${kmh} km/h`)} a m/s.`,[
      {before:`${kmh} km/h × (1000 m / 1 km) × (1 h /`,answer:3600,after:'s)'},
      {before:`${kmh}×1000/3600=`,answer:ms,after:'m/s',tolerance:.02}
    ],'Cancela km y h, dejando m/s.',`Resultado: ${R.fmt(ms)} m/s.`);
  }
  function procF1Cinematica(){
    const v0=R.int(1,8),a=R.int(1,5),t=R.int(2,6),vf=v0+a*t,dx=v0*t+.5*a*t*t;
    return procedure(`Completa el procedimiento para ${R.math(`v₀=${v0} m/s`)}, ${R.math(`a=${a} m/s²`)}, ${R.math(`t=${t} s`)}.`,[
      {before:'v_f=v₀+at=',answer:vf,after:'m/s'},
      {before:'t²=',answer:t*t,after:'s²'},
      {before:'Δx=v₀t+½at²=',answer:dx,after:'m',tolerance:.02}
    ],'Calcula por separado la velocidad final y el término t².',`v_f=${vf} m/s y Δx=${R.fmt(dx)} m.`);
  }
  function procF1Newton(){
    const m=R.int(3,15),mu=R.pick([.1,.2,.25]),F=R.int(Math.ceil(mu*m*9.8)+10,Math.ceil(mu*m*9.8)+50),fr=mu*m*9.8,Fnet=F-fr,a=Fnet/m;
    return procedure(`Completa el análisis de un bloque con ${R.math(`m=${m} kg`)}, ${R.math(`F=${F} N`)} y ${R.math(`μ=${mu}`)}.`,[
      {before:'f=μmg=',answer:fr,after:'N',tolerance:.03},
      {before:'F_neta=F−f=',answer:Fnet,after:'N',tolerance:.03},
      {before:'a=F_neta/m=',answer:a,after:'m/s²',tolerance:.03}
    ],'Calcula primero la fricción.',`f=${R.fmt(fr)} N, F_neta=${R.fmt(Fnet)} N y a=${R.fmt(a)} m/s².`);
  }
  function procF1Energia(){
    const m=R.int(1,6),v=R.int(3,10),v2=v*v,E=.5*m*v2;
    return procedure(`Completa la energía cinética para ${R.math(`m=${m} kg`)} y ${R.math(`v=${v} m/s`)}.`,[
      {before:'v²=',answer:v2,after:'m²/s²'},
      {before:'½m=',answer:.5*m,after:'kg',tolerance:.001},
      {before:'E_c=½mv²=',answer:E,after:'J',tolerance:.02}
    ],'No olvides elevar la rapidez al cuadrado.',`E_c=${R.fmt(E)} J.`);
  }
  function procF3Vectores(){
    const ax=R.int(-8,8),ay=R.int(-8,8),bx=R.int(-8,8),by=R.int(-8,8),rx=ax+bx,ry=ay+by,mag=Math.sqrt(rx*rx+ry*ry);
    return procedure(`Completa la suma ${R.math(`A=(${ax},${ay})`)} y ${R.math(`B=(${bx},${by})`)}.`,[
      {before:'R_x=A_x+B_x=',answer:rx,after:''},
      {before:'R_y=A_y+B_y=',answer:ry,after:''},
      {before:'|R|=√(R_x²+R_y²)=',answer:mag,after:'u',tolerance:.03}
    ],'Suma componentes y después aplica Pitágoras.',`R=(${rx},${ry}) y |R|=${R.fmt(mag)}.`);
  }
  function procF3Torca(){
    const F1=R.int(20,80),d1=R.pick([.5,1,1.5,2]),d2=R.pick([.5,1,1.25,2,2.5]),tau=F1*d1,F2=tau/d2;
    return procedure(`Completa el equilibrio de una barra con ${R.math(`F₁=${F1} N`)}, ${R.math(`d₁=${d1} m`)} y ${R.math(`d₂=${d2} m`)}.`,[
      {before:'τ₁=F₁d₁=',answer:tau,after:'N·m',tolerance:.02},
      {before:'En equilibrio τ₂=',answer:tau,after:'N·m',tolerance:.02},
      {before:'F₂=τ₂/d₂=',answer:F2,after:'N',tolerance:.03}
    ],'En equilibrio las torcas opuestas tienen igual magnitud.',`F₂=${R.fmt(F2)} N.`);
  }
  function procF3Rotacion(){
    const I=R.pick([.5,1,1.5,2,4]),alpha=R.int(2,10),tau=I*alpha,t=R.int(2,6),w=alpha*t;
    return procedure(`Completa para ${R.math(`I=${I} kg·m²`)}, ${R.math(`τ=${R.fmt(tau)} N·m`)} y parte del reposo durante ${R.math(`${t} s`)}.`,[
      {before:'α=τ/I=',answer:alpha,after:'rad/s²',tolerance:.02},
      {before:'ω=αt=',answer:w,after:'rad/s',tolerance:.02}
    ],'Primero obtén α; después usa ω=ω₀+αt con ω₀=0.',`α=${alpha} rad/s² y ω=${w} rad/s.`);
  }
  function procF3Hidro(){
    const rho=R.pick([800,1000,1200]),hcm=R.pick([50,75,120,150,250]),hm=hcm/100,P=rho*9.8*hm;
    return procedure(`Completa la presión a ${R.math(`${hcm} cm`)} en un fluido de ${R.math(`ρ=${rho} kg/m³`)}.`,[
      {before:'Profundidad en metros h=',answer:hm,after:'m',tolerance:.001},
      {before:'ρg=',answer:rho*9.8,after:'N/m³',tolerance:.1},
      {before:'P=ρgh=',answer:P,after:'Pa',tolerance:.1}
    ],'Convierte centímetros a metros antes de sustituir.',`P=${R.fmt(P)} Pa.`);
  }
  function procF3Flujo(){
    const A1=R.pick([3,4,5,6]),v1=R.int(2,6),A2=R.pick([1,1.5,2]),Q=A1*v1,v2=Q/A2;
    return procedure(`Completa continuidad con ${R.math(`A₁=${A1} cm²`)}, ${R.math(`v₁=${v1} m/s`)} y ${R.math(`A₂=${A2} cm²`)}.`,[
      {before:'A₁v₁=',answer:Q,after:'cm²·m/s',tolerance:.02},
      {before:'v₂=A₁v₁/A₂=',answer:v2,after:'m/s',tolerance:.03}
    ],'Como ambas áreas tienen la misma unidad, su razón es adimensional.',`v₂=${R.fmt(v2)} m/s.`);
  }

  const generators={
    matematicas1:{numeros:genMathNumeros,rectas:genMathRectas,ecuaciones:genMathEcuaciones,sistemas:genMathSistemas},
    fisica1:{medicion:genF1Medicion,cinematica:genF1Cinematica,newton:genF1Newton,energia:genF1Energia},
    fisica3:{vectores:genF3Vectores,torca:genF3Torca,rotacion:genF3Rotacion,hidro:genF3Hidro,flujo:genF3Flujo}
  };
  const detectives={
    matematicas1:{numeros:detMathNumeros,rectas:detMathRectas,ecuaciones:detMathEcuaciones,sistemas:detMathSistemas},
    fisica1:{medicion:detF1Medicion,cinematica:detF1Cinematica,newton:detF1Newton,energia:detF1Energia},
    fisica3:{vectores:detF3Vectores,torca:detF3Torca,rotacion:detF3Rotacion,hidro:detF3Hidro,flujo:detF3Flujo}
  };
  const procedures={
    matematicas1:{numeros:procMathNumeros,rectas:procMathRectas,ecuaciones:procMathEcuaciones,sistemas:procMathSistemas},
    fisica1:{medicion:procF1Medicion,cinematica:procF1Cinematica,newton:procF1Newton,energia:procF1Energia},
    fisica3:{vectores:procF3Vectores,torca:procF3Torca,rotacion:procF3Rotacion,hidro:procF3Hidro,flujo:procF3Flujo}
  };

  function create(course,mode,topic,level){
    const bank=mode==='detective'?detectives:mode==='procedure'?procedures:generators;
    if(!bank[course]||!bank[course][topic]) throw new Error('Tema no disponible');
    return mode==='generator'?bank[course][topic](level):bank[course][topic]();
  }
  global.PracticeBank={meta:topicMeta,create,utils:R};
})(typeof window!=='undefined'?window:globalThis);
