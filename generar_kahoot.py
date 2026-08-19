# -*- coding: utf-8 -*-
"""Genera las dos páginas del tablero en vivo «¿De qué física es esto?»:

    kahoot-tablero.html   lo que proyectas tú: pregunta, cronómetro y marcador
    kahoot.html           lo que abren los alumnos en el celular

El reparto de trabajo entre las dos es deliberado: **la pregunta solo sale en
el proyector**. El celular es un botonera de seis teclas y nada más. Eso hace
que los alumnos miren al frente en vez de a su pantalla, y de paso reduce a la
mitad las llamadas al servidor, que es el recurso escaso.

El banco de reactivos vive aquí, en un solo lugar, y de aquí sale también la
versión impresa de tarjetas por si falla el internet de la escuela.

    py generar_kahoot.py
"""
import base64
import io
import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
FUENTES = r"S:\claude\pase de lista\static"
SITIO = "https://jsaynees.github.io/kahoot.html"

# Dirección /exec del proyecto de Apps Script del tablero (implementado el
# 19-ago-2026). Va dentro de la página del alumno porque su navegador tiene que
# saber a dónde mandar la respuesta; no es un secreto. Lo que sí es privado es
# el TOKEN, que vive solo en el proyecto de Google y se teclea en el tablero.
URL_SCRIPT = ("https://script.google.com/macros/s/"
              "AKfycbyQIeeh7Ve89VMPzNnwhGZXXhqcdLb_Aq7sP1e2hZ1FMgqBWO0oZeGeWr37BQMAwpwl7A/exec")

AREAS = ["Mecánica", "Térmica", "Electromagnetismo", "Óptica",
         "Física moderna", "No es física"]

# (ronda, enunciado, índice del área correcta, por qué)
BANCO = [
    # ── Ronda 1 · para calentar ───────────────────────────────────────────
    (1, "El microondas calienta un vaso de agua", 2,
     "Ondas de radio de 2.45 GHz sacuden las moléculas de agua. El calor es la consecuencia."),
    (1, "El hielo flota en tu vaso", 0,
     "Empuje de Arquímedes: el agua sólida es menos densa que la líquida."),
    (1, "La olla exprés cuece los frijoles en la mitad del tiempo", 1,
     "Con más presión adentro, el agua hierve por arriba de 100 °C."),
    (1, "Se forma un arcoíris después de la lluvia", 3,
     "Cada gota refracta la luz y cada color se desvía un poco distinto."),
    (1, "Tus audífonos se conectan solos al celular", 2,
     "Bluetooth son ondas de radio de 2.4 GHz: la misma familia que la luz."),
    (1, "Un tsunami cruza el Pacífico en doce horas", 0,
     "Es una onda en un fluido; su rapidez la manda la profundidad del mar."),
    (1, "El mango de la cuchara se calienta sin tocar el fuego", 1,
     "Conducción: la agitación de las partículas se propaga por el metal."),
    (1, "Tus lentes te corrigen la vista", 3,
     "Cambian dónde se forma la imagen dentro de tu ojo."),
    (1, "La resonancia magnética ve tu rodilla sin abrirla", 4,
     "Un campo intenso alinea el giro de tus protones y se escucha cómo se desalinean."),
    (1, "El cinturón de seguridad te salva en un choque", 0,
     "Alarga el tiempo del frenado, y con más tiempo la fuerza sobre ti baja."),
    (1, "El refrigerador enfría la comida", 1,
     "No fabrica frío: saca calor de adentro y lo tira por la rejilla de atrás."),
    (1, "El internet llega a tu casa por fibra óptica", 3,
     "Luz rebotando dentro de un vidrio, atrapada por reflexión total."),

    # ── Ronda 2 · ya hay que pensarle ────────────────────────────────────
    (2, "El GPS de tu celular se corrige varias veces al día", 4,
     "Los relojes de los satélites corren distinto: relatividad, todos los días."),
    (2, "Un rayo cae en el pararrayos del edificio", 2,
     "Es la misma electricidad del enchufe, con cien millones de volts."),
    (2, "La pantalla de tu celular enciende un pixel", 4,
     "Semiconductores: física cuántica del estado sólido."),
    (2, "El agua hierve más rápido en la Ciudad de México que en Veracruz", 1,
     "A 2 240 metros hay menos presión, así que hierve a unos 93 °C."),
    (2, "Un imán levanta clips de la mesa", 2,
     "Campo magnético: los electrones del hierro se alinean con él."),
    (2, "El cielo se ve azul de día y rojo al atardecer", 3,
     "La atmósfera dispersa más el azul; al atardecer la luz cruza más aire y solo pasa el rojo."),
    (2, "Un satélite da vueltas sin caerse, y nada lo sostiene", 0,
     "Sí se está cayendo: cae al mismo ritmo al que la Tierra se le curva debajo."),
    (2, "Los paneles solares del techo generan corriente", 4,
     "Efecto fotoeléctrico: un fotón le arranca un electrón al material."),
    (2, "El ventilador no enfría el cuarto, te enfría a ti", 1,
     "Acelera la evaporación de tu sudor, y evaporar cuesta energía que sale de tu piel."),
    (2, "El eco en una cancha vacía", 0,
     "El sonido es una onda mecánica: necesita aire y rebota en las paredes."),
    (2, "Un termo mantiene el café caliente seis horas", 1,
     "El vacío entre sus paredes corta la conducción y la convección."),
    (2, "Ves una estrella que quizá ya no existe", 3,
     "Su luz viaja a rapidez finita: lo que ves salió de ahí hace miles de años."),
    (2, "Un globo frotado en tu cabello se pega a la pared", 2,
     "Carga eléctrica por frotamiento: el globo se queda con electrones de más."),

    # ── Ronda 3 · trampas y casos difíciles ──────────────────────────────
    (3, "Sube la inflación en México", 5,
     "Trampa. Aquí «inflación» es de economía; la palabra se comparte, el fenómeno no."),
    (3, "Tu horóscopo dice que Marte entró en tu casa siete", 5,
     "Trampa. La astrología usa nombres de astros pero no predice nada comprobable."),
    (3, "Se te acelera el corazón cuando corres", 5,
     "Es fisiología. La física puede medir la presión de la sangre, pero la pregunta es de biología."),
    (3, "El pan se esponja con la levadura", 5,
     "Es química y biología: un hongo produce gas. La física entra después, en cómo se expande."),
    (3, "Una canción te pone de buenas", 5,
     "El sonido es física; que te guste, no. Eso es psicología."),
    (3, "La aurora boreal pinta el cielo de verde", 2,
     "Partículas del Sol guiadas por el campo magnético de la Tierra chocan con el aire."),
    (3, "Un avión de 80 toneladas se sostiene en el aire", 0,
     "El ala desvía aire hacia abajo, y el aire empuja el ala hacia arriba."),
    (3, "El WiFi atraviesa una pared pero no una lámina de metal", 2,
     "El metal conduce: sus electrones libres cancelan la onda y la reflejan."),
    (3, "Una copa se rompe con una nota muy aguda", 0,
     "Resonancia: la onda de sonido la hace vibrar en su frecuencia propia hasta romperla."),
    (3, "La bomba atómica saca energía de un gramo de materia", 4,
     "Física nuclear: una parte de la masa se convierte en energía."),
]


