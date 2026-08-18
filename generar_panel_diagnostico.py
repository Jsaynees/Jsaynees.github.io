# -*- coding: utf-8 -*-
"""Genera el panel docente de los diagnósticos de Física.

Lee las hojas del Apps Script (las mismas que alimenta el examen) y muestra
distribución de puntajes, promedio por sección y los reactivos que más se
fallaron. Reutiliza los bancos de generar_diagnosticos.py para poder nombrar
cada reactivo.

    python generar_panel_diagnostico.py
"""
import io
import json
import os
import re

from generar_diagnosticos import FISICA1, FISICA3, banco

AQUI = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(AQUI, "panel-diagnostico.html")


def resumen(examen):
    """Lo mínimo para nombrar reactivos y secciones en el panel."""
    return {
        "materia": examen["materia"],
        "hoja": "Diagnóstico " + examen["materia"],
        "grupos": [g.strip() for g in examen["grupos"].split("·")],
        "secciones": examen["secciones"],
        "reactivos": [{"n": r["n"], "sec": r["sec"], "pts": r["pts"],
                       "texto": re.sub(r"<[^>]+>", "", r["texto"])[:96],
                       "resp": r["resp"], "unidad": r["unidad"]}
                      for r in banco(examen)],
    }


DATOS = json.dumps([resumen(FISICA1), resumen(FISICA3)], ensure_ascii=False)

