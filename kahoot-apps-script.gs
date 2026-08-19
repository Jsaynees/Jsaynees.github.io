/***********************************************************************
 * TABLERO EN VIVO — «¿De qué física es esto?»
 * M.C. José Luis López Saynes · Bachillerato UNAM-Descartes
 *
 * Va en un proyecto de Apps Script APARTE del de inducción, con su propia
 * hoja de cálculo y su propio despliegue. Se hizo así a propósito: el
 * proyecto de inducción ya funciona y este no debe poder romperlo.
 *
 * CÓMO SE INSTALA (una sola vez)
 *   1. Crea una hoja de cálculo nueva en Drive. Llámala como quieras.
 *   2. Extensiones → Apps Script. Borra lo que traiga y pega este archivo.
 *   3. Cambia TOKEN por una clave tuya. No la publiques en GitHub.
 *   4. Implementar → Nueva implementación → Aplicación web.
 *      Ejecutar como: yo.  Quién tiene acceso: cualquier persona.
 *   5. Copia la dirección /exec: esa va en el tablero.
 *
 * POR QUÉ NO SE ESCRIBE EN LA HOJA DURANTE EL JUEGO
 *   Escribir en una hoja exige un bloqueo, y los bloqueos se hacen fila. Con
 *   veintiún alumnos respondiendo dentro de la misma ventana de quince
 *   segundos, el último esperaría medio minuto y creería que su respuesta no
 *   contó. Por eso cada respuesta va a CacheService bajo su propia llave
 *   —sin bloqueo, sin fila, milisegundos— y a la hoja se escribe UNA sola vez
 *   al final de la partida, con todo el resultado junto.
 ***********************************************************************/

const TOKEN = 'CAMBIA_ESTO_POR_TU_CLAVE';

// Duración de la caché. Una partida dura minutos; media hora sobra y evita
// que un tablero olvidado deje basura viva toda la tarde.
const VIDA_CACHE = 1800;
const LETRAS_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ';  // sin I ni O: se confunden

function doGet(e){
  const p  = (e && e.parameter) || {};
  const cb = p.callback || null;
  try{
    const accion = String(p.accion || '');

    // ── Rutas del alumno: NO llevan token ────────────────────────────────
    // El alumno no tiene por qué conocer la clave del docente. Lo que lo
    // autoriza es el código de sala, que solo se ve proyectado en el salón.
    if (accion === 'entrar')    return responder_(entrar_(p), cb);
    if (accion === 'responder') return responder_(registrarRespuesta_(p), cb);

    // ── Rutas del docente ────────────────────────────────────────────────
    if (p.token !== TOKEN) return responder_({error:'token'}, cb);
    if (accion === 'abrir')     return responder_(abrirSala_(p), cb);
    if (accion === 'pregunta')  return responder_(abrirPregunta_(p), cb);
    if (accion === 'estado')    return responder_(estado_(p), cb);
    if (accion === 'guardar')   return responder_(guardar_(p), cb);
    if (accion === 'ping')      return responder_({ok:true, ahora:Date.now()}, cb);

    return responder_({error:'accion', accion:accion}, cb);
  }catch(err){
    console.error('FALLO: ' + err);
    return responder_({error:String(err)}, cb);
  }
}

/* ── Sala ──────────────────────────────────────────────────────────────── */

function abrirSala_(p){
  const grupo = validarGrupo_(p.grupo);
  let codigo = '';
  for (let i = 0; i < 4; i++){
    codigo += LETRAS_CODIGO.charAt(Math.floor(Math.random() * LETRAS_CODIGO.length));
  }
  cache_().put(llaveSala_(codigo), JSON.stringify({
    grupo: grupo, n: -1, abierta: 0, limite: 15000, creada: Date.now()
  }), VIDA_CACHE);
  cache_().put(llaveLista_(codigo), JSON.stringify([]), VIDA_CACHE);
  return {ok:true, codigo:codigo, grupo:grupo, ahora:Date.now()};
}

function abrirPregunta_(p){
  const codigo = validarCodigo_(p.codigo);
  const sala = leerSala_(codigo);
  sala.n = parseInt(p.n, 10);
  sala.limite = Math.max(3000, Math.min(120000, parseInt(p.limite, 10) || 15000));
  sala.abierta = Date.now();
  cache_().put(llaveSala_(codigo), JSON.stringify(sala), VIDA_CACHE);
  return {ok:true, n:sala.n, abierta:sala.abierta, limite:sala.limite};
}

/* ── Alumno ────────────────────────────────────────────────────────────── */

function entrar_(p){
  const codigo = validarCodigo_(p.codigo);
  const nombre = tituloNombre_(p.nombre);
  if (!nombre) throw new Error('Escribe tu nombre.');
  leerSala_(codigo);   // revienta si la sala no existe o ya expiró

  // La lista de jugadores sí necesita bloqueo, pero se toca una vez por
  // alumno y al principio, no en medio de la cuenta regresiva.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try{
    const lista = leerLista_(codigo);
    const yaEsta = lista.some(function(x){ return normalizar_(x) === normalizar_(nombre); });
    if (!yaEsta){
      if (lista.length >= 60) throw new Error('La sala está llena.');
      lista.push(nombre);
      cache_().put(llaveLista_(codigo), JSON.stringify(lista), VIDA_CACHE);
    }
    return {ok:true, nombre:nombre, jugadores:lista.length, reingreso:yaEsta};
  }finally{
    try{ lock.releaseLock(); }catch(err){ console.error(err); }
  }
}

