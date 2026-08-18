# -*- coding: utf-8 -*-
"""Genera las páginas de examen diagnóstico de Física I y Física III.

Mismo patrón que el diagnóstico del curso de inducción: se califica en el
navegador y el resultado se le muestra al alumno. El examen NO cuenta para
calificación, así que las respuestas viven en el propio archivo.

    python generar_diagnosticos.py
"""
import io
import json
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
MINUTOS = 40

# ── Bancos de reactivos ──────────────────────────────────────────────────────
# tipo: 'num' compara número con tolerancia · 'sci' acepta notación científica
FISICA1 = {
    "archivo": "diagnostico-fisica1.html",
    "materia": "Física I",
    "clave": "fisica1",
    "semestre": "Tercer semestre",
    "grupos": "3010 · 3040 · 3050 · 3080",
    "intro": ("Este examen no cuenta para tu calificación. Sirve para saber con qué "
              "herramientas llegas al curso, y para que tú mismo veas qué necesitas "
              "repasar. Contesta con calma y sin buscar en internet: si sale honesto, "
              "te sirve."),
    "secciones": [
        "Operaciones y despeje", "Unidades y conversiones",
        "Notación científica y cifras significativas",
        "Proporcionalidad y lectura de gráficas",
        "Geometría y trigonometría", "Nociones previas de movimiento",
    ],
    "reactivos": [
        (0, 8, "Resuelve: −6 + 4(−2) − (−5) =", "num", -9, "", ""),
        (0, 8, "De la expresión <em>d</em> = <em>v·t</em>, despeja <em>t</em> y calcula su valor si "
               "<em>d</em> = 240 m y <em>v</em> = 30 m/s.", "num", 8, "s", "Escribe solo el número."),
        (1, 8, "Convierte 72 km/h a metros por segundo.", "num", 20, "m/s", ""),
        (1, 8, "Una mesa mide 0.75 m de alto. ¿Cuántos milímetros son?", "num", 750, "mm", ""),
        (2, 8, "Escribe en notación científica: 0.00058", "sci", 0.00058, "",
               "Puedes escribirlo como 5.8e-4 o 5.8x10^-4."),
        (2, 8, "¿Cuántas cifras significativas tiene la medición 0.03400 m?", "num", 4, "", ""),
        (3, 8, "Si 3 kg de fruta cuestan $54, ¿cuánto cuestan 7 kg?", "num", 126, "pesos", ""),
        (3, 8, "En una gráfica de posición contra tiempo, un móvil pasa de 4 m a 20 m entre "
               "<em>t</em> = 2 s y <em>t</em> = 6 s. ¿Cuánto vale la pendiente?", "num", 4, "m/s", ""),
        (4, 8, "Un rectángulo mide 12 cm de ancho por 0.5 m de largo. ¿Cuál es su área en cm²?",
               "num", 600, "cm²", "Cuidado: las dos medidas no están en la misma unidad."),
        (4, 8, "En un triángulo rectángulo, el cateto opuesto al ángulo θ mide 3 y la hipotenusa 5. "
               "¿Cuánto vale sen θ?", "num", 0.6, "", ""),
        (5, 5, "Un auto recorre 150 m en 10 s. ¿Cuál es su rapidez media?", "num", 15, "m/s", ""),
        (5, 5, "¿Cuál es el valor aproximado de la aceleración de la gravedad en la Tierra?",
               "num", 9.8, "m/s²", ""),
        (5, 5, "Un cuerpo cae libremente desde el reposo. ¿Qué rapidez lleva a los 3 s? "
               "Usa <em>g</em> = 9.8 m/s².", "num", 29.4, "m/s", ""),
        (5, 5, "Un cuerpo se mueve en línea recta con velocidad constante. ¿Cuánto vale la fuerza "
               "neta sobre él?", "num", 0, "N", ""),
    ],
}

