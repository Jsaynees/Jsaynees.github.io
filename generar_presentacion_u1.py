# -*- coding: utf-8 -*-
"""Genera «unidad1-presentacion.html», la presentación de clase de la Unidad 1
de Física I: qué estudia la física, cómo lo estudia y sus áreas.

Dos decisiones que explican cómo está hecho:

1. **Autocontenida.** Las dos fuentes van incrustadas en base64 y las figuras
   son SVG escrito a mano, animado con CSS. No hay imágenes externas, ni CDN,
   ni una sola petición a la red: se copia a una USB y se proyecta en cualquier
   computadora de la escuela, con o sin internet. Tampoco depende de fotos con
   licencia ajena.

2. **Hilada.** Cada lámina cierra con un puente —la línea en cursiva— que
   plantea la pregunta que abre la siguiente. La secuencia va de «qué estudia»
   a «cómo lo estudia» y de ahí a «por qué se divide en áreas», en vez de ser
   una lista de definiciones sueltas.

    py generar_presentacion_u1.py
"""
import base64
import io
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
FUENTES = r"S:\claude\pase de lista\static"
SALIDA = os.path.join(AQUI, "unidad1-presentacion.html")


def incrustar(nombre):
    """La fuente como data: URI. Solo el subconjunto latin, que es el que usa
    el español; el latin-ext sube 60 KB y aquí no hace falta."""
    with open(os.path.join(FUENTES, nombre), "rb") as f:
        return "data:font/woff2;base64," + base64.b64encode(f.read()).decode("ascii")


PLANTILLA = r"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Física I · Unidad 1 · ¿Qué estudia la física?</title>
<style>
@font-face{font-family:'Source Sans 3';src:url(@@SANS@@) format('woff2');font-weight:300 700;font-display:block}
@font-face{font-family:'Libre Baskerville';src:url(@@SERIF@@) format('woff2');font-weight:700;font-display:block}

:root{
  --navy:#1B3A6B; --navy-dark:#112447; --navy-light:#254d8f;
  --gold:#C9A84C; --gold-light:#e8c96a;
  --tinta:#1e293b; --suave:#5b6b82; --papel:#ffffff; --lienzo:#eef1f7;
  --borde:#d6dceb; --calido:#d85a30; --frio:#378add; --verde:#1d9e75;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{
  font-family:'Source Sans 3',system-ui,sans-serif;
  color:var(--tinta); background:var(--lienzo);
  overflow:hidden; -webkit-font-smoothing:antialiased;
}
h1,h2,.serif{font-family:'Libre Baskerville',Georgia,serif;font-weight:700;line-height:1.14}

#escenario{position:fixed;inset:0}
/* La lámina se ancla al centro y de ahí se escala. Centrar con grid no sirve:
   mide 1280x720 fijos y, cuando la pantalla es menor, el sobrante se sale por
   arriba y por la izquierda sin posibilidad de recuperarlo. */
#lamina{
  width:1280px;height:720px;background:var(--papel);
  border-radius:18px;position:absolute;top:50%;left:50%;overflow:hidden;
  box-shadow:0 18px 50px rgba(17,36,71,.16);
  transform-origin:center center;transform:translate(-50%,-50%);
}
.slide{position:absolute;inset:0;padding:56px 76px 84px;display:none;flex-direction:column;justify-content:center}
.slide.viva{display:flex}

.kicker{font-size:15px;letter-spacing:.16em;text-transform:uppercase;color:var(--navy-light);font-weight:600;margin-bottom:14px}
h1{font-size:60px;color:var(--navy)}
h2{font-size:40px;color:var(--navy);margin-bottom:8px}
.bajada{font-size:23px;color:var(--suave);line-height:1.5;max-width:48ch}
.grande{font-size:32px;line-height:1.4;max-width:36ch}
.regla{width:88px;height:5px;background:var(--gold);border-radius:3px;margin:18px 0 22px}

.paso{opacity:0;transform:translateY(12px);transition:opacity .34s ease,transform .34s ease}
.paso.dentro{opacity:1;transform:none}

.fila{display:flex;gap:34px;align-items:center}
.fila>.texto{flex:1;min-width:0}
.rejilla{display:grid;gap:16px}
.tres{grid-template-columns:repeat(3,1fr)}
.ficha{background:var(--lienzo);border:1px solid var(--borde);border-radius:14px;padding:18px 20px}
.ficha .rotulo{font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:var(--navy-light);font-weight:600}
.ficha p{font-size:20px;line-height:1.42;margin-top:6px}
.ficha.oro{border-left:6px solid var(--gold);border-radius:0 14px 14px 0}
.ficha .fig{display:block;margin:0 auto 10px}

ul.limpia{list-style:none;display:flex;flex-direction:column;gap:13px;margin-top:8px}
ul.limpia li{font-size:24px;line-height:1.38;padding-left:32px;position:relative}
ul.limpia li::before{content:"";position:absolute;left:0;top:.5em;width:14px;height:14px;border-radius:50%;background:var(--gold)}
.nota{font-size:19px;color:var(--suave);line-height:1.5;margin-top:16px;max-width:56ch}
.dato{color:var(--navy);font-weight:600}
.puente{
  font-size:20px;color:var(--navy-light);line-height:1.45;margin-top:20px;max-width:56ch;
  padding-left:16px;border-left:3px solid var(--gold);font-style:italic;
}
.pregunta{font-size:21px;color:var(--gold);font-weight:600;margin-top:10px}