function registrarRespuesta_(p){
  const codigo = validarCodigo_(p.codigo);
  const nombre = tituloNombre_(p.nombre);
  const opcion = parseInt(p.opcion, 10);
  const sala = leerSala_(codigo);

  if (sala.n < 0) return {ok:false, motivo:'cerrada'};
  const ahora = Date.now();
  if (ahora - sala.abierta > sala.limite + 1500) return {ok:false, motivo:'tarde', n:sala.n};

  // Cada respuesta en SU PROPIA llave: sin bloqueo y sin pelearse con nadie.
  const llave = llaveResp_(codigo, sala.n, nombre);
  if (cache_().get(llave)) return {ok:false, motivo:'repetida', n:sala.n};
  cache_().put(llave, JSON.stringify({o:opcion, t:ahora - sala.abierta}), VIDA_CACHE);
  return {ok:true, n:sala.n};
}

/* ── Tablero ───────────────────────────────────────────────────────────── */

function estado_(p){
  const codigo = validarCodigo_(p.codigo);
  const sala = leerSala_(codigo);
  const lista = leerLista_(codigo);
  const n = p.n === undefined ? sala.n : parseInt(p.n, 10);

  const llaves = lista.map(function(nom){ return llaveResp_(codigo, n, nom); });
  const crudo = llaves.length ? cache_().getAll(llaves) : {};
  const respuestas = {};
  lista.forEach(function(nom){
    const v = crudo[llaveResp_(codigo, n, nom)];
    if (v) respuestas[nom] = JSON.parse(v);
  });
  return {ok:true, n:n, abierta:sala.abierta, limite:sala.limite,
          jugadores:lista, respuestas:respuestas, ahora:Date.now()};
}

/**
 * Escribe la partida completa en la hoja, de un solo golpe. El tablero manda
 * la tabla ya cuadrada; aquí no se recalcula nada, solo se guarda.
 */
function guardar_(p){
  const filas = JSON.parse(p.filas || '[]');
  if (!filas.length) return {ok:true, guardadas:0};

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = getSheet_(ss, 'Partidas', [
    'Fecha','Código','Grupo','Alumno','Aciertos','Contestadas','Puntos','Detalle'
  ]);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try{
    const sello = new Date();
    const bloque = filas.map(function(f){
      return [sello, texto_(p.codigo), texto_(p.grupo), tituloNombre_(f.nombre),
              Number(f.aciertos) || 0, Number(f.contestadas) || 0,
              Number(f.puntos) || 0, texto_(f.detalle)];
    });
    sh.getRange(sh.getLastRow() + 1, 1, bloque.length, 8).setValues(bloque);
    return {ok:true, guardadas:bloque.length};
  }finally{
    try{ lock.releaseLock(); }catch(err){ console.error(err); }
  }
}

/* ── Utilidades ────────────────────────────────────────────────────────── */

function cache_(){ return CacheService.getScriptCache(); }
function llaveSala_(c){ return 's|' + c; }
function llaveLista_(c){ return 'l|' + c; }
function llaveResp_(c, n, nombre){ return 'r|' + c + '|' + n + '|' + normalizar_(nombre); }

function leerSala_(codigo){
  const crudo = cache_().get(llaveSala_(codigo));
  if (!crudo) throw new Error('Esa sala no existe o ya se cerró.');
  return JSON.parse(crudo);
}

function leerLista_(codigo){
  const crudo = cache_().get(llaveLista_(codigo));
  return crudo ? JSON.parse(crudo) : [];
}

function validarCodigo_(codigo){
  const c = texto_(codigo).toUpperCase();
  if (!/^[A-Z]{4}$/.test(c)) throw new Error('Código de sala no válido.');
  return c;
}

function validarGrupo_(grupo){
  const g = texto_(grupo);
  if (/^[1-6]0\d{2}$/.test(g)) return g;
  throw new Error('Grupo no válido: ' + g);
}

function normalizar_(valor){
  return texto_(valor).toUpperCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');
}

const PARTICULAS_ = ['de','del','la','las','los','y','da','di','van','von','mac','el'];

function tituloNombre_(valor){
  const limpio = texto_(valor).replace(/\s+/g, ' ');
  if (!limpio) return '';
  return limpio.toLocaleLowerCase('es-MX').split(' ').map(function(palabra, i){
    if (i > 0 && PARTICULAS_.indexOf(palabra) >= 0) return palabra;
    return palabra.charAt(0).toLocaleUpperCase('es-MX') + palabra.slice(1);
  }).join(' ');
}

function getSheet_(ss, nombre, encabezados){
  let sh = ss.getSheetByName(nombre);
  if (!sh) sh = ss.insertSheet(nombre);
  if (sh.getLastRow() === 0){
    sh.appendRow(encabezados);
    sh.setFrozenRows(1);
  }
  return sh;
}

function texto_(valor){
  return String(valor === undefined || valor === null ? '' : valor).trim();
}

function responder_(obj, cb){
  const callback = cb && /^[A-Za-z_$][\w$\.]*$/.test(cb) ? cb : null;
  const txt = callback ? callback + '(' + JSON.stringify(obj) + ');' : JSON.stringify(obj);
  return ContentService.createTextOutput(txt).setMimeType(
    callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON
  );
}