def incrustar_fuente(nombre):
    with open(os.path.join(FUENTES, nombre), "rb") as f:
        return "data:font/woff2;base64," + base64.b64encode(f.read()).decode("ascii")


def qr(texto):
    """QR de la dirección del alumno, como SVG incrustado. Se dibuja en el
    tablero para que nadie tenga que teclear la dirección a mano."""
    import segno
    buf = io.BytesIO()
    segno.make(texto, error="m").save(buf, kind="svg", scale=1, border=2,
                                      dark="#1B3A6B", light=None, xmldecl=False,
                                      svgns=True, omitsize=True)
    return "data:image/svg+xml;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


ESTILO_COMUN = """
@font-face{font-family:'Source Sans 3';src:url(@@SANS@@) format('woff2');font-weight:300 700;font-display:swap}
:root{
  --navy:#1B3A6B; --navy-dark:#112447; --navy-light:#254d8f;
  --gold:#C9A84C; --gold-light:#e8c96a;
  --tinta:#1e293b; --suave:#5b6b82; --papel:#fff; --lienzo:#eef1f7; --borde:#d6dceb;
  --ok:#1d9e75; --mal:#d85a30;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Source Sans 3',system-ui,sans-serif;color:var(--tinta);background:var(--lienzo);
     -webkit-font-smoothing:antialiased}
button{font-family:inherit;cursor:pointer;border:0}
.oculto{display:none !important}
"""