.areas{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-top:20px}
.area{background:var(--lienzo);border:1px solid var(--borde);border-radius:14px;padding:16px 12px;text-align:center;
      transition:background .3s,border-color .3s,transform .3s}
.area.encendida{background:var(--navy);border-color:var(--navy);transform:translateY(-6px)}
.area.encendida .nom,.area.encendida .que{color:#fff}
.area .nom{font-size:19px;font-weight:600;color:var(--navy)}
.area .que{font-size:15px;color:var(--suave);margin-top:6px;line-height:1.3}

.escala-obj{font-size:44px;color:var(--navy);font-family:'Libre Baskerville',Georgia,serif;font-weight:700}
.escala-med{font-size:25px;color:var(--gold);font-weight:600;margin-top:4px;font-variant-numeric:tabular-nums}
input[type=range]{width:100%;margin-top:22px;accent-color:var(--navy);height:26px}

#pie{position:absolute;left:0;right:0;bottom:0;height:52px;padding:0 76px;display:flex;align-items:center;gap:16px;
     border-top:1px solid var(--borde);background:var(--papel)}
#puntos{display:flex;gap:6px;flex:1}
.punto{width:8px;height:8px;border-radius:50%;background:var(--borde);cursor:pointer}
.punto.hoy{background:var(--gold);transform:scale(1.4)}
.punto.vista{background:var(--navy-light)}
#cuenta{font-size:15px;color:var(--suave);font-variant-numeric:tabular-nums}
#ayuda{font-size:14px;color:var(--suave)}
kbd{font-family:inherit;font-size:13px;background:var(--lienzo);border:1px solid var(--borde);border-radius:5px;padding:2px 7px}
.cinta{position:absolute;top:0;left:0;right:0;height:8px;
       background:linear-gradient(90deg,var(--navy) 0%,var(--navy-light) 55%,var(--gold) 100%)}