FISICA3 = {
    "archivo": "diagnostico-fisica3.html",
    "materia": "Física III",
    "clave": "fisica3",
    "semestre": "Quinto semestre",
    "grupos": "5010 · 5060",
    "intro": ("Este examen no cuenta para tu calificación. Revisa lo que traes de Física I y II "
              "y que vas a necesitar en las cuatro prácticas de este semestre: torca y equilibrio, "
              "cuerpos en rotación, densidad y presión, y el principio de Arquímedes."),
    "secciones": [
        "Vectores y trigonometría", "Leyes de Newton", "Cinemática",
        "Trabajo y energía", "Densidad y presión",
        "Nociones previas de rotación y fluidos",
    ],
    "reactivos": [
        (0, 8, "Una fuerza de 50 N forma 37° con la horizontal. ¿Cuánto vale su componente "
               "horizontal? Usa cos 37° = 0.8.", "num", 40, "N", ""),
        (0, 8, "De la misma fuerza, ¿cuánto vale su componente vertical? Usa sen 37° = 0.6.",
               "num", 30, "N", ""),
        (1, 8, "Sobre un bloque de 8 kg, apoyado en una superficie horizontal sin fricción, actúa "
               "una fuerza de 24 N. ¿Cuál es su aceleración?", "num", 3, "m/s²", ""),
        (1, 8, "Una masa de 5 kg cuelga en reposo de una cuerda. ¿Cuál es la tensión de la cuerda? "
               "Usa <em>g</em> = 9.8 m/s².", "num", 49, "N", ""),
        (2, 8, "Un auto pasa de 0 a 25 m/s en 5 s. ¿Cuál es su aceleración?", "num", 5, "m/s²", ""),
        (2, 8, "Un móvil parte del reposo con aceleración constante de 2 m/s². ¿Qué distancia "
               "recorre en 4 s?", "num", 16, "m", ""),
        (3, 8, "Una fuerza de 30 N desplaza un cuerpo 4 m en su misma dirección. ¿Cuánto trabajo "
               "realiza?", "num", 120, "J", ""),
        (3, 8, "¿Cuál es la energía cinética de un cuerpo de 2 kg que se mueve a 6 m/s?",
               "num", 36, "J", ""),
        (4, 8, "Un objeto tiene 400 g de masa y ocupa 500 cm³. ¿Cuál es su densidad?",
               "num", 0.8, "g/cm³", ""),
        (4, 8, "Una fuerza de 200 N se distribuye sobre una superficie de 0.5 m². ¿Cuál es la "
               "presión?", "num", 400, "Pa", ""),
        (5, 5, "Se aplica una fuerza de 20 N perpendicular a una llave, a 0.3 m del eje del "
               "tornillo. ¿Cuánto vale la torca?", "num", 6, "N·m", ""),
        (5, 5, "¿Cuál es la densidad del agua?", "num", 1000, "kg/m³", ""),
        (5, 5, "Un cuerpo de 15 N de peso flota en equilibrio en agua. ¿Cuánto vale el empuje que "
               "recibe?", "num", 15, "N", ""),
        (5, 5, "¿A qué distancia del eje hay que aplicar una fuerza de 10 N, perpendicular, para "
               "producir una torca de 4 N·m?", "num", 0.4, "m", ""),
    ],
}


def banco(examen):
    salida = []
    for i, (sec, pts, texto, tipo, resp, unidad, ayuda) in enumerate(examen["reactivos"], 1):
        salida.append({"n": i, "sec": sec, "pts": pts, "texto": texto, "tipo": tipo,
                       "resp": resp, "unidad": unidad, "ayuda": ayuda})
    return salida


