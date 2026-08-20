# -*- coding: utf-8 -*-
"""Genera «unidad1-no-hegemonicos.html», la clase del quinto tema de la
Unidad 1 de Física I: aportes de grupos no hegemónicos a la ciencia.

Cada ficha responde tres preguntas —qué encontró, dónde estuvo el sesgo, qué
pasó después— y el peso está puesto en lo mexicano, que es lo que no se cuenta
en ningún lado.

**Los datos están verificados uno por uno** (19-ago-2026) contra Ciencia UNAM,
Wikipedia, Physics World, NobelPrize.org, Mujeres con Ciencia y el Instituto de
Física de la UNAM. En esa revisión se cayó una afirmación que parecía cierta:
Guillermo Haro fue miembro *asociado* de la Royal Astronomical Society en 1959,
pero no hay fuente que sostenga que fuera el primer mexicano.

**Sin fotografías, a propósito.** Los retratos de estas personas tienen
licencias dispares y esto se publica en el sitio de la escuela; antes que mezclar
unas con permiso y otras sin él, cada ficha lleva un dibujo del hallazgo, hecho a
mano en SVG. Igual que la presentación de la Unidad 1: cero imágenes externas y
cero peticiones a la red, para poder proyectarla desde una USB.

    py generar_presentacion_hegemonicos.py
"""
import base64
import io
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
FUENTES = r"S:\claude\pase de lista\static"
SALIDA = os.path.join(AQUI, "unidad1-no-hegemonicos.html")


def incrustar(nombre):
    with open(os.path.join(FUENTES, nombre), "rb") as f:
        return "data:font/woff2;base64," + base64.b64encode(f.read()).decode("ascii")


PLANTILLA = r"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Física I · Unidad 1 · ¿Quién no aparece en la foto?</title>
<style>
@font-face{font-family:'Source Sans 3';src:url(@@SANS@@) format('woff2');font-weight:300 700;font-display:block}
@font-face{font-family:'Libre Baskerville';src:url(@@SERIF@@) format('woff2');font-weight:700;font-display:block}

:root{
  --navy:#1B3A6B; --navy-dark:#112447; --navy-light:#254d8f;
  --gold:#C9A84C; --gold-light:#e8c96a;
  --tinta:#1e293b; --suave:#5b6b82; --papel:#ffffff; --lienzo:#eef1f7;
  --borde:#d6dceb; --rojo:#d85a30; --verde:#1d9e75;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%}
body{font-family:'Source Sans 3',system-ui,sans-serif;color:var(--tinta);background:var(--lienzo);
     overflow:hidden;-webkit-font-smoothing:antialiased}
h1,h2{font-family:'Libre Baskerville',Georgia,serif;font-weight:700;line-height:1.14}

#escenario{position:fixed;inset:0}
#lamina{width:1280px;height:720px;background:var(--papel);border-radius:18px;
        position:absolute;top:50%;left:50%;overflow:hidden;
        box-shadow:0 18px 50px rgba(17,36,71,.16);
        transform-origin:center center;transform:translate(-50%,-50%)}
.slide{position:absolute;inset:0;padding:52px 72px 80px;display:none;flex-direction:column;justify-content:center}
.slide.viva{display:flex}

.kicker{font-size:15px;letter-spacing:.16em;text-transform:uppercase;color:var(--navy-light);font-weight:600;margin-bottom:12px}
h1{font-size:58px;color:var(--navy)}
h2{font-size:38px;color:var(--navy);margin-bottom:6px}
.bajada{font-size:22px;color:var(--suave);line-height:1.45;max-width:50ch}
.grande{font-size:30px;line-height:1.4;max-width:38ch}
.regla{width:84px;height:5px;background:var(--gold);border-radius:3px;margin:16px 0 20px}
.paso{opacity:0;transform:translateY(12px);transition:opacity .34s ease,transform .34s ease}
.paso.dentro{opacity:1;transform:none}