.portada{background:var(--navy)}
.portada h1,.portada .kicker{color:#fff}
.portada .bajada{color:#c7d4ea}
.portada .kicker{color:var(--gold-light)}

/* ── Figuras animadas ─────────────────────────────────────────────────────
   Solo se animan dentro de la lámina visible: fuera de ella el navegador no
   gasta nada y, sobre todo, nada se mueve antes de tiempo en el proyector. */
@keyframes correr{to{transform:translateX(-180px)}}
@keyframes latir{0%,100%{opacity:.30;transform:scale(1)}50%{opacity:.70;transform:scale(1.14)}}
@keyframes brotar{from{r:12;opacity:.85}to{r:58;opacity:0}}
@keyframes girar{to{transform:rotate(360deg)}}
@keyframes vaiven{0%,100%{transform:rotate(-19deg)}50%{transform:rotate(19deg)}}
@keyframes flotar{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes subirCalor{0%{transform:translateX(0);opacity:0}
                      12%{opacity:1}88%{opacity:1}100%{transform:translateX(196px);opacity:0}}
@keyframes caerLento{0%{transform:translateY(0)}100%{transform:translateY(150px)}}
@keyframes caerRapido{0%{transform:translateY(0)}100%{transform:translateY(150px)}}
@keyframes rayo{0%{opacity:0}20%{opacity:1}100%{opacity:1}}
@keyframes recorrer{
  0%{transform:translate(0,150px)}   25%{transform:translate(70px,44px)}
  50%{transform:translate(140px,4px)}75%{transform:translate(210px,44px)}
  100%{transform:translate(280px,150px)}
}
.viva .anim-ola{animation:correr 3.4s linear infinite}
.viva .anim-latir{animation:latir 2.4s ease-in-out infinite;transform-origin:center}
.viva .anim-brote{animation:brotar 2.6s ease-out infinite}
.viva .anim-brote.b2{animation-delay:.85s}
.viva .anim-brote.b3{animation-delay:1.7s}
.viva .anim-orbita{animation:girar 5.5s linear infinite;transform-origin:88px 74px}
.viva .anim-pendulo{animation:vaiven 2.6s ease-in-out infinite;transform-origin:120px 16px}
.viva .anim-hielo{animation:flotar 3s ease-in-out infinite}
.viva .anim-calor{animation:subirCalor 2.9s linear infinite}
.viva .anim-calor.c2{animation-delay:.55s}
.viva .anim-calor.c3{animation-delay:1.1s}
.viva .anim-calor.c4{animation-delay:1.65s}
.viva .anim-pluma{animation:caerLento 3.2s ease-in infinite}
.viva .anim-moneda{animation:caerRapido 1.1s ease-in infinite}
.viva .anim-par{animation:caerRapido 1.5s ease-in infinite}
.viva .anim-tiro{animation:recorrer 3.4s ease-in-out infinite}
.viva .anim-rayo{animation:rayo 1.4s ease-out forwards}
@media (prefers-reduced-motion:reduce){.viva *{animation:none !important}}
</style>
</head>
<body>

<div id="escenario">
  <div id="lamina">
    <div class="cinta"></div>

    <!-- 1 · portada -->
    <section class="slide portada viva">
      <div class="kicker">Física I · Unidad 1 · Introducción a la física</div>
      <h1>¿Qué estudia<br>la física?</h1>
      <div class="regla"></div>
      <p class="bajada">Objeto y áreas de estudio<br>Bachillerato UNAM-Descartes · M.C. José Luis López Saynes</p>
    </section>

    <!-- 2 · tres cosas distintas -->
    <section class="slide">
      <div class="kicker">Para empezar</div>
      <h2>Tres cosas que no se parecen en nada</h2>
      <div class="rejilla tres" style="margin-top:22px">
        <div class="ficha paso">
          <svg class="fig" width="190" height="96" viewBox="0 0 190 96" aria-hidden="true">
            <clipPath id="cOla"><rect x="0" y="0" width="190" height="96" rx="8"/></clipPath>
            <g clip-path="url(#cOla)">
              <rect x="0" y="0" width="190" height="96" fill="#e6f1fb"/>
              <path class="anim-ola" d="M-190 62 q45 -30 90 0 t90 0 t90 0 t90 0 V96 H-190 Z" fill="#378add" opacity=".55"/>
              <path class="anim-ola" style="animation-duration:2.3s" d="M-190 72 q45 -22 90 0 t90 0 t90 0 t90 0 V96 H-190 Z" fill="#185fa5"/>
            </g>
          </svg>
          <div class="rotulo">Un tsunami</div><p>Agua que cruza un océano entero.</p>
        </div>
        <div class="ficha paso">
          <svg class="fig" width="190" height="96" viewBox="0 0 190 96" aria-hidden="true">
            <rect x="78" y="20" width="34" height="58" rx="6" fill="#1B3A6B"/>
            <rect x="82" y="26" width="26" height="44" rx="3" fill="#c7d4ea"/>
            <g fill="none" stroke="#C9A84C" stroke-width="3">
              <circle class="anim-brote" cx="95" cy="49" r="12"/>
              <circle class="anim-brote b2" cx="95" cy="49" r="12"/>
              <circle class="anim-brote b3" cx="95" cy="49" r="12"/>
            </g>
          </svg>
          <div class="rotulo">Tu celular</div><p>Habla con una antena a kilómetros.</p>
        </div>
        <div class="ficha paso">
          <svg class="fig" width="190" height="96" viewBox="0 0 190 96" aria-hidden="true">
            <circle class="anim-latir" cx="95" cy="48" r="30" fill="#e8c96a"/>
            <circle cx="95" cy="48" r="17" fill="#C9A84C"/>
            <g stroke="#C9A84C" stroke-width="3" stroke-linecap="round">
              <path d="M95 8v12M95 76v12M55 48h12M123 48h12M67 20l8 8M115 68l8 8M123 20l-8 8M75 68l-8 8"/>
            </g>
          </svg>
          <div class="rotulo">Una estrella</div><p>Brilla desde antes que existiera la Tierra.</p>
        </div>
      </div>
      <p class="pregunta paso">¿Qué puede tener en común un océano, un aparato y una bola de fuego?</p>
    </section>

    <!-- 3 · lo que sí comparten -->
    <section class="slide">
      <div class="kicker">La respuesta</div>
      <h2>Los tres son materia moviendo energía</h2>
      <div class="regla"></div>
      <ul class="limpia">
        <li class="paso">El tsunami lleva la energía del sismo hasta la costa.</li>
        <li class="paso">El celular convierte energía de la pila en ondas que viajan.</li>
        <li class="paso">La estrella suelta energía que ocho minutos después te calienta la cara.</li>
      </ul>
      <p class="nota paso">La física estudia <span class="dato">la materia, la energía y cómo se afectan
      en el espacio y en el tiempo</span>. Por eso le caben cosas tan distintas.</p>
      <p class="puente paso">Pero si le cabe tanto… ¿entonces todo es física?</p>
    </section>

    <!-- 4 · el vaso de agua -->
    <section class="slide">
      <div class="kicker">No, no todo es física</div>
      <h2>Un mismo vaso, tres preguntas</h2>
      <div class="fila" style="margin-top:18px">
        <svg width="200" height="230" viewBox="0 0 200 230" aria-hidden="true">
          <path d="M52 26 L148 26 L134 208 L66 208 Z" fill="#e6f1fb" stroke="#254d8f" stroke-width="3"/>
          <path d="M60 96 L140 96 L134 208 L66 208 Z" fill="#85b7eb"/>
          <g class="anim-hielo">
            <rect x="78" y="78" width="34" height="30" rx="5" fill="#fff" stroke="#254d8f" stroke-width="2.5"/>
            <path d="M84 88h22M92 82v20" stroke="#c7d4ea" stroke-width="2.5"/>
          </g>
        </svg>
        <div class="texto">
          <div class="rejilla" style="gap:14px">
            <div class="ficha oro paso"><div class="rotulo">Física</div><p>¿Por qué el hielo flota en vez de hundirse?</p></div>
            <div class="ficha oro paso"><div class="rotulo">Química</div><p>¿Por qué dos hidrógenos y un oxígeno se pegan?</p></div>
            <div class="ficha oro paso"><div class="rotulo">Biología</div><p>¿Por qué tu cuerpo no aguanta tres días sin ella?</p></div>
          </div>
        </div>
      </div>
      <p class="puente paso">Mismo objeto, tres ciencias. La frontera no está en la cosa: está en la pregunta.</p>
    </section>

    <!-- 5 · la pregunta de la física -->
    <section class="slide">
      <div class="kicker">La pregunta que hace la física</div>
      <h2 class="paso">No «¿qué es?», sino «¿cómo se comporta?»</h2>
      <div class="regla"></div>
      <p class="grande paso">Y una más exigente todavía:</p>
      <p class="grande paso" style="color:var(--navy);margin-top:8px"><span class="dato">¿puedo predecir qué va a pasar antes de que pase?</span></p>
      <p class="nota paso">Predecir es lo que separa a la física de una opinión bien contada. Si tu explicación
      no te deja anticipar nada, todavía no es física.</p>
      <p class="puente paso">Y para poder predecir hace falta un método. Este.</p>
    </section>

    <!-- 6 · el ciclo -->
    <section class="slide">
      <div class="kicker">Cómo trabaja</div>
      <h2>Cuatro pasos que no terminan nunca</h2>
      <div class="fila" style="margin-top:14px">
        <svg width="330" height="300" viewBox="0 0 330 300" aria-hidden="true">
          <g fill="none" stroke="#d6dceb" stroke-width="2.5">
            <circle cx="165" cy="150" r="108"/>
          </g>
          <g class="anim-orbita" style="transform-origin:165px 150px">
            <circle cx="165" cy="42" r="9" fill="#C9A84C"/>
          </g>
          <g font-family="'Source Sans 3',sans-serif" font-size="19" font-weight="600" text-anchor="middle">
            <g><circle cx="165" cy="42" r="34" fill="#1B3A6B"/><text x="165" y="48" fill="#fff">Mide</text></g>
            <g><circle cx="273" cy="150" r="34" fill="#254d8f"/><text x="273" y="156" fill="#fff">Modela</text></g>
            <g><circle cx="165" cy="258" r="34" fill="#1B3A6B"/><text x="165" y="264" fill="#fff">Predice</text></g>
            <g><circle cx="57" cy="150" r="34" fill="#254d8f"/><text x="57" y="156" fill="#fff">Prueba</text></g>
          </g>
        </svg>
        <div class="texto">
          <ul class="limpia">
            <li class="paso"><span class="dato">Mide.</span> Le pone número a lo que observa.</li>
            <li class="paso"><span class="dato">Modela.</span> Inventa una versión simplificada que sí se puede calcular.</li>
            <li class="paso"><span class="dato">Predice.</span> Dice qué debería pasar.</li>
            <li class="paso"><span class="dato">Prueba.</span> Y si falla, el que se cambia es el modelo, no la realidad.</li>
          </ul>
        </div>
      </div>
      <p class="puente paso">Suena abstracto. Vamos a verlo con una pregunta que tiene 400 años.</p>
    </section>

    <!-- 7 · moneda y pluma -->
    <section class="slide">
      <div class="kicker">El ciclo, en un caso real</div>
      <h2>¿Caen igual una moneda y una pluma?</h2>
      <div class="fila" style="margin-top:10px">
        <div class="texto">
          <div class="rejilla" style="gap:13px">
            <div class="ficha paso"><div class="rotulo">Lo que se observa</div><p>La moneda llega primero. Siempre.</p></div>
            <div class="ficha paso"><div class="rotulo">El modelo</div><p>Quita el aire: la gravedad jala igual a las dos.</p></div>
            <div class="ficha paso"><div class="rotulo">La predicción</div><p>Sin aire, deberían llegar juntas.</p></div>
            <div class="ficha paso"><div class="rotulo">La prueba</div><p>En una cámara de vacío, llegan juntas. En 1971 se hizo en la Luna.</p></div>
          </div>
        </div>
        <svg width="300" height="250" viewBox="0 0 300 250" aria-hidden="true">
          <rect x="8" y="8" width="132" height="234" rx="10" fill="#f6f8fc" stroke="#d6dceb" stroke-width="2"/>
          <rect x="160" y="8" width="132" height="234" rx="10" fill="#eef7f3" stroke="#9fe1cb" stroke-width="2"/>
          <text x="74" y="32" text-anchor="middle" font-size="15" font-weight="600" fill="#5b6b82" font-family="'Source Sans 3',sans-serif">Con aire</text>
          <text x="226" y="32" text-anchor="middle" font-size="15" font-weight="600" fill="#0f6e56" font-family="'Source Sans 3',sans-serif">Sin aire</text>
          <g><circle class="anim-moneda" cx="50" cy="62" r="11" fill="#C9A84C"/></g>
          <g><path class="anim-pluma" d="M96 52 q14 12 0 24 q-14 -12 0 -24" fill="#85b7eb"/></g>
          <g><circle class="anim-par" cx="200" cy="62" r="11" fill="#C9A84C"/></g>
          <g><path class="anim-par" d="M250 52 q14 12 0 24 q-14 -12 0 -24" fill="#85b7eb"/></g>
        </svg>
      </div>
      <p class="puente paso">Fíjate en lo que pasó: el modelo no describía la realidad tal cual. La mejoró a propósito.</p>
    </section>

    <!-- 8 · el modelo -->
    <section class="slide">
      <div class="kicker">La herramienta central</div>
      <h2>Un modelo es una mentira útil</h2>
      <div class="fila" style="margin-top:12px">
        <svg width="330" height="210" viewBox="0 0 330 210" aria-hidden="true">
          <line x1="16" y1="186" x2="318" y2="186" stroke="#d6dceb" stroke-width="2.5"/>
          <path d="M16 186 Q165 4 306 186" fill="none" stroke="#254d8f" stroke-width="3.5"/>
          <path d="M16 186 Q150 26 250 186" fill="none" stroke="#d85a30" stroke-width="3" stroke-dasharray="7 6"/>
          <g class="anim-tiro"><circle cx="16" cy="36" r="9" fill="#C9A84C"/></g>
          <text x="300" y="176" text-anchor="end" font-size="14" fill="#254d8f" font-family="'Source Sans 3',sans-serif">modelo</text>
          <text x="244" y="176" text-anchor="end" font-size="14" fill="#d85a30" font-family="'Source Sans 3',sans-serif">real</text>
        </svg>
        <div class="texto">
          <p class="grande paso">Cuando calculas un tiro sin aire, sabes que el aire existe.</p>
          <p class="nota paso">Lo quitas porque sin él el problema se puede resolver, y el resultado se
          parece lo suficiente. Un modelo no es la realidad:
          <span class="dato">es la parte de la realidad que sí puedes calcular</span>.</p>
          <p class="nota paso">Toda la física que verás este semestre son modelos. Ninguno es perfecto.
          Todos son útiles dentro de sus límites.</p>
        </div>
      </div>
      <p class="puente paso">Ahora bien: si el método es uno solo, ¿por qué se habla de «áreas» de la física?</p>
    </section>

    <!-- 9 · por qué hay áreas -->
    <section class="slide">
      <div class="kicker">La razón del desorden</div>
      <h2>Porque cambia lo que hay que medir</h2>
      <div class="regla"></div>
      <p class="grande paso">El método es el mismo. Lo que cambia son las preguntas y los instrumentos.</p>
      <p class="nota paso">Para estudiar una caída necesitas un cronómetro. Para estudiar el calor, un
      termómetro. Para estudiar la luz, un prisma. Las áreas de la física son
      <span class="dato">los grupos de preguntas que se resuelven con las mismas herramientas</span>.</p>
      <p class="puente paso">Son cinco. Ninguna es más importante que otra, y todas se tocan entre sí.</p>
    </section>

    <!-- 10 · mecánica -->
    <section class="slide">
      <div class="kicker">Área 1 de 5</div>
      <h2>Mecánica</h2>
      <div class="fila">
        <div class="texto">
          <p class="bajada">El movimiento y las fuerzas que lo provocan.</p>
          <div class="regla"></div>
          <ul class="limpia">
            <li class="paso">El hielo flota porque el agua sólida es menos densa que la líquida.</li>
            <li class="paso">Un tsunami avanza a la rapidez que le marca la profundidad del mar.</li>
            <li class="paso">El cinturón te frena en medio segundo en vez de en dos centésimas.</li>
          </ul>
          <p class="pregunta paso">Su pregunta típica: ¿dónde va a estar, y con qué rapidez?</p>
        </div>
        <svg width="240" height="230" viewBox="0 0 240 230" aria-hidden="true">
          <circle cx="120" cy="16" r="6" fill="#1B3A6B"/>
          <g class="anim-pendulo">
            <line x1="120" y1="16" x2="120" y2="168" stroke="#254d8f" stroke-width="3"/>
            <circle cx="120" cy="182" r="26" fill="#C9A84C"/>
          </g>
        </svg>
      </div>
    </section>

    <!-- 11 · térmica -->
    <section class="slide">
      <div class="kicker">Área 2 de 5</div>
      <h2>Térmica</h2>
      <div class="fila">
        <div class="texto">
          <p class="bajada">El calor, la temperatura y cómo la energía pasa de un cuerpo a otro.</p>
          <div class="regla"></div>
          <ul class="limpia">
            <li class="paso">La olla exprés cuece más rápido porque adentro el agua hierve arriba de 100 °C.</li>
            <li class="paso">El mango de la cuchara se calienta aunque no toque el fuego.</li>
            <li class="paso">El refrigerador no hace frío: saca calor de adentro y lo tira atrás.</li>
          </ul>
          <p class="pregunta paso">Su pregunta típica: ¿hacia dónde va la energía, y cuánta?</p>
        </div>
        <svg width="240" height="230" viewBox="0 0 240 230" aria-hidden="true">
          <rect x="6" y="80" width="46" height="70" rx="7" fill="#d85a30"/>
          <rect x="188" y="80" width="46" height="70" rx="7" fill="#378add"/>
          <line x1="52" y1="115" x2="188" y2="115" stroke="#d6dceb" stroke-width="2.5"/>
          <g fill="#C9A84C">
            <circle class="anim-calor" cx="46" cy="115" r="7"/>
            <circle class="anim-calor c2" cx="46" cy="115" r="7"/>
            <circle class="anim-calor c3" cx="46" cy="115" r="7"/>
            <circle class="anim-calor c4" cx="46" cy="115" r="7"/>
          </g>
          <text x="29" y="172" text-anchor="middle" font-size="15" fill="#993c1d" font-family="'Source Sans 3',sans-serif">caliente</text>
          <text x="211" y="172" text-anchor="middle" font-size="15" fill="#185fa5" font-family="'Source Sans 3',sans-serif">frío</text>
        </svg>
      </div>
    </section>

    <!-- 12 · electromagnetismo -->
    <section class="slide">
      <div class="kicker">Área 3 de 5</div>
      <h2>Electromagnetismo</h2>
      <div class="fila">
        <div class="texto">
          <p class="bajada">Las cargas, la corriente, los imanes y las ondas de radio.</p>
          <div class="regla"></div>
          <ul class="limpia">
            <li class="paso">El microondas sacude las moléculas de agua con ondas de 2.45 GHz.</li>
            <li class="paso">Tus audífonos se conectan con ondas de radio de 2.4 GHz, no por magia.</li>
            <li class="paso">Un rayo es la misma electricidad del enchufe, con cien millones de volts.</li>
          </ul>
          <p class="pregunta paso">Su pregunta típica: ¿qué le hace una carga a otra, aunque no se toquen?</p>
        </div>
        <svg width="240" height="230" viewBox="0 0 240 230" aria-hidden="true">
          <clipPath id="cOnda"><rect x="6" y="60" width="228" height="110"/></clipPath>
          <g clip-path="url(#cOnda)">
            <path class="anim-ola" style="animation-duration:2.6s"
                  d="M-174 115 q45 -46 90 0 t90 0 t90 0 t90 0 t90 0" fill="none" stroke="#254d8f" stroke-width="3.5"/>
            <path class="anim-ola" style="animation-duration:2.6s;animation-delay:-1.3s"
                  d="M-174 115 q45 46 90 0 t90 0 t90 0 t90 0 t90 0" fill="none" stroke="#C9A84C" stroke-width="3.5" opacity=".8"/>
          </g>
          <line x1="6" y1="115" x2="234" y2="115" stroke="#d6dceb" stroke-width="1.5"/>
        </svg>
      </div>
    </section>

    <!-- 13 · óptica -->
    <section class="slide">
      <div class="kicker">Área 4 de 5</div>
      <h2>Óptica</h2>
      <div class="fila">
        <div class="texto">
          <p class="bajada">La luz: cómo viaja, se desvía y se separa.</p>
          <div class="regla"></div>
          <ul class="limpia">
            <li class="paso">El arcoíris aparece porque cada color se desvía distinto dentro de la gota.</li>
            <li class="paso">Tus lentes corrigen dónde se forma la imagen dentro de tu ojo.</li>
            <li class="paso">El internet llega por fibra óptica: luz rebotando dentro de un vidrio.</li>
          </ul>
          <p class="pregunta paso">Su pregunta típica: ¿por dónde se va a ir la luz?</p>
        </div>
        <svg width="240" height="230" viewBox="0 0 240 230" aria-hidden="true">
          <line x1="4" y1="104" x2="88" y2="104" stroke="#5b6b82" stroke-width="3.5"/>
          <path d="M110 52 L154 140 L66 140 Z" fill="#e6f1fb" stroke="#254d8f" stroke-width="3"/>
          <g class="anim-rayo" stroke-width="3.5" stroke-linecap="round">
            <line x1="120" y1="112" x2="234" y2="86"  stroke="#d84a4a"/>
            <line x1="120" y1="112" x2="234" y2="102" stroke="#ef9f27"/>
            <line x1="120" y1="112" x2="234" y2="118" stroke="#97c459"/>
            <line x1="120" y1="112" x2="234" y2="134" stroke="#378add"/>
            <line x1="120" y1="112" x2="234" y2="150" stroke="#7f77dd"/>
          </g>
        </svg>
      </div>
    </section>

    <!-- 14 · física moderna -->
    <section class="slide">
      <div class="kicker">Área 5 de 5</div>
      <h2>Física moderna</h2>
      <div class="fila">
        <div class="texto">
          <p class="bajada">Lo muy pequeño y lo muy rápido, donde el sentido común deja de servir.</p>
          <div class="regla"></div>
          <ul class="limpia">
            <li class="paso">El GPS corrige sus relojes a diario: sin eso te ubicaría con kilómetros de error.</li>
            <li class="paso">La pantalla de tu celular enciende porque un semiconductor deja pasar la carga.</li>
            <li class="paso">La resonancia magnética te ve por dentro usando el giro de tus propios protones.</li>
          </ul>
          <p class="pregunta paso">Su pregunta típica: ¿qué pasa cuando lo pequeño deja de portarse como una canica?</p>
        </div>
        <svg width="240" height="230" viewBox="0 0 176 148" aria-hidden="true">
          <g fill="none" stroke="#254d8f" stroke-width="2.5" opacity=".55">
            <ellipse cx="88" cy="74" rx="70" ry="27"/>
            <ellipse cx="88" cy="74" rx="70" ry="27" transform="rotate(60 88 74)"/>
            <ellipse cx="88" cy="74" rx="70" ry="27" transform="rotate(120 88 74)"/>
          </g>
          <circle class="anim-latir" cx="88" cy="74" r="20" fill="#e8c96a"/>
          <circle cx="88" cy="74" r="12" fill="#C9A84C"/>
          <g class="anim-orbita"><circle cx="158" cy="74" r="7" fill="#1B3A6B"/></g>
        </svg>
      </div>
    </section>

    <!-- 15 · resumen -->
    <section class="slide">
      <div class="kicker">Resumen</div>
      <h2>Las cinco, de un vistazo</h2>
      <div class="regla"></div>
      <div class="areas" id="areas">
        <div class="area paso"><div class="nom">Mecánica</div><div class="que">Movimiento y fuerzas</div></div>
        <div class="area paso"><div class="nom">Térmica</div><div class="que">Calor y temperatura</div></div>
        <div class="area paso"><div class="nom">Electro&shy;magnetismo</div><div class="que">Cargas y ondas</div></div>
        <div class="area paso"><div class="nom">Óptica</div><div class="que">La luz</div></div>
        <div class="area paso"><div class="nom">Moderna</div><div class="que">Lo pequeño y lo rápido</div></div>
      </div>
      <p class="nota paso">Las fronteras no son muros. El microondas es electromagnetismo
      <span class="dato">y</span> térmica. El arcoíris es óptica <span class="dato">y</span> la luz del Sol,
      que es física moderna. Casi nada interesante cabe en una sola casilla.</p>
      <p class="puente paso">Y hay algo que aparece en las cinco, en todas, sin excepción.</p>
    </section>

    <!-- 16 · el hilo conductor -->
    <section class="slide">
      <div class="kicker">El hilo de todo el curso</div>
      <h2 class="paso">La energía</h2>
      <div class="regla"></div>
      <p class="grande paso">Cambia de forma todo el tiempo. Nunca se pierde.</p>
      <div class="rejilla tres paso" style="margin-top:20px">
        <div class="ficha"><div class="rotulo">Mecánica</div><p>Energía de movimiento y de altura.</p></div>
        <div class="ficha"><div class="rotulo">Térmica</div><p>La misma energía, ahora repartida en desorden.</p></div>
        <div class="ficha"><div class="rotulo">Electromagnetismo</div><p>La misma, viajando como onda.</p></div>
      </div>
      <p class="nota paso">La energía del Sol se volvió planta, la planta se volvió carbón, el carbón mueve
      una turbina y la turbina prende este proyector. <span class="dato">Es la misma energía todo el camino.</span></p>
    </section>

    <!-- 17 · escalas -->
    <section class="slide">
      <div class="kicker">Hasta dónde llega</div>
      <h2>Ninguna otra ciencia abarca tanto</h2>
      <div class="fila" style="margin-top:8px">
        <svg width="230" height="200" viewBox="0 0 230 200" aria-hidden="true">
          <circle cx="115" cy="100" r="92" fill="none" stroke="#d6dceb" stroke-width="2" stroke-dasharray="4 5"/>
          <circle id="esc-burbuja" cx="115" cy="100" r="30" fill="#254d8f" opacity=".85"/>
        </svg>
        <div class="texto">
          <div class="escala-obj" id="esc-obj">Tú, de pie</div>
          <div class="escala-med" id="esc-med">1.7 metros</div>
          <input type="range" id="esc" min="0" max="10" step="1" value="4"
                 aria-label="Recorrer las escalas del universo">
          <p class="nota" id="esc-nota">Mueve la barra: de aquí para abajo y de aquí para arriba, todo lo estudia la física.</p>
        </div>
      </div>
    </section>

    <!-- 18 · tecnología y sociedad -->
    <section class="slide">
      <div class="kicker">Y esto para qué</div>
      <h2>Cada área te cambió la vida sin avisarte</h2>
      <div class="regla"></div>
      <ul class="limpia">
        <li class="paso"><span class="dato">Térmica</span> · el refrigerador cambió lo que puede comer una ciudad entera.</li>
        <li class="paso"><span class="dato">Electromagnetismo</span> · el foco le quitó a la noche el monopolio del descanso.</li>
        <li class="paso"><span class="dato">Moderna</span> · el transistor metió una computadora en tu bolsillo.</li>
      </ul>
      <p class="nota paso">Ninguno se inventó para eso. Salieron de gente resolviendo un problema de física
      que en su momento parecía inútil.</p>
      <p class="puente paso">Eso es el siguiente tema: física, tecnología y sociedad.</p>
    </section>

    <!-- 19 · la actividad -->
    <section class="slide">
      <div class="kicker">Ahora ustedes</div>
      <h2>¿De qué física es esto?</h2>
      <div class="regla"></div>
      <ul class="limpia">
        <li class="paso">Sale una tarjeta con algo de todos los días.</li>
        <li class="paso">Quince segundos para decidir de qué área es.</li>
        <li class="paso">Cuidado: hay tarjetas que <span class="dato">no son física</span>.</li>
        <li class="paso">Al final, cada equipo inventa dos tarjetas y reta a otro equipo.</li>
      </ul>
    </section>

    <div id="pie">
      <div id="puntos"></div>
      <div id="cuenta">1 / 19</div>
      <div id="ayuda"><kbd>←</kbd> <kbd>→</kbd> avanzar · <kbd>F</kbd> pantalla completa</div>
    </div>
  </div>
</div>

<script>
(function(){
  var laminas = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var puntos  = document.getElementById('puntos');
  var cuenta  = document.getElementById('cuenta');
  var lamina  = document.getElementById('lamina');
  var i = 0, paso = 0;

  laminas.forEach(function(_, n){
    var d = document.createElement('div');
    d.className = 'punto';
    d.addEventListener('click', function(){ ir(n); });
    puntos.appendChild(d);
  });

  function pasosDe(n){ return laminas[n].querySelectorAll('.paso'); }

  function pintar(){
    laminas.forEach(function(s, n){ s.classList.toggle('viva', n === i); });
    Array.prototype.forEach.call(pasosDe(i), function(el, k){
      el.classList.toggle('dentro', k < paso);
    });
    Array.prototype.forEach.call(puntos.children, function(d, n){
      d.className = 'punto' + (n === i ? ' hoy' : (n < i ? ' vista' : ''));
    });
    cuenta.textContent = (i + 1) + ' / ' + laminas.length;
    encenderAreas();
  }

  function ir(n){ i = Math.max(0, Math.min(laminas.length - 1, n)); paso = pasosDe(i).length; pintar(); }

  function adelante(){
    if (paso < pasosDe(i).length) { paso += 1; pintar(); return; }
    if (i < laminas.length - 1) { i += 1; paso = 0; pintar(); }
  }

  function atras(){
    if (paso > 0) { paso -= 1; pintar(); return; }
    if (i > 0) { i -= 1; paso = pasosDe(i).length; pintar(); }
  }

  function encenderAreas(){
    var cajas = document.querySelectorAll('#areas .area');
    Array.prototype.forEach.call(cajas, function(c, k){
      c.classList.toggle('encendida', c.classList.contains('dentro'));
    });
  }

  document.addEventListener('keydown', function(e){
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); adelante(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); atras(); }
    else if (e.key === 'Home') { ir(0); }
    else if (e.key === 'End') { ir(laminas.length - 1); }
    else if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else { document.documentElement.requestFullscreen(); }
    }
  });

  lamina.addEventListener('click', function(e){
    if (e.target.closest('#pie') || e.target.tagName === 'INPUT') { return; }
    if (e.clientX < lamina.getBoundingClientRect().left + lamina.offsetWidth * 0.18) { atras(); }
    else { adelante(); }
  });

  // La lámina mide 1280x720 fijos y se escala al tamaño real de la pantalla,
  // sin pasar de 1.6 para que no se pixele en un proyector chico.
  function encajar(){
    var m = 24;
    var k = Math.min((innerWidth - m * 2) / 1280, (innerHeight - m * 2) / 720, 1.6);
    lamina.style.transform = 'translate(-50%,-50%) scale(' + k.toFixed(4) + ')';
  }
  addEventListener('resize', encajar);
  document.addEventListener('fullscreenchange', encajar);

  // Escalas del universo, de un protón al universo observable. El radio de la
  // burbuja crece con el logaritmo: si creciera con el tamaño real, los diez
  // primeros pasos serían un punto invisible.
  var ESCALAS = [
    ['Un protón',             '0.000000000000001 m',  'Una milbillonésima de metro. Aquí manda la física moderna.'],
    ['Un átomo',              '0.0000000001 m',       'Cien mil veces más grande que su núcleo, y casi todo vacío.'],
    ['Un virus',              '0.0000001 m',          'Mil veces menor que el grosor de un cabello.'],
    ['Un cabello tuyo',       '0.00007 m',            'Lo más chico que alcanzas a ver sin microscopio.'],
    ['Tú, de pie',            '1.7 metros',           'La escala donde tu sentido común funciona bien.'],
    ['La escuela',            '100 metros',           'Todavía manda la mecánica de todos los días.'],
    ['La Tierra',             '12 700 000 metros',    'Su campo magnético desvía los rayos cósmicos que nos llegan.'],
    ['El Sol',                '1 400 000 000 metros', 'Un horno de fusión encendido desde hace 4 600 millones de años.'],
    ['El sistema solar',      '10 000 000 000 000 metros', 'La luz tarda medio día en cruzarlo.'],
    ['La Vía Láctea',         '10 000 000 000 000 000 000 000 metros', 'Cien mil años luz de lado a lado.'],
    ['El universo observable','880 000 000 000 000 000 000 000 000 metros',
     'El límite no es el universo: es hasta dónde nos ha llegado su luz.']
  ];
  var esc = document.getElementById('esc');
  var burbuja = document.getElementById('esc-burbuja');
  function pintarEscala(){
    var n = +esc.value, e = ESCALAS[n];
    document.getElementById('esc-obj').textContent = e[0];
    document.getElementById('esc-med').textContent = e[1];
    document.getElementById('esc-nota').textContent = e[2];
    burbuja.setAttribute('r', (10 + n * 8).toFixed(0));
  }
  esc.addEventListener('input', pintarEscala);

  encajar();
  pintar();
  pintarEscala();
})();
</script>
</body>
</html>
"""


def main():
    html = (PLANTILLA
            .replace("@@SANS@@", incrustar("source-sans-3-300-700-latin.woff2"))
            .replace("@@SERIF@@", incrustar("libre-baskerville-700-latin.woff2")))
    with io.open(SALIDA, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)

    for prohibido in ("http://", "https://", "//cdn", "<img"):
        assert prohibido not in html, "quedó una referencia externa: " + prohibido
    n_laminas = html.count('class="slide')
    assert ("1 / %d" % n_laminas) in html, "el contador del pie no cuadra con las láminas"
    print("%s  ·  %.0f KB  ·  %d láminas"
          % (os.path.basename(SALIDA), os.path.getsize(SALIDA) / 1024, n_laminas))
    print("sin imágenes ni peticiones externas: verificado")


if __name__ == "__main__":
    main()