PLANTILLA = """<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Examen diagnóstico · @@MATERIA@@ · Prof. López Saynes</title>
<link rel="icon" href="img/lab-icon-180.png">
<style>
:root{--navy:#1B3A6B;--navy2:#254d8f;--navyd:#112447;--gold:#C9A84C;--ink:#1e293b;
      --muted:#64748b;--bg:#F8F9FC;--line:#dbe2ed;--ok:#1a7f4b;--no:#b91c1c;}
*{box-sizing:border-box}
body{margin:0;padding:16px;font-family:'Segoe UI',system-ui,Arial,sans-serif;color:var(--ink);
     background:var(--bg);line-height:1.5}
.wrap{max-width:820px;margin:0 auto}
.hero{background:linear-gradient(135deg,var(--navyd),var(--navy2));color:#fff;border-radius:16px;
      padding:24px;box-shadow:0 6px 18px rgba(27,58,107,.28)}
.hero .kick{color:var(--gold);font-size:12px;letter-spacing:2px;font-weight:800}
.hero h1{margin:6px 0 8px;font-size:26px}
.hero p{margin:0;color:#dbe6f7;font-size:15px}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px;margin-top:16px}
label{display:block;font-weight:700;color:var(--navy);margin:0 0 6px;font-size:15px}
input,select{width:100%;padding:11px 13px;border:2px solid var(--line);border-radius:10px;
             background:#fff;color:var(--ink);font-size:16px;font-family:inherit}
input:focus,select:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(201,168,76,.16)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:620px){.grid2{grid-template-columns:1fr}}
.btn{cursor:pointer;font-family:inherit;font-weight:800;font-size:16px;border:0;border-radius:10px;
     padding:13px 22px;background:var(--navy);color:#fff}
.btn:hover{background:var(--navy2)}
.btn.gold{background:var(--gold);color:var(--navyd)}
.btn:disabled{opacity:.5;cursor:not-allowed}
.bar{position:sticky;top:0;z-index:9;display:flex;justify-content:space-between;align-items:center;
     gap:12px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px 16px;
     margin-top:16px}
.timer{min-width:96px;padding:8px 12px;border-radius:9px;background:var(--navy);color:#fff;
       text-align:center;font-size:19px;font-weight:800;font-variant-numeric:tabular-nums}
.timer.warn{background:#a76500}.timer.danger{background:var(--no)}
.sec{margin-top:18px;padding:11px 16px;background:var(--navy);color:#fff;border-radius:10px;
     font-weight:700;display:flex;justify-content:space-between;gap:10px;font-size:15px}
.q{background:#fff;border:1px solid var(--line);border-top:0;padding:15px 16px}
.q:first-of-type{border-top:1px solid var(--line)}
.q .num{display:inline-block;min-width:26px;font-weight:800;color:var(--navy)}
.q .ayuda{color:var(--muted);font-size:13px;margin-top:6px}
.q .fila{display:flex;gap:10px;align-items:center;margin-top:10px}
.q .fila input{max-width:230px}
.q .uni{color:var(--muted);font-size:14px}
.res{margin-top:6px;font-size:14px;font-weight:700}
.res.ok{color:var(--ok)}.res.no{color:var(--no)}
.total{font-size:44px;font-weight:800;color:var(--navy);line-height:1}
.blockrow{display:grid;grid-template-columns:1fr 140px 54px;gap:10px;align-items:center;
          margin:9px 0;font-size:14px}
.blockrow .track{background:#eef1f7;border-radius:999px;height:10px;overflow:hidden}
.blockrow .track i{display:block;height:100%;background:var(--navy)}
.aviso{margin-top:14px;padding:12px 14px;border-left:4px solid var(--gold);border-radius:9px;
       background:#fffdf5;color:#5b4a1e;font-size:14px}
.pie{margin:22px 0 8px;color:var(--muted);font-size:13px;text-align:center}
.pie a{color:var(--navy)}
</style>
</head>
<body>
<div class="wrap">

<div class="hero">
  <div class="kick">EXAMEN DIAGNÓSTICO</div>
  <h1>@@MATERIA@@ · @@SEMESTRE@@</h1>
  <p>@@INTRO@@</p>
</div>

<div class="card" id="ficha">
  <label for="nombre">Tu nombre completo</label>
  <input type="text" id="nombre" placeholder="Apellido paterno, apellido materno y nombre(s)" autocomplete="name">
  <div class="grid2" style="margin-top:12px">
    <div>
      <label for="grupo">Grupo</label>
      <select id="grupo"></select>
    </div>
    <div style="display:flex;align-items:flex-end">
      <button class="btn gold" id="empezar" style="width:100%">Empezar los @@MINUTOS@@ minutos</button>
    </div>
  </div>
  <div class="aviso">
    <strong>No cuenta para tu calificación.</strong> Tienes @@MINUTOS@@ minutos y una sola vuelta:
    al terminar verás tu resultado y cuáles fallaste, con la respuesta correcta.
  </div>
</div>

<div id="examen" hidden>
  <div class="bar">
    <div><strong id="quien"></strong><br><span class="uni" id="avance">0 de @@TOTAL@@ contestadas</span></div>
    <div class="timer" id="timer">@@MINUTOS@@:00</div>
  </div>
  <div id="preguntas"></div>
  <div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap">
    <button class="btn" id="entregar">Entregar y ver mi resultado</button>
  </div>
</div>

<div id="resultado" hidden></div>

<p class="pie">Bachillerato UNAM–Descartes · <a href="@@VOLVER@@">Volver a @@MATERIA@@</a></p>
</div>

<script>
const BANCO = @@BANCO@@;
const SECCIONES = @@SECCIONES@@;
const MATERIA = @@MATERIA_JS@@;
const GRUPOS = @@GRUPOS_JS@@;
const MINUTOS = @@MINUTOS@@;
const CLAVE = 'diagnostico.@@CLAVE@@';

const $ = id => document.getElementById(id);
const sel = $('grupo');
GRUPOS.forEach(g => { const o = document.createElement('option'); o.value = g; o.textContent = g; sel.appendChild(o); });

/* Una respuesta se da por buena si cae dentro del 1 % del valor esperado.
   Así "0.6" y "0.60" valen igual, y 9.8 admite 9.81. */
function normaliza(txt){
  if(txt == null) return NaN;
  let s = String(txt).trim().toLowerCase().replace(/\\s+/g,'').replace(/,/g,'');
  s = s.replace(/\\$/g,'').replace(/x10\\^?/,'e').replace(/×10\\^?/,'e').replace(/\\*10\\^?/,'e');
  s = s.replace(/e\\+/,'e');
  return parseFloat(s);
}
function esCorrecta(r, valor){
  const v = normaliza(valor);
  if(isNaN(v)) return false;
  const esperado = r.resp;
  if(esperado === 0) return Math.abs(v) < 1e-9;
  return Math.abs(v - esperado) <= Math.abs(esperado) * 0.01;
}

let estado = { inicio: 0, entregado: false, respuestas: {} };

function pintarPreguntas(){
  let html = '', secActual = -1;
  BANCO.forEach(r => {
    if(r.sec !== secActual){
      secActual = r.sec;
      const pts = BANCO.filter(x => x.sec === secActual).reduce((a,b) => a + b.pts, 0);
      html += '<div class="sec"><span>' + (secActual+1) + '. ' + SECCIONES[secActual] +
              '</span><span>' + pts + ' puntos</span></div>';
    }
    html += '<div class="q"><span class="num">' + r.n + '.</span> ' + r.texto +
            (r.ayuda ? '<div class="ayuda">' + r.ayuda + '</div>' : '') +
            '<div class="fila"><input type="text" inputmode="decimal" id="r' + r.n +
            '" autocomplete="off">' + (r.unidad ? '<span class="uni">' + r.unidad + '</span>' : '') +
            '</div></div>';
  });
  $('preguntas').innerHTML = html;
  BANCO.forEach(r => {
    const campo = $('r' + r.n);
    campo.value = estado.respuestas[r.n] || '';
    campo.addEventListener('input', () => {
      estado.respuestas[r.n] = campo.value;
      guardar();
      $('avance').textContent = Object.values(estado.respuestas).filter(v => String(v).trim()).length +
                                ' de ' + BANCO.length + ' contestadas';
    });
  });
}

function guardar(){
  try{ localStorage.setItem(CLAVE, JSON.stringify(estado)); }catch(e){}
}

function tick(){
  const restante = estado.inicio + MINUTOS*60000 - Date.now();
  const t = $('timer');
  if(restante <= 0){ t.textContent = '00:00'; entregar(true); return; }
  const m = Math.floor(restante/60000), s = Math.floor(restante%60000/1000);
  t.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
  t.classList.toggle('warn', restante <= 10*60000 && restante > 5*60000);
  t.classList.toggle('danger', restante <= 5*60000);
}

let reloj = 0;
function empezar(){
  const nombre = $('nombre').value.trim();
  if(nombre.length < 5){ alert('Escribe tu nombre completo para empezar.'); return; }
  estado.nombre = nombre; estado.grupo = sel.value; estado.inicio = Date.now();
  guardar();
  $('ficha').hidden = true; $('examen').hidden = false;
  $('quien').textContent = nombre + ' · ' + sel.value;
  pintarPreguntas();
  tick(); reloj = setInterval(tick, 1000);
}

function entregar(porTiempo){
  if(estado.entregado) return;
  if(!porTiempo){
    const faltan = BANCO.length - Object.values(estado.respuestas).filter(v => String(v).trim()).length;
    const aviso = faltan ? 'Te faltan ' + faltan + ' por contestar. ' : '';
    if(!confirm(aviso + '¿Entregar el examen?')) return;
  }
  estado.entregado = true; clearInterval(reloj); guardar();

  let puntos = 0, total = 0;
  const porSeccion = SECCIONES.map(() => ({ ok: 0, total: 0 }));
  const detalle = BANCO.map(r => {
    const valor = estado.respuestas[r.n] || '';
    const bien = esCorrecta(r, valor);
    puntos += bien ? r.pts : 0; total += r.pts;
    porSeccion[r.sec].total += r.pts;
    if(bien) porSeccion[r.sec].ok += r.pts;
    return { n: r.n, bien: bien, dio: valor, esperado: r.resp, unidad: r.unidad };
  });
  const pct = Math.round(puntos / total * 100);

  let html = '<div class="card"><div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">' +
    '<div><div class="total">' + pct + '</div><div class="uni">de 100 puntos</div></div>' +
    '<div style="flex:1;min-width:240px">' +
    porSeccion.map((b,i) => {
      const p = b.total ? Math.round(b.ok/b.total*100) : 0;
      return '<div class="blockrow"><div>' + SECCIONES[i] + '</div>' +
             '<div class="track"><i style="width:' + p + '%"></i></div>' +
             '<div style="text-align:right">' + b.ok + '/' + b.total + '</div></div>';
    }).join('') + '</div></div>' +
    '<div class="aviso" style="margin-top:16px">Este resultado <strong>no afecta tu calificación</strong>. ' +
    'Úsalo para saber qué repasar: las secciones con la barra corta son las que te conviene reforzar.</div>' +
    '</div><div class="card"><h3 style="margin-top:0;color:var(--navy)">Respuesta por respuesta</h3>';

  detalle.forEach(d => {
    const r = BANCO.find(x => x.n === d.n);
    html += '<div class="q" style="border-radius:10px;margin-bottom:8px;border-top:1px solid var(--line)">' +
      '<span class="num">' + d.n + '.</span> ' + r.texto +
      '<div class="res ' + (d.bien ? 'ok' : 'no') + '">' +
      (d.bien ? '✓ Correcta' : '✗ Tu respuesta: ' + (String(d.dio).trim() || '(en blanco)') +
                ' · correcta: ' + d.esperado + ' ' + (d.unidad || '')) + '</div></div>';
  });
  html += '</div>';

  $('examen').hidden = true;
  $('resultado').hidden = false;
  $('resultado').innerHTML = html;
  window.scrollTo(0,0);
}

$('empezar').onclick = empezar;
$('entregar').onclick = () => entregar(false);

/* Si cerró la pestaña a media prueba, se recupera donde iba. */
try{
  const previo = JSON.parse(localStorage.getItem(CLAVE) || 'null');
  if(previo && previo.inicio && !previo.entregado &&
     Date.now() - previo.inicio < MINUTOS*60000){
    estado = previo;
    $('nombre').value = estado.nombre || '';
    if(estado.grupo) sel.value = estado.grupo;
    $('ficha').hidden = true; $('examen').hidden = false;
    $('quien').textContent = (estado.nombre||'') + ' · ' + (estado.grupo||'');
    pintarPreguntas(); tick(); reloj = setInterval(tick, 1000);
  }
}catch(e){}
</script>
</body>
</html>
"""