# ── Tablero del profesor ────────────────────────────────────────────────────
TABLERO = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tablero · ¿De qué física es esto?</title>
<style>
@@COMUN@@
body{height:100vh;overflow:hidden;display:flex;flex-direction:column}
header{background:var(--navy);color:#fff;padding:14px 28px;display:flex;align-items:center;gap:18px}
header h1{font-size:20px;font-weight:600}
header .sep{flex:1}
header .codigo{font-size:30px;font-weight:700;letter-spacing:.22em;color:var(--gold-light)}
main{flex:1;padding:26px 40px;display:flex;flex-direction:column;justify-content:center;overflow:auto}
.panel{max-width:920px;margin:0 auto;width:100%}
label{display:block;font-size:14px;color:var(--suave);margin:14px 0 5px;font-weight:600}
input,select{width:100%;padding:11px 13px;border:1px solid var(--borde);border-radius:9px;font-size:16px;
             font-family:inherit;background:var(--papel);color:var(--tinta)}
.btn{background:var(--navy);color:#fff;padding:13px 22px;border-radius:10px;font-size:17px;font-weight:600}
.btn:hover{background:var(--navy-light)}
.btn.oro{background:var(--gold);color:var(--navy-dark)}
.btn.claro{background:var(--papel);color:var(--navy);border:1px solid var(--borde)}
.fila{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:20px}
.aviso{margin-top:14px;font-size:15px;color:var(--mal);min-height:20px}

.sala{display:grid;grid-template-columns:1fr auto;gap:34px;align-items:center}
.megacodigo{font-size:104px;font-weight:700;letter-spacing:.14em;color:var(--navy);line-height:1}
.instr{font-size:22px;color:var(--suave);line-height:1.55;margin-top:10px}
.instr b{color:var(--navy)}
.qr{width:210px;height:210px;background:#fff;border:1px solid var(--borde);border-radius:14px;padding:10px}
.jugadores{display:flex;flex-wrap:wrap;gap:9px;margin-top:22px;max-height:210px;overflow:auto}
.jug{background:var(--papel);border:1px solid var(--borde);border-radius:999px;padding:7px 15px;font-size:16px}

.enunciado{font-size:46px;font-weight:700;line-height:1.22;color:var(--navy);text-align:center;
           min-height:130px;display:flex;align-items:center;justify-content:center}
.opciones{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;margin-top:26px}
.op{background:var(--papel);border:2px solid var(--borde);border-radius:14px;padding:20px 14px;
    font-size:23px;font-weight:600;text-align:center;color:var(--navy);position:relative}
.op .cuantos{display:block;font-size:15px;color:var(--suave);font-weight:400;margin-top:6px}
.op.correcta{background:#e1f5ee;border-color:var(--ok);color:#0f6e56}
.op.fallada{opacity:.5}
.barra{height:9px;background:var(--borde);border-radius:5px;overflow:hidden;margin-top:22px}
.barra>div{height:100%;background:var(--gold);width:100%}
.reloj{font-size:44px;font-weight:700;color:var(--navy);text-align:center;font-variant-numeric:tabular-nums}
.contestaron{text-align:center;font-size:19px;color:var(--suave);margin-top:8px}
.porque{margin-top:18px;font-size:21px;line-height:1.5;color:var(--tinta);text-align:center;max-width:74ch;
        margin-left:auto;margin-right:auto}
table{width:100%;border-collapse:collapse;margin-top:18px;font-size:19px}
th,td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--borde)}
th{font-size:14px;text-transform:uppercase;letter-spacing:.09em;color:var(--suave)}
td.num{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}
tr.podio td{background:#faf5e6}
.conexion{margin-top:14px;text-align:center;font-size:16px;min-height:24px;color:var(--suave)}
.conexion.espera{color:var(--navy-light)}
.conexion.bien{color:var(--ok)}
.conexion.malo{color:var(--mal);font-weight:600}
.casilla{display:flex;align-items:center;gap:10px;margin-top:18px;font-size:16px;color:var(--tinta)}
.casilla input{width:20px;height:20px;accent-color:var(--navy)}
.ayudita{font-size:14px;color:var(--suave);margin-top:6px;line-height:1.5}
</style>
</head>
<body>
<header>
  <h1>¿De qué física es esto?</h1>
  <div class="sep"></div>
  <div id="hcodigo" class="codigo"></div>
</header>
<main>

  <section id="p-config" class="panel">
    <h2 style="font-size:26px;color:var(--navy)">Preparar la partida</h2>
    <label for="url">Dirección del script (/exec)</label>
    <input id="url" type="text" value="@@URL_SCRIPT@@">
    <label for="token">Clave de acceso docente</label>
    <input id="token" type="password" placeholder="Tu clave">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
      <div><label for="grupo">Grupo</label>
        <select id="grupo"><option>3010</option><option>3040</option><option>3050</option><option>3080</option></select></div>
      <div><label for="ronda">Ronda</label>
        <select id="ronda"><option value="1">1 · para calentar</option><option value="2">2 · hay que pensarle</option><option value="3">3 · trampas</option><option value="0">todas</option></select></div>
      <div><label for="segundos">Segundos por pregunta</label>
        <input id="segundos" type="number" min="5" max="60" value="15"></div>
    </div>
    <label class="casilla" for="sin-red">
      <input type="checkbox" id="sin-red">
      Jugar sin internet (responden con las tarjetas de colores)
    </label>
    <p class="ayudita">El tablero funciona igual —pregunta, cronómetro, respuesta correcta y
    explicación—, pero no usa celulares ni guarda calificaciones. Es el modo a prueba de
    todo: no depende del wifi de la escuela ni de los servidores de Google.</p>
    <div class="fila"><button class="btn" id="b-abrir">Abrir sala</button></div>
    <div class="aviso" id="aviso-config"></div>
  </section>

  <section id="p-sala" class="panel oculto">
    <div class="sala">
      <div>
        <div class="megacodigo" id="megacodigo">····</div>
        <p class="instr">Entra a <b>@@SITIO@@</b><br>y escribe ese código.</p>
        <button class="btn oro" id="b-empezar" style="margin-top:20px">Empezar</button>
      </div>
      <img class="qr" id="qr" alt="Código QR con la dirección">
    </div>
    <p style="margin-top:24px;font-size:17px;color:var(--suave)"><span id="n-jug">0</span> conectados</p>
    <div class="jugadores" id="jugadores"></div>
  </section>

  <section id="p-juego" class="panel oculto">
    <p style="text-align:center;font-size:15px;color:var(--suave);letter-spacing:.1em;text-transform:uppercase"
       id="etiqueta">Pregunta 1 de 12</p>
    <div class="enunciado" id="enunciado"></div>
    <div class="reloj" id="reloj">—</div>
    <div class="barra"><div id="barra"></div></div>
    <p class="contestaron" id="contestaron"></p>
    <div class="opciones" id="opciones"></div>
    <p class="porque oculto" id="porque"></p>
    <div class="fila" style="justify-content:center">
      <button class="btn claro oculto" id="b-reintentar">Reintentar</button>
      <button class="btn claro oculto" id="b-cerrar">Cerrar ahora</button>
      <button class="btn oculto" id="b-siguiente">Siguiente</button>
      <button class="btn claro" id="b-terminar">Terminar dinámica</button>
    </div>
    <p class="conexion" id="conexion"></p>
  </section>

  <section id="p-final" class="panel oculto">
    <h2 style="font-size:30px;color:var(--navy)">Marcador final</h2>
    <table id="tabla-final"><thead><tr><th>#</th><th>Alumno</th><th style="text-align:right">Aciertos</th><th style="text-align:right">Puntos</th></tr></thead><tbody></tbody></table>
    <div class="fila">
      <button class="btn" id="b-guardar">Guardar en la hoja</button>
      <button class="btn claro" id="b-csv">Descargar CSV</button>
      <button class="btn claro" id="b-otra">Otra ronda</button>
    </div>
    <div class="aviso" id="aviso-final"></div>
  </section>

</main>
<script>
var BANCO = @@BANCO@@;
var AREAS = @@AREAS@@;
var $ = function(id){ return document.getElementById(id); };
var cfg = {}, sala = '', preguntas = [], idx = 0;
/* registro[n] = {nombre: {o, t}} — la verdad de cada pregunta. Los puntos se
   recalculan siempre desde aquí, nunca se van sumando: así revelar dos veces
   la misma pregunta (una al cerrar y otra cuando llegan los datos) no cuenta
   doble. */
var registro = {}, jugadores = [];
var tic = null, sondeo = null, abierta = 0, limite = 15000, cerrada = false, sinRed = false;

/* JSONP: el script de Google no manda cabeceras CORS, así que se llama
   inyectando un <script>. Es el mismo mecanismo del panel de diagnóstico.
   El plazo es largo a propósito: se midió que este despliegue tarda entre 3 y
   11 segundos por llamada, y con 15 s se cortaban llamadas que sí iban a
   llegar. */
var contador = 0;
function llamar(params, alLlegar, alFallar){
  var nombre = '__k' + (++contador);
  var t = setTimeout(function(){ limpiar(); if (alFallar) alFallar('tiempo'); }, 30000);
  function limpiar(){
    clearTimeout(t);
    try{ delete window[nombre]; }catch(e){ window[nombre] = undefined; }
    if (s.parentNode) s.parentNode.removeChild(s);
  }
  window[nombre] = function(r){ limpiar(); alLlegar(r); };
  var q = Object.keys(params).map(function(k){
    return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
  }).join('&');
  var s = document.createElement('script');
  s.src = cfg.url + (cfg.url.indexOf('?') < 0 ? '?' : '&') + q + '&callback=' + nombre;
  s.onerror = function(){ limpiar(); if (alFallar) alFallar('red'); };
  document.body.appendChild(s);
}

function ver(cual){
  ['p-config','p-sala','p-juego','p-final'].forEach(function(id){
    $(id).classList.toggle('oculto', id !== cual);
  });
}

/* ── Preparar ───────────────────────────────────────────────────────────── */
['url','token','grupo','segundos'].forEach(function(id){
  var v = localStorage.getItem('k_' + id);
  if (v) $(id).value = v;
});

$('b-abrir').addEventListener('click', function(){
  sinRed = $('sin-red').checked;
  cfg = {url:$('url').value.trim(), token:$('token').value.trim(),
         grupo:$('grupo').value, segundos:+$('segundos').value || 15};
  limite = cfg.segundos * 1000;

  var r = $('ronda').value;
  preguntas = BANCO.filter(function(q){ return r === '0' || String(q[0]) === r; });
  if (!preguntas.length){ $('aviso-config').textContent = 'Esa ronda no tiene reactivos.'; return; }
  registro = {}; jugadores = []; idx = 0;

  if (sinRed){                       // ni sala ni servidor: al juego directo
    sala = '';
    $('hcodigo').textContent = 'sin internet';
    ver('p-juego');
    lanzar();
    return;
  }

  if (!cfg.url || !cfg.token){ $('aviso-config').textContent = 'Faltan la dirección o la clave.'; return; }
  ['url','token','grupo','segundos'].forEach(function(id){ localStorage.setItem('k_' + id, $(id).value); });

  var t0 = Date.now();
  $('b-abrir').disabled = true;
  var cuenta = setInterval(function(){
    $('aviso-config').textContent = 'Abriendo la sala… ' + Math.round((Date.now() - t0) / 1000) + ' s';
  }, 1000);
  $('aviso-config').textContent = 'Abriendo la sala…';

  llamar({accion:'abrir', token:cfg.token, grupo:cfg.grupo}, function(res){
    clearInterval(cuenta); $('b-abrir').disabled = false;
    if (res.error){ $('aviso-config').textContent = 'El script respondió: ' + res.error; return; }
    $('aviso-config').textContent = '';
    sala = res.codigo;
    $('megacodigo').textContent = sala;
    $('hcodigo').textContent = sala;
    $('qr').src = '@@QR@@';
    ver('p-sala');
    sondearSala();
  }, function(motivo){
    clearInterval(cuenta); $('b-abrir').disabled = false;
    $('aviso-config').textContent = (motivo === 'tiempo'
      ? 'El script no contestó en 30 segundos. '
      : 'No se pudo contactar al script. ') +
      'Puedes marcar «jugar sin internet» y dar la clase igual.';
  });
});

function sondearSala(){
  clearInterval(sondeo);
  sondeo = setInterval(function(){
    llamar({accion:'estado', token:cfg.token, codigo:sala, n:-1}, function(res){
      if (!res.jugadores) return;
      $('n-jug').textContent = res.jugadores.length;
      $('jugadores').innerHTML = res.jugadores.map(function(j){
        return '<span class="jug"></span>';
      }).join('');
      Array.prototype.forEach.call($('jugadores').children, function(el, i){
        el.textContent = res.jugadores[i];
      });
    }, function(){});
  }, 3000);
}

/* ── Juego ──────────────────────────────────────────────────────────────────
   Regla de oro tras la primera prueba en el salón: **la pantalla nunca espera
   al servidor**. Este despliegue de Apps Script tarda entre 3 y 11 segundos por
   llamada, así que si el tablero se queda callado mientras espera, parece
   descompuesto. Ahora la pregunta se pinta de inmediato, la espera se anuncia
   con su cronómetro, y el revelado sale al instante con lo que haya y se
   completa cuando llegan los datos.                                          */

function decirConexion(texto, clase){
  $('conexion').textContent = texto || '';
  $('conexion').className = 'conexion' + (clase ? ' ' + clase : '');
}

$('b-empezar').addEventListener('click', function(){
  clearInterval(sondeo);
  idx = 0; registro = {};
  ver('p-juego');
  lanzar();
});

function pintarPregunta(q){
  $('etiqueta').textContent = 'Pregunta ' + (idx + 1) + ' de ' + preguntas.length;
  $('enunciado').textContent = q[1];
  $('porque').classList.add('oculto');
  $('b-siguiente').classList.add('oculto');
  $('b-cerrar').classList.add('oculto');
  $('b-reintentar').classList.add('oculto');
  $('contestaron').textContent = '';
  $('reloj').textContent = '—';
  $('barra').style.width = '100%';
  $('opciones').innerHTML = AREAS.map(function(a){
    return '<div class="op">' + a + '<span class="cuantos">—</span></div>';
  }).join('');
}

function lanzar(){
  cerrada = false;
  pintarPregunta(preguntas[idx]);
  if (sinRed){
    decirConexion('Sin internet: que levanten su tarjeta de color.', '');
    $('b-cerrar').classList.remove('oculto');
    arrancarReloj();
    return;
  }
  abrirEnServidor(0);
}

/** Abre la pregunta en el servidor. Mientras tanto la pregunta YA está en
 *  pantalla, así que la espera se vuelve tiempo de lectura. */
function abrirEnServidor(intento){
  var t0 = Date.now();
  $('b-reintentar').classList.add('oculto');
  decirConexion('Preparando… lean la pregunta.', 'espera');
  var cuenta = setInterval(function(){
    decirConexion('Preparando… ' + Math.round((Date.now() - t0) / 1000) + ' s · lean la pregunta.', 'espera');
  }, 1000);

  llamar({accion:'pregunta', token:cfg.token, codigo:sala, n:idx, limite:limite}, function(res){
    clearInterval(cuenta);
    if (res.error){
      decirConexion('El script respondió: ' + res.error, 'malo');
      $('b-reintentar').classList.remove('oculto');
      return;
    }
    abierta = res.abierta;
    decirConexion('Abierta. Ya pueden contestar.', 'bien');
    $('b-cerrar').classList.remove('oculto');
    arrancarReloj();
  }, function(){
    clearInterval(cuenta);
    if (intento < 1){ abrirEnServidor(intento + 1); return; }
    decirConexion('El servidor no contestó. Reintenta, o cierra y sigue sin registrar esta pregunta.', 'malo');
    $('b-reintentar').classList.remove('oculto');
    $('b-cerrar').classList.remove('oculto');
  });
}

$('b-reintentar').addEventListener('click', function(){ abrirEnServidor(0); });

function arrancarReloj(){
  clearInterval(tic);
  var inicio = Date.now();
  tic = setInterval(function(){
    var queda = Math.max(0, limite - (Date.now() - inicio));
    $('reloj').textContent = Math.ceil(queda / 1000);
    $('barra').style.width = (queda / limite * 100).toFixed(1) + '%';
    if (queda <= 0){ clearInterval(tic); cerrar(); }
  }, 100);
}

$('b-cerrar').addEventListener('click', function(){ clearInterval(tic); cerrar(); });

function cerrar(){
  if (cerrada) return;
  cerrada = true;
  clearInterval(tic);
  $('b-cerrar').classList.add('oculto');
  $('b-reintentar').classList.add('oculto');
  $('reloj').textContent = '0';
  $('barra').style.width = '0%';
  revelar();                                  // al instante, con lo que haya
  if (sinRed){ decirConexion('¿Quién le atinó?', ''); return; }

  var t0 = Date.now();
  decirConexion('Contando respuestas…', 'espera');
  var cuenta = setInterval(function(){
    decirConexion('Contando respuestas… ' + Math.round((Date.now() - t0) / 1000) + ' s', 'espera');
  }, 1000);
  llamar({accion:'estado', token:cfg.token, codigo:sala, n:idx}, function(res){
    clearInterval(cuenta);
    if (res && res.jugadores){
      jugadores = res.jugadores;
      registro[idx] = res.respuestas || {};
      revelar();
      decirConexion('', '');
    } else {
      decirConexion('No se pudieron contar las respuestas de esta pregunta.', 'malo');
    }
  }, function(){
    clearInterval(cuenta);
    decirConexion('No llegaron las respuestas de esta pregunta. Las demás no se ven afectadas.', 'malo');
  });
}

/** Pinta el revelado. Es idempotente: se puede llamar las veces que haga
 *  falta, porque los puntos se recalculan desde `registro`, no se acumulan. */
function revelar(){
  var q = preguntas[idx], correcta = q[2];
  var resp = registro[idx] || {};
  var cuentas = [0,0,0,0,0,0];
  Object.keys(resp).forEach(function(nombre){
    var o = resp[nombre].o;
    if (o >= 0 && o < 6) cuentas[o]++;
  });
  Array.prototype.forEach.call($('opciones').children, function(el, i){
    el.querySelector('.cuantos').textContent = sinRed ? ''
      : (cuentas[i] === 1 ? '1 alumno' : cuentas[i] + ' alumnos');
    el.classList.toggle('correcta', i === correcta);
    el.classList.toggle('fallada', i !== correcta);
  });
  if (!sinRed && jugadores.length){
    $('contestaron').textContent = Object.keys(resp).length + ' de ' + jugadores.length + ' contestaron';
  }
  $('porque').textContent = q[3];
  $('porque').classList.remove('oculto');
  $('b-siguiente').classList.remove('oculto');
  $('b-siguiente').textContent = (idx + 1 < preguntas.length) ? 'Siguiente' : 'Ver marcador';
}

$('b-siguiente').addEventListener('click', function(){
  if (idx + 1 < preguntas.length){ idx++; lanzar(); }
  else { terminar(); }
});

/* Salida de emergencia: siempre visible, y también con Escape. Sin esto, si
   una llamada se quedaba colgada no había forma de salir de la dinámica. */
$('b-terminar').addEventListener('click', function(){ terminar(); });

/* ── Final ──────────────────────────────────────────────────────────────── */
/** Recorre el registro completo y arma la tabla. Al calcularse de cero cada
 *  vez, da igual cuántas veces se haya revelado una pregunta o si alguna se
 *  quedó sin datos: lo que no llegó simplemente cuenta como no contestada. */
function tabla(){
  var acumulado = {};
  jugadores.forEach(function(n){ acumulado[n] = {puntos:0, aciertos:0, detalle:''}; });
  for (var n = 0; n < preguntas.length; n++){
    var correcta = preguntas[n][2], resp = registro[n] || {};
    Object.keys(resp).forEach(function(nombre){
      if (!acumulado[nombre]) acumulado[nombre] = {puntos:0, aciertos:0, detalle:''};
    });
    Object.keys(acumulado).forEach(function(nombre){
      var r = resp[nombre];
      if (!r){ acumulado[nombre].detalle += '-'; return; }
      var bien = r.o === correcta;
      acumulado[nombre].puntos += bien ? Math.max(100, Math.round(1000 * (1 - r.t / limite))) : 0;
      acumulado[nombre].aciertos += bien ? 1 : 0;
      acumulado[nombre].detalle += bien ? '1' : '0';
    });
  }
  return Object.keys(acumulado).map(function(nombre){
    var a = acumulado[nombre];
    return {nombre:nombre, puntos:a.puntos, aciertos:a.aciertos,
            contestadas:a.detalle.replace(/-/g, '').length, detalle:a.detalle};
  }).sort(function(a, b){ return b.puntos - a.puntos; });
}

function terminar(){
  clearInterval(tic); clearInterval(sondeo);
  decirConexion('', '');
  if (sinRed || !jugadores.length){
    ver('p-config');
    $('aviso-config').textContent = sinRed
      ? 'Dinámica terminada. En el modo sin internet no hay marcador.'
      : 'Dinámica terminada. No hubo respuestas registradas.';
    return;
  }
  var filas = tabla();
  $('tabla-final').querySelector('tbody').innerHTML = filas.map(function(f, i){
    return '<tr class="' + (i < 3 ? 'podio' : '') + '"><td>' + (i + 1) +
      '</td><td class="nom"></td><td class="num">' + f.aciertos + ' / ' + preguntas.length +
      '</td><td class="num">' + f.puntos + '</td></tr>';
  }).join('');
  Array.prototype.forEach.call($('tabla-final').querySelectorAll('td.nom'), function(td, i){
    td.textContent = filas[i].nombre;
  });
  ver('p-final');
}

$('b-guardar').addEventListener('click', function(){
  var t0 = Date.now();
  $('b-guardar').disabled = true;
  var cuenta = setInterval(function(){
    $('aviso-final').textContent = 'Guardando… ' + Math.round((Date.now() - t0) / 1000) + ' s';
  }, 1000);
  $('aviso-final').textContent = 'Guardando…';
  llamar({accion:'guardar', token:cfg.token, codigo:sala, grupo:cfg.grupo,
          filas:JSON.stringify(tabla())}, function(res){
    clearInterval(cuenta); $('b-guardar').disabled = false;
    $('aviso-final').textContent = res.error
      ? ('El script respondió: ' + res.error)
      : ('Guardadas ' + res.guardadas + ' filas en la hoja.');
  }, function(){
    clearInterval(cuenta); $('b-guardar').disabled = false;
    $('aviso-final').textContent = 'No se pudo guardar. Descarga el CSV para no perder la partida.';
  });
});

$('b-csv').addEventListener('click', function(){
  var lineas = [['Lugar','Alumno','Aciertos','Contestadas','Puntos','Detalle'].join(',')];
  tabla().forEach(function(f, i){
    lineas.push([i + 1, '"' + f.nombre.replace(/"/g, '""') + '"',
                 f.aciertos, f.contestadas, f.puntos, f.detalle].join(','));
  });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\\ufeff' + lineas.join('\\n')], {type:'text/csv'}));
  a.download = 'kahoot-' + cfg.grupo + '-' + sala + '.csv';
  a.click();
});

$('b-otra').addEventListener('click', function(){ ver('p-config'); });

document.addEventListener('keydown', function(e){
  if (e.key === ' ' && !$('b-siguiente').classList.contains('oculto')){
    e.preventDefault(); $('b-siguiente').click();
  } else if (e.key === 'Enter' && !$('b-cerrar').classList.contains('oculto')){
    e.preventDefault(); $('b-cerrar').click();
  } else if (e.key === 'Escape' && !$('p-juego').classList.contains('oculto')){
    e.preventDefault(); terminar();
  }
});
</script>
</body>
</html>
"""

# ── Página del alumno ───────────────────────────────────────────────────────
ALUMNO = """<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<title>¿De qué física es esto?</title>
<style>
@@COMUN@@
body{min-height:100vh;display:flex;flex-direction:column;padding:16px;background:var(--navy)}
.tarjeta{background:var(--papel);border-radius:18px;padding:22px;margin:auto 0;width:100%}
h1{font-size:21px;color:var(--navy);font-weight:700;text-align:center}
p.sub{font-size:15px;color:var(--suave);text-align:center;margin-top:6px;line-height:1.5}
label{display:block;font-size:13px;color:var(--suave);margin:16px 0 5px;font-weight:600}
input,select{width:100%;padding:14px;border:1px solid var(--borde);border-radius:11px;font-size:17px;
             font-family:inherit;background:var(--papel);color:var(--tinta)}
#codigo{text-transform:uppercase;letter-spacing:.3em;text-align:center;font-size:26px;font-weight:700}
.btn{width:100%;background:var(--navy);color:#fff;padding:16px;border-radius:12px;font-size:18px;
     font-weight:600;margin-top:18px}
.aviso{margin-top:12px;font-size:14px;color:var(--mal);min-height:18px;text-align:center}
.hola{text-align:center;font-size:16px;color:var(--suave);margin-bottom:14px}
.hola b{color:var(--navy)}
.mirar{text-align:center;font-size:17px;color:var(--navy);font-weight:600;margin-bottom:16px}
.botonera{display:grid;grid-template-columns:1fr 1fr;gap:11px}
.area{padding:22px 10px;border-radius:14px;font-size:17px;font-weight:600;color:#fff;line-height:1.25;
      min-height:88px;display:flex;align-items:center;justify-content:center;text-align:center}
.a0{background:#1B3A6B}.a1{background:#d85a30}.a2{background:#254d8f}
.a3{background:#0f6e56}.a4{background:#6d4bb6}.a5{background:#5f5e5a}
.area:disabled{opacity:.42}
.estado{margin-top:18px;text-align:center;font-size:17px;font-weight:600;min-height:26px}
.estado.ok{color:var(--ok)}.estado.esperando{color:var(--suave)}.estado.malo{color:var(--mal)}
</style>
</head>
<body>

<div class="tarjeta" id="p-entrar">
  <h1>¿De qué física es esto?</h1>
  <p class="sub">Escribe el código que está en la pantalla del salón.</p>
  <label for="codigo">Código de sala</label>
  <input id="codigo" type="text" maxlength="4" autocomplete="off" autocapitalize="characters" placeholder="····">
  <label for="nombre">Tu nombre completo</label>
  <input id="nombre" type="text" autocomplete="name" placeholder="Como aparece en la lista">
  <label for="grupo">Grupo</label>
  <select id="grupo"><option>3010</option><option>3040</option><option>3050</option><option>3080</option></select>
  <button class="btn" id="b-entrar">Entrar</button>
  <div class="aviso" id="aviso"></div>
</div>

<div class="tarjeta oculto" id="p-jugar">
  <p class="hola">Listo, <b id="mi-nombre"></b></p>
  <p class="hola" id="mi-lugar" style="margin-top:-8px"></p>
  <p class="mirar">Mira la pantalla y elige el área</p>
  <div class="botonera" id="botonera"></div>
  <div class="estado esperando" id="estado">Esperando la primera pregunta…</div>
</div>

<script>
/* ═══════════════════════════════════════════════════════════════════════
   LO ÚNICO QUE HAY QUE CAMBIAR EN ESTE ARCHIVO
   Pega entre las comillas la dirección /exec de tu script de Google.
   Sin esto, los celulares no tienen a dónde mandar las respuestas.
   ═══════════════════════════════════════════════════════════════════════ */
var URL_SCRIPT = '@@URL_SCRIPT@@';

var AREAS = @@AREAS@@;
var $ = function(id){ return document.getElementById(id); };
var codigo = '', nombre = '', ultimaN = -1;

var contador = 0;
function llamar(params, alLlegar, alFallar){
  var nombreCb = '__r' + (++contador);
  // Plazo largo: el despliegue tarda entre 3 y 11 segundos por llamada, y con
  // 12 s se cortaban respuestas que sí iban a llegar.
  var t = setTimeout(function(){ limpiar(); if (alFallar) alFallar('tiempo'); }, 30000);
  function limpiar(){
    clearTimeout(t);
    try{ delete window[nombreCb]; }catch(e){ window[nombreCb] = undefined; }
    if (s.parentNode) s.parentNode.removeChild(s);
  }
  window[nombreCb] = function(r){ limpiar(); alLlegar(r); };
  var q = Object.keys(params).map(function(k){
    return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
  }).join('&');
  var s = document.createElement('script');
  s.src = URL_SCRIPT + (URL_SCRIPT.indexOf('?') < 0 ? '?' : '&') + q + '&callback=' + nombreCb;
  s.onerror = function(){ limpiar(); if (alFallar) alFallar('red'); };
  document.body.appendChild(s);
}

['codigo','nombre','grupo'].forEach(function(id){
  var v = localStorage.getItem('r_' + id);
  if (v && id !== 'codigo') $(id).value = v;
});

$('b-entrar').addEventListener('click', function(){
  codigo = $('codigo').value.trim().toUpperCase();
  nombre = $('nombre').value.trim();
  if (codigo.length !== 4){ $('aviso').textContent = 'El código son cuatro letras.'; return; }
  if (nombre.length < 4){ $('aviso').textContent = 'Escribe tu nombre completo.'; return; }
  $('aviso').textContent = 'Entrando…';
  $('b-entrar').disabled = true;

  llamar({accion:'entrar', codigo:codigo, nombre:nombre, grupo:$('grupo').value}, function(res){
    $('b-entrar').disabled = false;
    if (res.error){ $('aviso').textContent = res.error; return; }
    nombre = res.nombre;
    localStorage.setItem('r_nombre', nombre);
    localStorage.setItem('r_grupo', $('grupo').value);
    $('mi-nombre').textContent = nombre;
    if (res.jugadores){
      $('mi-lugar').textContent = 'Eres el jugador ' + res.jugadores + ' de la sala';
    }
    $('p-entrar').classList.add('oculto');
    $('p-jugar').classList.remove('oculto');
  }, function(motivo){
    $('b-entrar').disabled = false;
    $('aviso').textContent = motivo === 'tiempo'
      ? 'No hubo respuesta. Revisa tu internet.' : 'No se pudo conectar.';
  });
});

$('botonera').innerHTML = AREAS.map(function(a, i){
  return '<button class="area a' + i + '" data-i="' + i + '"></button>';
}).join('');
Array.prototype.forEach.call($('botonera').children, function(b, i){
  b.textContent = AREAS[i];
  b.addEventListener('click', function(){ responder(i); });
});

function decir(texto, clase){
  $('estado').textContent = texto;
  $('estado').className = 'estado ' + clase;
}

/* El servidor tarda varios segundos en confirmar, así que el botón se marca
   AL INSTANTE: el alumno ve que su toque contó sin quedarse mirando la
   pantalla. La confirmación llega después y corrige si hizo falta. Lo que
   vale es la hora en que el servidor la recibe, no cuándo confirma. */
function marcarElegida(i){
  Array.prototype.forEach.call($('botonera').children, function(b, k){
    b.style.outline = (k === i) ? '4px solid #C9A84C' : '';
    b.style.opacity = (k === i) ? '1' : '.45';
  });
}

function limpiarMarca(){
  Array.prototype.forEach.call($('botonera').children, function(b){
    b.style.outline = ''; b.style.opacity = '';
  });
}

var enviando = false;

function responder(i){
  if (enviando) return;
  enviando = true;
  marcarElegida(i);
  var t0 = Date.now();
  decir('Enviando tu respuesta…', 'esperando');
  var cuenta = setInterval(function(){
    decir('Enviando… ' + Math.round((Date.now() - t0) / 1000) + ' s', 'esperando');
  }, 1000);

  llamar({accion:'responder', codigo:codigo, nombre:nombre, opcion:i}, function(res){
    clearInterval(cuenta); enviando = false;
    if (res.error){ decir(res.error, 'malo'); limpiarMarca(); return; }
    if (res.ok){
      ultimaN = res.n;
      decir('Registrada · pregunta ' + (res.n + 1), 'ok');
      return;
    }
    if (res.motivo === 'repetida'){ decir('Ya contestaste esta pregunta', 'esperando'); }
    else if (res.motivo === 'tarde'){ decir('Se acabó el tiempo de esa pregunta', 'malo'); limpiarMarca(); }
    else { decir('Todavía no abre la pregunta. Mira la pantalla.', 'esperando'); limpiarMarca(); }
  }, function(){
    clearInterval(cuenta); enviando = false; limpiarMarca();
    decir('No se envió. Vuelve a tocar.', 'malo');
  });
}
</script>
</body>
</html>
"""


def main():
    sans = incrustar_fuente("source-sans-3-300-700-latin.woff2")
    comun = ESTILO_COMUN.replace("@@SANS@@", sans)
    banco = json.dumps(BANCO, ensure_ascii=False)
    areas = json.dumps(AREAS, ensure_ascii=False)

    tablero = (TABLERO
               .replace("@@COMUN@@", comun)
               .replace("@@BANCO@@", banco)
               .replace("@@AREAS@@", areas)
               .replace("@@SITIO@@", SITIO.replace("https://", ""))
               .replace("@@URL_SCRIPT@@", URL_SCRIPT)
               .replace("@@QR@@", qr(SITIO)))
    # La clave NUNCA se escribe en el archivo: se teclea en el tablero y se
    # queda solo en el navegador de esa computadora.
    campo_token = tablero.split('id="token"')[1].split(">")[0]
    assert "value=" not in campo_token, "el tablero traía la clave escrita"
    alumno = (ALUMNO
              .replace("@@COMUN@@", comun)
              .replace("@@AREAS@@", areas)
              .replace("@@URL_SCRIPT@@", URL_SCRIPT))
    assert "PEGA_AQUI" not in alumno, "la página del alumno se quedó sin dirección"

    for nombre, contenido in (("kahoot-tablero.html", tablero), ("kahoot.html", alumno)):
        ruta = os.path.join(AQUI, nombre)
        with io.open(ruta, "w", encoding="utf-8", newline="\n") as f:
            f.write(contenido)
        print("%-22s %5.0f KB" % (nombre, os.path.getsize(ruta) / 1024))

    por_ronda = {}
    for r, _, _, _ in BANCO:
        por_ronda[r] = por_ronda.get(r, 0) + 1
    print("banco: %d reactivos · %s" % (len(BANCO), por_ronda))
    reparto = {}
    for _, _, a, _ in BANCO:
        reparto[AREAS[a]] = reparto.get(AREAS[a], 0) + 1
    print("por área:", reparto)


if __name__ == "__main__":
    main()
