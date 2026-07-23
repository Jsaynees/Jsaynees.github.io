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


  const generators={
    matematicas1:{numeros:genMathNumeros,rectas:genMathRectas,ecuaciones:genMathEcuaciones,sistemas:genMathSistemas},
    fisica1:{medicion:genF1Medicion,cinematica:genF1Cinematica,newton:genF1Newton,energia:genF1Energia},
    fisica3:{vectores:genF3Vectores,torca:genF3Torca,rotacion:genF3Rotacion,hidro:genF3Hidro,flujo:genF3Flujo}
  };

  function create(course,topic,level){
    if(!generators[course]||!generators[course][topic]) throw new Error('Tema no disponible');
    return generators[course][topic](level||'easy');
  }

  function seedToUint(seed){
    const text=String(seed||'0');
    let hash=2166136261>>>0;
    for(let i=0;i<text.length;i++){
      hash^=text.charCodeAt(i);
      hash=Math.imul(hash,16777619);
    }
    return hash>>>0;
  }

  function withSeed(seed,callback){
    const original=Math.random;
    let state=seedToUint(seed);
    Math.random=function(){
      state=(state+0x6D2B79F5)|0;
      let t=state;
      t=Math.imul(t^(t>>>15),t|1);
      t^=t+Math.imul(t^(t>>>7),t|61);
      return ((t^(t>>>14))>>>0)/4294967296;
    };
    try{return callback();}finally{Math.random=original;}
  }

  function createSeeded(course,topic,level,seed){
    return withSeed(seed,()=>create(course,topic,level));
  }

  global.PracticeBankV9={meta:topicMeta,create,createSeeded,withSeed,seedToUint,utils:R};
})(typeof window!=='undefined'?window:globalThis);