def genera(examen):
    datos = banco(examen)
    valores = {
        "MATERIA": examen["materia"],
        "SEMESTRE": examen["semestre"],
        "INTRO": examen["intro"],
        "MINUTOS": str(MINUTOS),
        "TOTAL": str(len(datos)),
        "CLAVE": examen["clave"],
        "VOLVER": examen["clave"] + ".html",
        "BANCO": json.dumps(datos, ensure_ascii=False),
        "SECCIONES": json.dumps(examen["secciones"], ensure_ascii=False),
        "MATERIA_JS": json.dumps(examen["materia"], ensure_ascii=False),
        "GRUPOS_JS": json.dumps([g.strip() for g in examen["grupos"].split("·")],
                                ensure_ascii=False),
    }
    html = PLANTILLA
    for clave, valor in valores.items():
        html = html.replace("@@" + clave + "@@", valor)
    sobran = re.findall(r"@@\w+@@", html)
    assert not sobran, "marcadores sin sustituir: %s" % set(sobran)

    ruta = os.path.join(AQUI, examen["archivo"])
    io.open(ruta, "w", encoding="utf-8").write(html)
    puntos = sum(r["pts"] for r in datos)
    assert puntos == 100, "los puntos deben sumar 100, suman %d" % puntos
    print("%-28s %2d reactivos · %3d puntos · %d KB"
          % (examen["archivo"], len(datos), puntos, len(html) / 1024))


for examen in (FISICA1, FISICA3):
    genera(examen)