.fila{display:flex;gap:32px;align-items:center}
.fila>.texto{flex:1;min-width:0}
.rejilla{display:grid;gap:14px}
.dos{grid-template-columns:1fr 1fr}
.tres{grid-template-columns:repeat(3,1fr)}
.ficha{background:var(--lienzo);border:1px solid var(--borde);border-radius:14px;padding:16px 18px}
.ficha .rotulo{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--navy-light);font-weight:600}
.ficha p{font-size:19px;line-height:1.4;margin-top:5px}
.ficha.sesgo{border-left:6px solid var(--rojo);border-radius:0 14px 14px 0;background:#fdf1ec}
.ficha.sesgo .rotulo{color:#993c1d}
.ficha.despues{border-left:6px solid var(--verde);border-radius:0 14px 14px 0;background:#eaf6f1}
.ficha.despues .rotulo{color:#0f6e56}
.ficha.oro{border-left:6px solid var(--gold);border-radius:0 14px 14px 0}

ul.limpia{list-style:none;display:flex;flex-direction:column;gap:12px;margin-top:8px}
ul.limpia li{font-size:23px;line-height:1.35;padding-left:30px;position:relative}
ul.limpia li::before{content:"";position:absolute;left:0;top:.5em;width:13px;height:13px;border-radius:50%;background:var(--gold)}
.nota{font-size:18px;color:var(--suave);line-height:1.5;margin-top:14px;max-width:58ch}
.dato{color:var(--navy);font-weight:600}
.puente{font-size:19px;color:var(--navy-light);line-height:1.45;margin-top:18px;max-width:58ch;
        padding-left:15px;border-left:3px solid var(--gold);font-style:italic}
.anios{font-size:19px;color:var(--gold);font-weight:600;letter-spacing:.04em}

#pie{position:absolute;left:0;right:0;bottom:0;height:50px;padding:0 72px;display:flex;align-items:center;gap:16px;
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

@keyframes latir{0%,100%{opacity:.30;transform:scale(1)}50%{opacity:.70;transform:scale(1.13)}}
@keyframes girar{to{transform:rotate(360deg)}}
@keyframes correr{to{transform:translateX(-180px)}}
@keyframes chispa{0%,100%{opacity:.15}45%,55%{opacity:1}}
@keyframes desviar{0%{transform:translate(0,0)}100%{transform:translate(-96px,74px)}}
@keyframes separar{0%,20%{transform:translateX(0)}100%{transform:translateX(34px)}}
@keyframes pulso{0%,88%,100%{opacity:.2}92%{opacity:1}}
.viva .a-latir{animation:latir 2.4s ease-in-out infinite;transform-origin:center}
.viva .a-girar{animation:girar 6s linear infinite}
.viva .a-correr{animation:correr 3.2s linear infinite}
.viva .a-chispa{animation:chispa 2.2s ease-in-out infinite}
.viva .a-desviar{animation:desviar 3.4s ease-in infinite}
.viva .a-separar{animation:separar 3s ease-out infinite}
.viva .a-separar.izq{animation-name:separar;animation-direction:reverse}
.viva .a-pulso{animation:pulso 1.6s linear infinite}
@media (prefers-reduced-motion:reduce){.viva *{animation:none !important}}
</style>
</head>
<body>

<div id="escenario">
  <div id="lamina">
    <div class="cinta"></div>

    <!-- 1 -->
    <section class="slide portada viva">
      <div class="kicker">Física I · Unidad 1 · Aportes de grupos no hegemónicos</div>
      <h1>¿Quién no aparece<br>en la foto?</h1>
      <div class="regla"></div>
      <p class="bajada">Siete hallazgos, siete personas y una pregunta incómoda<br>
      Bachillerato UNAM-Descartes · M.C. José Luis López Saynes</p>
    </section>

    <!-- 2 -->
    <section class="slide">
      <div class="kicker">Antes de empezar</div>
      <h2>Nombra tres científicos. Rápido.</h2>
      <div class="regla"></div>
      <p class="grande paso">Sin pensarlo mucho. Los tres primeros que se te vengan.</p>
      <p class="nota paso">Casi siempre salen los mismos: Newton, Einstein, Galileo, Darwin.
      Todos hombres. Todos europeos. Casi todos de hace más de un siglo.</p>
      <p class="nota paso">No es que ellos no lo merezcan. Es que <span class="dato">la lista está incompleta</span>,
      y no por casualidad.</p>
      <p class="puente paso">La pregunta de hoy no es quién descubrió qué. Es quién quedó fuera del relato, y por qué.</p>
    </section>

    <!-- 3 -->
    <section class="slide">
      <div class="kicker">Cómo vamos a leer cada caso</div>
      <h2>Tres preguntas, siempre las mismas</h2>
      <div class="regla"></div>
      <div class="rejilla tres">
        <div class="ficha oro paso"><div class="rotulo">El hallazgo</div><p>Qué encontró, en una línea.</p></div>
        <div class="ficha sesgo paso"><div class="rotulo">El sesgo</div><p>Qué se le quitó, o qué tuvo que pelear de más.</p></div>
        <div class="ficha despues paso"><div class="rotulo">Después</div><p>Cómo terminó la historia.</p></div>
      </div>
      <p class="nota paso">Empezamos por México, que es de lo que menos se habla y lo que más cerca te queda.</p>
    </section>

    <!-- 4 · Sandoval Vallarta -->
    <section class="slide">
      <div class="kicker">México · 1 de 4</div>
      <h2>Manuel Sandoval Vallarta</h2>
      <p class="anios">1899 – 1977</p>
      <div class="fila" style="margin-top:14px">
        <div class="texto">
          <div class="rejilla" style="gap:12px">
            <div class="ficha oro paso"><div class="rotulo">El hallazgo</div><p>En 1932, con Georges Lemaître, explicó cómo el campo magnético de la Tierra desvía los rayos cósmicos. Eso permitió saber el signo de la carga de esas partículas.</p></div>
            <div class="ficha sesgo paso"><div class="rotulo">El sesgo</div><p>Fue nominado al Nobel en 1935 y dio clase 25 años en el MIT —Richard Feynman fue su alumno—. Pregúntale a cualquiera en la calle si lo conoce.</p></div>
            <div class="ficha despues paso"><div class="rotulo">Después</div><p>Volvió a México. Dirigió el IPN y el Instituto de Física de la UNAM.</p></div>
          </div>
        </div>
        <svg width="260" height="250" viewBox="0 0 260 250" aria-hidden="true">
          <g fill="none" stroke="#254d8f" stroke-width="2" opacity=".45">
            <ellipse cx="130" cy="140" rx="104" ry="52"/>
            <ellipse cx="130" cy="140" rx="78" ry="88"/>
            <ellipse cx="130" cy="140" rx="46" ry="104"/>
          </g>
          <circle cx="130" cy="140" r="42" fill="#254d8f"/>
          <circle cx="130" cy="140" r="42" fill="none" stroke="#1B3A6B" stroke-width="3"/>
          <g class="a-desviar">
            <circle cx="228" cy="24" r="7" fill="#C9A84C"/>
            <path d="M244 8 L228 24" stroke="#C9A84C" stroke-width="3" stroke-linecap="round"/>
          </g>
        </svg>
      </div>
      <p class="puente paso">Su nombre está en la teoría. No en la memoria.</p>
    </section>

    <!-- 5 · Guillermo Haro -->
    <section class="slide">
      <div class="kicker">México · 2 de 4</div>
      <h2>Guillermo Haro</h2>
      <p class="anios">1913 – 1988</p>
      <div class="fila" style="margin-top:14px">
        <div class="texto">
          <div class="rejilla" style="gap:12px">
            <div class="ficha oro paso"><div class="rotulo">El hallazgo</div><p>Los objetos Herbig-Haro: chorros de gas que disparan las estrellas recién nacidas. También estrellas T Tauri y estrellas ráfaga, desde Tonantzintla, Puebla.</p></div>
            <div class="ficha sesgo paso"><div class="rotulo">El sesgo</div><p>Estudió <b>filosofía</b>, no física, y entró de asistente en 1943. Hizo ciencia de frontera desde un observatorio mexicano, cuando se daba por hecho que eso solo pasaba en el norte.</p></div>
            <div class="ficha despues paso"><div class="rotulo">Después</div><p>Fundó el INAOE en 1971. Miembro asociado de la Royal Astronomical Society (1959) y Medalla Lomonósov de la Academia Rusa (1986).</p></div>
          </div>
        </div>
        <svg width="260" height="250" viewBox="0 0 260 250" aria-hidden="true">
          <ellipse cx="130" cy="132" rx="66" ry="22" fill="#254d8f" opacity=".35"/>
          <circle class="a-latir" cx="130" cy="132" r="26" fill="#e8c96a"/>
          <circle cx="130" cy="132" r="15" fill="#C9A84C"/>
          <g fill="#378add" opacity=".8">
            <path class="a-separar" d="M130 118 L150 40 L130 62 L110 40 Z" transform="translate(0,-30)"/>
            <path class="a-separar izq" d="M130 146 L150 224 L130 202 L110 224 Z" transform="translate(0,30)"/>
          </g>
        </svg>
      </div>
      <p class="puente paso">Un filósofo puso a México en el mapa de las estrellas.</p>
    </section>

    <!-- 6 · Alejandra Jáidar -->
    <section class="slide">
      <div class="kicker">México · 3 de 4</div>
      <h2>Alejandra Jáidar</h2>
      <p class="anios">1938 – 1988</p>
      <div class="fila" style="margin-top:14px">
        <div class="texto">
          <div class="rejilla" style="gap:12px">
            <div class="ficha oro paso"><div class="rotulo">El hallazgo</div><p>El 18 de noviembre de 1961 se convirtió en la <b>primera mujer titulada en física en México</b>, con una tesis sobre núcleos atómicos ligeros hecha en el acelerador Van de Graaff de la UNAM.</p></div>
            <div class="ficha sesgo paso"><div class="rotulo">El sesgo</div><p>Su propio padre se opuso a que estudiara una carrera. Y la universidad le extendió un título que decía «Físico»: ella peleó hasta que dijera <b>Física</b>.</p></div>
            <div class="ficha despues paso"><div class="rotulo">Después</div><p>Coordinó «La Ciencia desde México», del Fondo de Cultura Económica —hoy «La Ciencia para Todos»—, que puso libros de ciencia baratos en miles de manos.</p></div>
          </div>
        </div>
        <svg width="260" height="250" viewBox="0 0 260 250" aria-hidden="true">
          <rect x="118" y="150" width="24" height="76" fill="#254d8f"/>
          <rect x="92" y="222" width="76" height="14" rx="4" fill="#1B3A6B"/>
          <circle cx="130" cy="112" r="46" fill="#c7d4ea" stroke="#254d8f" stroke-width="3"/>
          <g class="a-chispa" stroke="#C9A84C" stroke-width="4" stroke-linecap="round" fill="none">
            <path d="M176 96 l24 -12 l-14 20 l24 -6"/>
          </g>
          <text x="130" y="120" text-anchor="middle" font-size="28" font-weight="700"
                fill="#1B3A6B" font-family="'Source Sans 3',sans-serif">+</text>
        </svg>
      </div>
      <p class="puente paso">Tuvo que pelear hasta por la letra final de su propio título.</p>
    </section>

    <!-- 7 · Mario Molina -->
    <section class="slide">
      <div class="kicker">México · 4 de 4</div>
      <h2>Mario Molina</h2>
      <p class="anios">1943 – 2020</p>
      <div class="fila" style="margin-top:14px">
        <div class="texto">
          <div class="rejilla" style="gap:12px">
            <div class="ficha oro paso"><div class="rotulo">El hallazgo</div><p>En 1974, con Sherwood Rowland, demostró que los gases de los aerosoles y los refrigeradores estaban destruyendo la capa de ozono.</p></div>
            <div class="ficha sesgo paso"><div class="rotulo">El sesgo</div><p>La industria química respondió con escepticismo y resistencia. Tuvieron que pasar <b>trece años</b> hasta el Protocolo de Montreal, en 1987, para que el mundo actuara.</p></div>
            <div class="ficha despues paso"><div class="rotulo">Después</div><p>Nobel de Química en 1995, junto a Rowland y Crutzen. Primer mexicano con un Nobel de ciencias. La capa de ozono se está recuperando.</p></div>
          </div>
        </div>
        <svg width="260" height="250" viewBox="0 0 260 250" aria-hidden="true">
          <circle cx="130" cy="140" r="62" fill="#254d8f"/>
          <path d="M130 46 a94 94 0 0 1 0 188" fill="none" stroke="#5dcaa5" stroke-width="9" opacity=".85"/>
          <path d="M130 46 a94 94 0 0 0 -66 28" fill="none" stroke="#5dcaa5" stroke-width="9" opacity=".85"/>
          <path d="M64 74 a94 94 0 0 0 -28 66" fill="none" stroke="#d85a30" stroke-width="9" stroke-dasharray="9 11"/>
          <g class="a-girar" style="transform-origin:36px 140px">
            <circle cx="36" cy="140" r="8" fill="#C9A84C"/>
          </g>
        </svg>
      </div>
      <p class="puente paso">Aquí el sesgo no fue contra la persona: fue contra el dato que costaba dinero.</p>
    </section>

    <!-- 8 · puente al mundo -->
    <section class="slide">
      <div class="kicker">Cambio de escenario</div>
      <h2 class="paso">Y no es solo cosa de México</h2>
      <div class="regla"></div>
      <p class="grande paso">Tres casos que pasaron en el centro mismo de la ciencia mundial,
      con todo el dinero y todo el prestigio a la mano.</p>
      <p class="nota paso">Los tres tienen algo en común, y quiero que ustedes lo descubran antes de que yo lo diga.</p>
    </section>

    <!-- 9 · Wu -->
    <section class="slide">
      <div class="kicker">El mundo · 1 de 3</div>
      <h2>Chien-Shiung Wu</h2>
      <p class="anios">1912 – 1997 · China y Estados Unidos</p>
      <div class="fila" style="margin-top:14px">
        <div class="texto">
          <div class="rejilla" style="gap:12px">
            <div class="ficha oro paso"><div class="rotulo">El hallazgo</div><p>En 1956 diseñó y ejecutó el experimento con cobalto-60 que demostró algo que nadie creía: que la naturaleza <b>sí distingue</b> la izquierda de la derecha.</p></div>
            <div class="ficha sesgo paso"><div class="rotulo">El sesgo</div><p>El Nobel de 1957 fue para Lee y Yang, que lo habían propuesto en el papel. Ella, que lo probó en el laboratorio, quedó fuera. La nominaron <b>23 veces</b> y nunca lo ganó.</p></div>
            <div class="ficha despues paso"><div class="rotulo">Después</div><p>En 1978 recibió el primer Premio Wolf de Física que se entregó.</p></div>
          </div>
        </div>
        <svg width="260" height="250" viewBox="0 0 260 250" aria-hidden="true">
          <line x1="130" y1="26" x2="130" y2="230" stroke="#d6dceb" stroke-width="3" stroke-dasharray="7 7"/>
          <circle cx="72" cy="128" r="30" fill="#254d8f"/>
          <circle cx="188" cy="128" r="30" fill="#c7d4ea" stroke="#254d8f" stroke-width="3"/>
          <g stroke="#C9A84C" stroke-width="5" stroke-linecap="round">
            <path d="M72 98 L72 44"/><path d="M72 44 l-9 12 M72 44 l9 12"/>
          </g>
          <g stroke="#d85a30" stroke-width="5" stroke-linecap="round">
            <path d="M188 158 L188 212"/><path d="M188 212 l-9 -12 M188 212 l9 -12"/>
          </g>
          <text x="130" y="242" text-anchor="middle" font-size="15" fill="#5b6b82"
                font-family="'Source Sans 3',sans-serif">el espejo no da lo mismo</text>
        </svg>
      </div>
      <p class="puente paso">El que teoriza se lleva el premio. El que mide, la mención.</p>
    </section>

    <!-- 10 · Meitner -->
    <section class="slide">
      <div class="kicker">El mundo · 2 de 3</div>
      <h2>Lise Meitner</h2>
      <p class="anios">1878 – 1968 · Austria</p>
      <div class="fila" style="margin-top:14px">
        <div class="texto">
          <div class="rejilla" style="gap:12px">
            <div class="ficha oro paso"><div class="rotulo">El hallazgo</div><p>A finales de 1938, con su sobrino Otto Frisch, explicó qué era la <b>fisión nuclear</b>: interpretó correctamente unos datos de laboratorio que nadie entendía.</p></div>
            <div class="ficha sesgo paso"><div class="rotulo">El sesgo</div><p>El Nobel de Química de 1944 fue solo para Otto Hahn, el químico que había hecho el experimento. La nominaron <b>49 veces</b> entre física y química. Nunca ganó.</p></div>
            <div class="ficha despues paso"><div class="rotulo">Después</div><p>En 1997 el elemento 109 se llamó <b>meitnerio</b>. Está en tu tabla periódica.</p></div>
          </div>
        </div>
        <svg width="260" height="250" viewBox="0 0 260 250" aria-hidden="true">
          <g class="a-separar izq"><circle cx="96" cy="128" r="38" fill="#254d8f"/></g>
          <g class="a-separar"><circle cx="164" cy="128" r="38" fill="#1B3A6B"/></g>
          <g class="a-chispa" stroke="#C9A84C" stroke-width="4" stroke-linecap="round">
            <path d="M130 74 v-26 M130 182 v26 M74 66 l-16 -16 M186 190 l16 16 M186 66 l16 -16 M74 190 l-16 16"/>
          </g>
        </svg>
      </div>
      <p class="puente paso">El que hizo el experimento ganó. La que lo entendió, no.</p>
    </section>

    <!-- 11 · Bell Burnell -->
    <section class="slide">
      <div class="kicker">El mundo · 3 de 3</div>
      <h2>Jocelyn Bell Burnell</h2>
      <p class="anios">1943 · Irlanda del Norte</p>
      <div class="fila" style="margin-top:14px">
        <div class="texto">
          <div class="rejilla" style="gap:12px">
            <div class="ficha oro paso"><div class="rotulo">El hallazgo</div><p>El 28 de noviembre de 1967, siendo estudiante de doctorado, detectó la primera señal de un <b>púlsar</b>: una estrella muerta que gira y late como un faro.</p></div>
            <div class="ficha sesgo paso"><div class="rotulo">El sesgo</div><p>El Nobel de 1974 fue para su asesor de tesis y para el jefe del laboratorio. Ella, que vio la señal, no apareció.</p></div>
            <div class="ficha despues paso"><div class="rotulo">Después</div><p>En 2018 le dieron un premio de <b>tres millones de dólares</b>. Los donó completos a un fondo para que mujeres, minorías y refugiados puedan estudiar física.</p></div>
          </div>
        </div>
        <svg width="260" height="250" viewBox="0 0 260 250" aria-hidden="true">
          <circle cx="130" cy="112" r="24" fill="#254d8f"/>
          <g class="a-girar" style="transform-origin:130px 112px">
            <path d="M130 112 L130 20" stroke="#C9A84C" stroke-width="8" stroke-linecap="round" opacity=".85"/>
            <path d="M130 112 L130 204" stroke="#C9A84C" stroke-width="8" stroke-linecap="round" opacity=".85"/>
          </g>
          <circle class="a-latir" cx="130" cy="112" r="40" fill="#e8c96a"/>
          <g stroke="#1B3A6B" stroke-width="3" fill="none">
            <path d="M22 234 h30 l7 -26 l7 26 h30 l7 -26 l7 26 h30 l7 -26 l7 26 h30 l7 -26 l7 26 h30"/>
          </g>
        </svg>
      </div>
      <p class="puente paso">El estudiante ve. El asesor firma.</p>
    </section>

    <!-- 12 · el patrón -->
    <section class="slide">
      <div class="kicker">Lo que tienen en común</div>
      <h2>El sesgo no es al azar: tiene forma</h2>
      <div class="regla"></div>
      <ul class="limpia">
        <li class="paso">El que <span class="dato">mide</span> queda por debajo del que teoriza. Wu, Meitner.</li>
        <li class="paso">El <span class="dato">estudiante</span> queda por debajo del asesor. Bell Burnell.</li>
        <li class="paso">La <span class="dato">periferia</span> queda por debajo del centro. Sandoval Vallarta, Haro.</li>
        <li class="paso">La <span class="dato">mujer</span> pelea hasta por cómo se escribe su título. Jáidar.</li>
        <li class="paso">Y si el hallazgo le cuesta dinero a alguien, <span class="dato">tarda en aceptarse</span>. Molina.</li>
      </ul>
      <p class="puente paso">Ninguno de estos cinco patrones se acabó. Siguen operando hoy.</p>
    </section>

    <!-- 13 · el contrapunto honesto -->
    <section class="slide">
      <div class="kicker">Para ser justos</div>
      <h2 class="paso">Esto no es una lista de víctimas</h2>
      <div class="regla"></div>
      <div class="rejilla dos">
        <div class="ficha paso"><div class="rotulo">El sesgo no siempre gana</div><p>Los objetos Herbig-Haro llevan el apellido de Haro. Molina ganó el Nobel. Meitner tiene un elemento. La historia se corrige, tarde y a medias, pero se corrige.</p></div>
        <div class="ficha paso"><div class="rotulo">Y no todo se explica por el sesgo</div><p>A veces el premio se reparte mal porque el descubrimiento fue colectivo y las reglas solo dejan premiar a tres. Eso también es parte del problema.</p></div>
      </div>
      <p class="nota paso">Señalar el sesgo no es restarle mérito a nadie. Es entender que
      <span class="dato">la ciencia la hacen personas</span>, y las personas cargan con su época.</p>
    </section>

    <!-- 14 · la tarea -->
    <section class="slide">
      <div class="kicker">Lo que sigue</div>
      <h2>Ahora búscate el tuyo</h2>
      <div class="regla"></div>
      <ul class="limpia">
        <li class="paso">Elige a alguien de ciencia que <span class="dato">no salga en los libros</span>.</li>
        <li class="paso">Responde las tres preguntas: hallazgo, sesgo, qué pasó después.</li>
        <li class="paso">Una condición: <span class="dato">verifica en dos fuentes</span>. Hoy yo tuve que tirar un dato que parecía cierto.</li>
        <li class="paso">Vale doble si es de México o de América Latina.</li>
      </ul>
      <p class="puente paso">Si nadie cuenta estas historias, se pierden. Hoy les toca a ustedes contarlas.</p>
    </section>

    <div id="pie">
      <div id="puntos"></div>
      <div id="cuenta">1 / 14</div>
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
    if (e.target.closest('#pie')) { return; }
    if (e.clientX < lamina.getBoundingClientRect().left + lamina.offsetWidth * 0.18) { atras(); }
    else { adelante(); }
  });

  function encajar(){
    var m = 24;
    var k = Math.min((innerWidth - m * 2) / 1280, (innerHeight - m * 2) / 720, 1.6);
    lamina.style.transform = 'translate(-50%,-50%) scale(' + k.toFixed(4) + ')';
  }
  addEventListener('resize', encajar);
  document.addEventListener('fullscreenchange', encajar);

  encajar();
  pintar();
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
    n = html.count('class="slide')
    assert ("1 / %d" % n) in html, "el contador del pie no cuadra con las láminas"
    print("%s  ·  %.0f KB  ·  %d láminas"
          % (os.path.basename(SALIDA), os.path.getsize(SALIDA) / 1024, n))
    print("sin imágenes ni peticiones externas: verificado")


if __name__ == "__main__":
    main()