HTML = r"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Panel del diagnóstico · Prof. López Saynes</title>
<link rel="icon" href="img/lab-icon-180.png">
<style>
:root{--navy:#1B3A6B;--navy2:#254d8f;--navyd:#112447;--gold:#C9A84C;--barra:#2f62b5;
      --ink:#1e293b;--muted:#64748b;--bg:#F8F9FC;--line:#dbe2ed;--ok:#1a7f4b;--no:#b91c1c;}
*{box-sizing:border-box}
body{margin:0;padding:16px;background:var(--bg);color:var(--ink);line-height:1.5;
     font-family:'Segoe UI',system-ui,Arial,sans-serif}
.wrap{max-width:1080px;margin:0 auto}
.hero{background:linear-gradient(135deg,var(--navyd),var(--navy2));color:#fff;border-radius:16px;padding:22px}
.hero .kick{color:var(--gold);font-size:12px;letter-spacing:2px;font-weight:800}
.hero h1{margin:6px 0 4px;font-size:25px}
.hero p{margin:0;color:#dbe6f7;font-size:14px}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px;margin-top:16px}
label{display:block;font-weight:700;color:var(--navy);margin:0 0 6px;font-size:14px}
input,select{width:100%;padding:10px 12px;border:2px solid var(--line);border-radius:10px;font-size:15px;
             font-family:inherit;background:#fff;color:var(--ink)}
input:focus,select:focus{outline:none;border-color:var(--gold)}
.fila{display:grid;grid-template-columns:1fr 220px 150px;gap:12px;align-items:end}
.filtros{display:flex;gap:12px;flex-wrap:wrap;align-items:end;margin-bottom:4px}
.filtros>div{min-width:170px}
.btn{cursor:pointer;border:0;border-radius:10px;padding:11px 18px;font-weight:800;font-size:15px;
     font-family:inherit;background:var(--navy);color:#fff}
.btn:hover{background:var(--navy2)}
.btn.ghost{background:#eef1f7;color:var(--navy)}
@media(max-width:760px){.fila{grid-template-columns:1fr}}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.tile{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.tile .n{font-size:32px;font-weight:800;color:var(--navy);line-height:1.1}
.tile .t{font-size:13px;color:var(--muted)}
h2{font-size:18px;color:var(--navy);margin:0 0 4px}
.sub{color:var(--muted);font-size:13px;margin:0 0 14px}
.barra{display:grid;grid-template-columns:230px 1fr 78px;gap:10px;align-items:center;margin:7px 0;font-size:14px}
.barra .pista{background:#eef1f7;border-radius:4px;height:20px;position:relative}
.barra .pista i{display:block;height:100%;background:var(--barra);border-radius:0 4px 4px 0}
.barra .pista i.alto{background:var(--gold)}
.barra .val{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink);font-weight:700}
.barra .et{color:var(--ink)}
.hist{display:flex;align-items:flex-end;gap:6px;height:190px;padding-top:10px}
.hist .col{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:5px}
.hist .col i{display:block;width:100%;background:var(--barra);border-radius:4px 4px 0 0;min-height:2px}
.hist .col i.alto{background:var(--gold)}
.hist .col span{font-size:11px;color:var(--muted);white-space:nowrap}
.hist .col b{font-size:12px;color:var(--ink)}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left}
th{background:#eef1f7;color:var(--navy);font-size:13px;position:sticky;top:0;cursor:pointer}
td.num{text-align:right;font-variant-numeric:tabular-nums}
.scroll{max-height:440px;overflow:auto;border:1px solid var(--line);border-radius:10px}
.aviso{padding:12px 14px;border-left:4px solid var(--gold);background:#fffdf5;border-radius:9px;
       color:#5b4a1e;font-size:14px;margin-top:12px}
.pie{margin:22px 0 8px;color:var(--muted);font-size:13px;text-align:center}
.pie a{color:var(--navy)}
.oculto{display:none}
</style>
</head>
<body data-palette="#2f62b5,#C9A84C">
<div class="wrap">

<div class="hero">
  <div class="kick">PANEL DOCENTE</div>
  <h1>Diagnóstico de inicio de curso</h1>
  <p>Lo que contestaron tus grupos en el examen diagnóstico, para decidir por dónde empezar.</p>
</div>

<div class="card" id="acceso">
  <div class="fila">
    <div>
      <label for="url">Dirección del Apps Script</label>
      <input type="text" id="url" placeholder="https://script.google.com/macros/s/.../exec">
    </div>
    <div>
      <label for="token">Clave de acceso docente</label>
      <input type="password" id="token" placeholder="Tu clave">
    </div>
    <div><button class="btn" id="cargar" style="width:100%">Cargar</button></div>
  </div>
  <div id="estado" class="sub" style="margin:10px 0 0"></div>
</div>

<div id="tablero" class="oculto">
  <div class="card">
    <div class="filtros">
      <div><label for="materia">Materia</label><select id="materia"></select></div>
      <div><label for="grupo">Grupo</label><select id="grupo"></select></div>
      <div style="align-self:end"><button class="btn ghost" id="csv">Descargar CSV</button></div>
    </div>
  </div>

  <div class="tiles" style="margin-top:16px" id="tiles"></div>

  <div class="card">
    <h2>Cómo se repartieron los puntajes</h2>
    <p class="sub" id="sub-hist"></p>
    <div class="hist" id="hist"></div>
  </div>

  <div class="card">
    <h2>Promedio por sección</h2>
    <p class="sub">Porcentaje del puntaje de cada sección. La barra dorada es la más baja: por ahí conviene empezar.</p>
    <div id="secciones"></div>
  </div>

  <div class="card">
    <h2>Los reactivos que más se fallaron</h2>
    <p class="sub">Porcentaje de alumnos que erró cada pregunta, de mayor a menor.</p>
    <div id="reactivos"></div>
  </div>

  <div class="card">
    <h2>Alumno por alumno</h2>
    <p class="sub">Toca un encabezado para ordenar.</p>
    <div class="scroll"><table id="tabla"></table></div>
  </div>
</div>

<p class="pie">Bachillerato UNAM–Descartes · <a href="index.html">Inicio</a></p>
</div>

<script>
const EXAMENES = __DATOS__;
const $ = id => document.getElementById(id);
let HOJAS = {}, filas = [], orden = { col: 3, desc: true };

$('url').value = localStorage.getItem('panel_url') || '';
$('token').value = sessionStorage.getItem('panel_token') || '';

/* El Apps Script responde por JSONP, igual que para el panel de inducción. */
function cargar(){
  const url = $('url').value.trim(), token = $('token').value.trim();
  if(!url || !token){ $('estado').textContent = 'Faltan la dirección o la clave.'; return; }
  localStorage.setItem('panel_url', url);
  sessionStorage.setItem('panel_token', token);
  $('estado').textContent = 'Consultando…';
  window.__panel = datos => {
    if(!datos || datos.error){ $('estado').textContent = 'La clave no fue aceptada.'; return; }
    HOJAS = datos;
    const hay = EXAMENES.filter(e => (datos[e.hoja] || []).length > 1);
    if(!hay.length){ $('estado').textContent = 'Todavía no hay diagnósticos entregados.'; return; }
    $('estado').textContent = '';
    $('acceso').classList.add('oculto');
    $('tablero').classList.remove('oculto');
    $('materia').innerHTML = hay.map(e => '<option value="' + e.materia + '">' + e.materia + '</option>').join('');
    pintar();
  };
  const s = document.createElement('script');
  s.src = url + (url.indexOf('?') < 0 ? '?' : '&') + 'token=' + encodeURIComponent(token) + '&callback=__panel';
  s.onerror = () => { $('estado').textContent = 'No se pudo contactar al Apps Script.'; };
  document.body.appendChild(s);
}

const examenActual = () => EXAMENES.find(e => e.materia === $('materia').value) || EXAMENES[0];

function leerFilas(){
  const ex = examenActual();
  const hoja = HOJAS[ex.hoja] || [];
  if(hoja.length < 2) return [];
  const enc = hoja[0];
  const iNombre = enc.indexOf('Nombre'), iGrupo = enc.indexOf('Grupo');
  const iPct = enc.indexOf('%'), iDet = enc.indexOf('Detalle JSON');
  const iMin = enc.indexOf('Minutos usados');
  return hoja.slice(1).map(f => {
    let detalle = [];
    try{ detalle = JSON.parse(f[iDet] || '[]'); }catch(e){}
    const secs = ex.secciones.map((nombre) => {
      const j = enc.indexOf(nombre);
      return j >= 0 ? Number(f[j]) || 0 : 0;
    });
    return { nombre: f[iNombre], grupo: String(f[iGrupo]), pct: Number(f[iPct]) || 0,
             minutos: Number(f[iMin]) || 0, secciones: secs, detalle: detalle };
  });
}

function pintar(){
  const ex = examenActual();
  const todas = leerFilas();
  const grupos = [...new Set(todas.map(f => f.grupo))].sort();
  const previo = $('grupo').value;
  $('grupo').innerHTML = '<option value="">Todos los grupos</option>' +
    grupos.map(g => '<option' + (g === previo ? ' selected' : '') + '>' + g + '</option>').join('');
  filas = $('grupo').value ? todas.filter(f => f.grupo === $('grupo').value) : todas;

  if(!filas.length){ $('tiles').innerHTML = '<div class="aviso">Sin entregas para ese filtro.</div>'; return; }

  const pcts = filas.map(f => f.pct).sort((a,b) => a-b);
  const prom = Math.round(pcts.reduce((a,b) => a+b, 0) / pcts.length);
  const mediana = pcts.length % 2 ? pcts[(pcts.length-1)/2]
                                  : Math.round((pcts[pcts.length/2-1] + pcts[pcts.length/2]) / 2);
  const minutos = Math.round(filas.reduce((a,f) => a + f.minutos, 0) / filas.length);
  $('tiles').innerHTML = [
    [filas.length, 'diagnósticos entregados'],
    [prom, 'promedio del grupo'],
    [mediana, 'mediana'],
    [pcts[0], 'el más bajo'],
    [pcts[pcts.length-1], 'el más alto'],
    [minutos + ' min', 'tiempo promedio'],
  ].map(t => '<div class="tile"><div class="n">' + t[0] + '</div><div class="t">' + t[1] + '</div></div>').join('');

  // distribución en tramos de 10
  const tramos = Array.from({length:10}, () => 0);
  pcts.forEach(p => { tramos[Math.min(9, Math.floor(p/10))]++; });
  const tope = Math.max.apply(null, tramos) || 1;
  $('sub-hist').textContent = 'Cada columna es un tramo de 10 puntos. ' +
    'La dorada es donde cayó más gente.';
  $('hist').innerHTML = tramos.map((c,i) => {
    const alto = c === tope && c > 0 ? ' alto' : '';
    return '<div class="col" title="' + c + ' alumno(s) entre ' + (i*10) + ' y ' + (i*10+9) + '">' +
      '<b>' + (c || '') + '</b>' +
      '<i class="' + alto.trim() + '" style="height:' + Math.round(c/tope*140) + 'px"></i>' +
      '<span>' + (i*10) + '–' + (i*10+9) + '</span></div>';
  }).join('');

  // promedio por sección
  const secProm = ex.secciones.map((nombre, i) => {
    const total = ex.reactivos.filter(r => r.sec === i).reduce((a,r) => a + r.pts, 0);
    const suma = filas.reduce((a,f) => a + (f.secciones[i] || 0), 0);
    return { nombre: nombre, pct: total ? Math.round(suma / filas.length / total * 100) : 0 };
  });
  const peor = Math.min.apply(null, secProm.map(s => s.pct));
  $('secciones').innerHTML = secProm.map(s =>
    '<div class="barra"><div class="et">' + s.nombre + '</div>' +
    '<div class="pista"><i class="' + (s.pct === peor ? 'alto' : '') + '" style="width:' + s.pct + '%"></i></div>' +
    '<div class="val">' + s.pct + '%</div></div>').join('');

  // reactivos con más error
  const err = ex.reactivos.map(r => {
    const malos = filas.filter(f => {
      const d = f.detalle.find(x => Number(x.n) === r.n);
      return d ? !d.bien : true;
    }).length;
    return { n: r.n, texto: r.texto, pct: Math.round(malos / filas.length * 100), resp: r.resp, unidad: r.unidad };
  }).sort((a,b) => b.pct - a.pct);
  const peorR = err.length ? err[0].pct : 0;
  $('reactivos').innerHTML = err.map(r =>
    '<div class="barra"><div class="et"><b>' + r.n + '.</b> ' + r.texto + '</div>' +
    '<div class="pista"><i class="' + (r.pct === peorR && r.pct > 0 ? 'alto' : '') + '" style="width:' + r.pct + '%"></i></div>' +
    '<div class="val">' + r.pct + '%</div></div>').join('');

  pintarTabla(ex);
}

function pintarTabla(ex){
  const enc = ['Alumno','Grupo','Min.','Puntaje'].concat(ex.secciones.map((s,i) => 'S' + (i+1)));
  const datos = filas.map(f => [f.nombre, f.grupo, f.minutos, f.pct].concat(f.secciones));
  datos.sort((a,b) => {
    const x = a[orden.col], y = b[orden.col];
    const c = (typeof x === 'number' && typeof y === 'number') ? x - y : String(x).localeCompare(String(y));
    return orden.desc ? -c : c;
  });
  $('tabla').innerHTML = '<thead><tr>' + enc.map((e,i) =>
      '<th data-col="' + i + '" title="' + (i > 3 ? ex.secciones[i-4] : e) + '">' + e + '</th>').join('') +
    '</tr></thead><tbody>' + datos.map(f => '<tr>' + f.map((c,i) =>
      '<td class="' + (i >= 2 ? 'num' : '') + '">' + c + '</td>').join('') + '</tr>').join('') + '</tbody>';
  [...$('tabla').querySelectorAll('th')].forEach(th => th.onclick = () => {
    const col = Number(th.dataset.col);
    orden = { col: col, desc: orden.col === col ? !orden.desc : true };
    pintarTabla(ex);
  });
}

$('csv').onclick = () => {
  const ex = examenActual();
  const enc = ['Alumno','Grupo','Minutos','Puntaje'].concat(ex.secciones);
  const lineas = [enc].concat(filas.map(f => [f.nombre, f.grupo, f.minutos, f.pct].concat(f.secciones)));
  const csv = lineas.map(l => l.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], {type:'text/csv;charset=utf-8'}));
  a.download = 'diagnostico-' + ex.materia.replace(/\s+/g,'-').toLowerCase() + '.csv';
  a.click();
};

$('cargar').onclick = cargar;
$('materia').onchange = pintar;
$('grupo').onchange = pintar;
if($('url').value && $('token').value) cargar();
</script>
</body>
</html>
"""

io.open(SALIDA, "w", encoding="utf-8").write(HTML.replace("__DATOS__", DATOS))
print("panel-diagnostico.html · %d KB · %d materias"
      % (os.path.getsize(SALIDA) / 1024, len(json.loads(DATOS))))
