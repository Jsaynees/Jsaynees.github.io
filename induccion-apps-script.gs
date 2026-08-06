/***********************************************************************
 * CURSO DE INDUCCIÓN — Registro de diagnóstico, encuesta y examen final
 * M.C. José Luis López Saynes · Bachillerato UNAM-Descartes
 * v4 — calificación privada, entrega automática, deduplicación y respaldo
 *
 * IMPORTANTE: conserva los valores privados de TOKEN y CORREO que ya usas
 * en el proyecto desplegado. No publiques esos valores en GitHub.
 ***********************************************************************/

const TOKEN  = 'CONSERVA_AQUI_TU_TOKEN_ACTUAL';
const CORREO = 'CONSERVA_AQUI_TU_CORREO_DE_RESPALDO';

// La clave correcta NO se publica en GitHub. Se guarda como propiedad privada
// del proyecto con el nombre FINAL_ANSWER_KEY. Consulta el instructivo privado
// que acompaña esta versión para configurarla una sola vez.
const FINAL_VERSION = 'induccion-final-2026-v1';
const FINAL_TOTALES_BLOQUE = [16,16,16,16,16,20];
const FINAL_REACTIVOS = [
  {id:'i1',   bloque:0, puntos:8, tipo:'number'},
  {id:'i2',   bloque:0, puntos:8, tipo:'number'},
  {id:'ii1',  bloque:1, puntos:8, tipo:'number'},
  {id:'ii2',  bloque:1, puntos:8, tipo:'number'},
  {id:'iii1', bloque:2, puntos:8, tipo:'number'},
  {id:'iii2', bloque:2, puntos:8, tipo:'number'},
  {id:'iv1',  bloque:3, puntos:8, tipo:'number'},
  {id:'iv2a', bloque:3, puntos:4, tipo:'number'},
  {id:'iv2b', bloque:3, puntos:4, tipo:'scientific'},
  {id:'v1',   bloque:4, puntos:8, tipo:'expression'},
  {id:'v2',   bloque:4, puntos:8, tipo:'number'},
  {id:'vi1',  bloque:5, puntos:5, tipo:'number'},
  {id:'vi2',  bloque:5, puntos:5, tipo:'number'},
  {id:'vi3',  bloque:5, puntos:5, tipo:'number'},
  {id:'vi4',  bloque:5, puntos:5, tipo:'number'}
];

function doPost(e){
  // La bitácora se escribe antes de tocar la hoja para conservar el payload.
  const crudo = (e && e.postData) ? e.postData.contents : '(sin cuerpo)';
  console.log('PAYLOAD ' + crudo);

  let lock = null;
  try{
    const d = JSON.parse(crudo);
    validarTipo_(d.tipo);
    validarGrupo_(d.grupo);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    lock = LockService.getDocumentLock();
    lock.waitLock(15000);

    let extra = {};
    if (d.tipo === 'encuesta'){
      guardarEncuesta_(ss, d);
    } else if (d.tipo === 'diagnostico'){
      validarNombre_(identidad_(d).nombre);
      const guardado = guardarDiagnostico_(ss, d);
      extra = {duplicado:!guardado, yaPresentado:!guardado};
    } else if (d.tipo === 'final'){
      validarNombre_(identidad_(d).nombre);
      const proceso = procesarFinal_(ss, d);
      extra = {
        duplicado:!proceso.guardado,
        yaPresentado:proceso.yaPresentado === true,
        resultado:proceso.resultado
      };
    }

    return responder_(Object.assign({ok:true}, extra));

  }catch(err){
    console.error('FALLO AL GUARDAR: ' + err + ' || PAYLOAD: ' + crudo);
    try{
      MailApp.sendEmail(
        CORREO,
        '⚠️ Inducción: un envío NO se guardó',
        'No se pudo escribir en la hoja.\n\nError: ' + err +
        '\n\nDatos crudos del alumno:\n' + crudo
      );
    }catch(err2){
      console.error('Tampoco salió el correo: ' + err2);
    }
    return responder_({ok:false,error:String(err)});
  }finally{
    if (lock){
      try{ lock.releaseLock(); }catch(lockError){
        console.error('No se pudo liberar el bloqueo: ' + lockError);
      }
    }
  }
}

function doGet(e){
  const cb = (e && e.parameter.callback) || null;
  if (!e || e.parameter.token !== TOKEN){
    return responder_({error:'token'}, cb);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const out = {};
  ['Diagnostico','Encuesta','Final'].forEach(function(nombre){
    const sh = ss.getSheetByName(nombre);
    out[nombre] = sh ? sh.getDataRange().getValues() : [];
  });
  // Las soluciones viajan solo aquí, detrás del token. Nunca deben ponerse en
  // el HTML del panel ni en este archivo: los dos son públicos en GitHub.
  out.Soluciones = obtenerSoluciones_();
  return responder_(out, cb);
}

/**
 * Procedimientos y respuestas correctas para la revisión por alumno.
 * Se guardan como propiedad privada FINAL_SOLUCIONES del proyecto, igual que
 * FINAL_ANSWER_KEY. Si no está configurada, el panel simplemente no muestra
 * la solución y todo lo demás sigue funcionando.
 */
function obtenerSoluciones_(){
  const raw = PropertiesService.getScriptProperties().getProperty('FINAL_SOLUCIONES');
  if (!raw) return null;
  try{
    return JSON.parse(raw);
  }catch(error){
    console.error('FINAL_SOLUCIONES no contiene JSON válido: ' + error);
    return null;
  }
}

function guardarEncuesta_(ss, d){
  const sh = getSheet_(ss, 'Encuesta', [
    'Fecha','Nombre','Grupo','Utilidad (1-5)','Dificultad',
    'Temas útiles','¿Preparado?','Comentarios'
  ]);
  sh.appendRow([
    new Date(), texto_(d.nombre), texto_(d.grupo), dato_(d.utilidad),
    texto_(d.dificultad), Array.isArray(d.temas) ? d.temas.join(', ') : '',
    texto_(d.preparado), texto_(d.comentarios)
  ]);
}

/**
 * Arma la identidad del alumno. El navegador ya manda los tres campos por
 * separado, pero el nombre completo se vuelve a componer aquí para que el
 * formato sea uniforme aunque el cliente mande cualquier cosa. Si llega un
 * envío de la página anterior, que solo trae "nombre", se respeta tal cual.
 */
function identidad_(d){
  const paterno = tituloNombre_(d.apellidoPaterno);
  const materno = tituloNombre_(d.apellidoMaterno);
  const nombres = tituloNombre_(d.nombres);
  if (!paterno && !nombres){
    return {nombre: texto_(d.nombre), paterno: '', materno: '', nombres: ''};
  }
  const apellidos = [paterno, materno].filter(String).join(' ');
  const nombre = apellidos && nombres ? apellidos + ', ' + nombres : (apellidos || nombres);
  return {nombre: nombre, paterno: paterno, materno: materno, nombres: nombres};
}

const PARTICULAS_ = ['de','del','la','las','los','y','da','di','van','von','mac','el'];

function tituloNombre_(valor){
  return texto_(valor).replace(/\s+/g, ' ').toLowerCase().split(' ')
    .map(function(palabra, i){
      if (i > 0 && PARTICULAS_.indexOf(palabra) >= 0) return palabra;
      return palabra.replace(/^[a-záéíóúüñ]/, function(c){ return c.toUpperCase(); });
    }).join(' ').trim();
}

function guardarDiagnostico_(ss, d){
  const sh = getSheet_(ss, 'Diagnostico', [
    'Fecha','Nombre','Grupo','Aciertos','Total','%',
    'Enteros','Fracciones','Porcentajes','Potencias','Álgebra','Ecuaciones',
    'Salidas de pantalla','Segundos fuera','Dispositivo',
    'Apellido paterno','Apellido materno','Nombre(s)'
  ]);

  const quien = identidad_(d);

  // Un diagnóstico por alumno. Para permitir que alguien lo repita, borra su
  // fila de la hoja "Diagnostico".
  if (buscarPorAlumno_(sh, 2, 3, quien.nombre, d.grupo)){
    return false;
  }

  sh.appendRow([
    new Date(), quien.nombre, texto_(d.grupo),
    dato_(d.aciertos), dato_(d.total), dato_(d.pct),
    dato_(d.b1), dato_(d.b2), dato_(d.b3),
    dato_(d.b4), dato_(d.b5), dato_(d.b6),
    dato_(d.salidas), dato_(d.segundosFuera), texto_(d.dispositivo),
    quien.paterno, quien.materno, quien.nombres
  ]);
  return true;
}

function procesarFinal_(ss, d){
  const id = texto_(d.submissionId);
  if (!/^[A-Za-z0-9-]{10,100}$/.test(id)){
    throw new Error('El examen final no incluye un identificador válido.');
  }

  // Las tres columnas nuevas van al final a propósito: así las filas ya
  // guardadas conservan su alineación y no hay que mover nada.
  const sh = getSheet_(ss, 'Final', [
    'Fecha','ID de envío','Nombre','Grupo','Puntaje','Total','%',
    'Aciertos','Reactivos','Enteros','Fracciones','Porcentajes',
    'Potencias','Álgebra','Ecuaciones','Duración (s)',
    'Tiempo agotado','Fecha del dispositivo','Detalle JSON',
    'Salidas de pantalla','Segundos fuera','Dispositivo',
    'Apellido paterno','Apellido materno','Nombre(s)'
  ]);

  const quien = identidad_(d);

  // Si el servidor guardó pero la respuesta se perdió, el reintento no duplica.
  const existente = buscarEnvio_(sh, id);
  if (existente){
    return {guardado:false, resultado:resultadoDesdeFila_(existente)};
  }

  // Un examen por alumno. Esto sí atrapa al que borra el examen guardado o entra
  // en ventana privada, porque en ese caso el submissionId es nuevo pero el
  // nombre y el grupo no. Para permitir que alguien lo repita, borra su fila
  // de la hoja "Final" y podrá presentarlo de nuevo.
  const filaPrevia = buscarPorAlumno_(sh, 3, 4, quien.nombre, d.grupo);
  if (filaPrevia){
    const previo = sh.getRange(filaPrevia, 1, 1, 19).getValues()[0];
    return {guardado:false, yaPresentado:true, resultado:resultadoDesdeFila_(previo)};
  }

  if (texto_(d.versionExamen) !== FINAL_VERSION){
    throw new Error('La versión del examen final no coincide con la del servidor.');
  }

  const calificacion = calificarFinal_(d);

  sh.appendRow([
    new Date(), id, quien.nombre, texto_(d.grupo),
    calificacion.puntaje, 100, calificacion.puntaje,
    calificacion.aciertos, FINAL_REACTIVOS.length,
    calificacion.porcentajes[0], calificacion.porcentajes[1],
    calificacion.porcentajes[2], calificacion.porcentajes[3],
    calificacion.porcentajes[4], calificacion.porcentajes[5],
    dato_(d.duracionSegundos), d.tiempoAgotado === true ? 'Sí' : 'No',
    texto_(d.fechaCliente), serializar_(calificacion.detalle),
    dato_(d.salidas), dato_(d.segundosFuera), texto_(d.dispositivo),
    quien.paterno, quien.materno, quien.nombres
  ]);
  return {guardado:true, resultado:resultadoPublico_(calificacion)};
}

function buscarEnvio_(sh, id){
  const ultimaFila = sh.getLastRow();
  if (ultimaFila < 2) return null;
  const celda = sh.getRange(2, 2, ultimaFila - 1, 1)
    .createTextFinder(id)
    .matchEntireCell(true)
    .findNext();
  return celda ? sh.getRange(celda.getRow(), 1, 1, 19).getValues()[0] : null;
}

function calificarFinal_(d){
  const clave = obtenerClaveFinal_();
  const respuestas = d.respuestas && typeof d.respuestas === 'object' ? d.respuestas : {};
  const procedimientos = d.procedimientos && typeof d.procedimientos === 'object' ? d.procedimientos : {};
  const puntosBloque = [0,0,0,0,0,0];
  let puntaje = 0;
  let aciertos = 0;

  const detalle = FINAL_REACTIVOS.map(function(reactivo, indice){
    const respuesta = texto_(respuestas[reactivo.id] !== undefined
      ? respuestas[reactivo.id] : d['r' + (indice + 1)]).slice(0, 80);
    const procedimiento = texto_(procedimientos[reactivo.id] !== undefined
      ? procedimientos[reactivo.id] : d['p' + (indice + 1)]).slice(0, 1000);
    const correcta = calificarRespuesta_(reactivo, respuesta, clave[reactivo.id]);
    const puntos = correcta ? reactivo.puntos : 0;
    if (correcta){
      puntaje += puntos;
      aciertos += 1;
      puntosBloque[reactivo.bloque] += puntos;
    }
    return {
      reactivo:indice + 1,
      id:reactivo.id,
      respuesta:respuesta,
      procedimiento:procedimiento,
      correcta:correcta,
      puntos:puntos
    };
  });

  const porcentajes = FINAL_TOTALES_BLOQUE.map(function(total, indice){
    return Math.round(puntosBloque[indice] / total * 100);
  });
  return {
    puntaje:puntaje,
    aciertos:aciertos,
    puntosBloque:puntosBloque,
    porcentajes:porcentajes,
    detalle:detalle
  };
}

function obtenerClaveFinal_(){
  const raw = PropertiesService.getScriptProperties().getProperty('FINAL_ANSWER_KEY');
  if (!raw){
    throw new Error('Falta configurar la propiedad privada FINAL_ANSWER_KEY.');
  }
  let clave;
  try{ clave = JSON.parse(raw); }
  catch(error){ throw new Error('La propiedad FINAL_ANSWER_KEY no contiene JSON válido.'); }
  FINAL_REACTIVOS.forEach(function(reactivo){
    if (!clave || !clave[reactivo.id]){
      throw new Error('La clave privada está incompleta: falta ' + reactivo.id + '.');
    }
  });
  return clave;
}

function calificarRespuesta_(reactivo, respuesta, clave){
  if (!respuesta || !clave) return false;
  if (reactivo.tipo === 'number'){
    const valor = parseNumero_(respuesta);
    const esperado = Number(clave.value);
    return isFinite(valor) && isFinite(esperado) && Math.abs(valor - esperado) < 1e-6;
  }
  if (reactivo.tipo === 'scientific'){
    const valor = parseCientifica_(respuesta);
    return valor !== null &&
      Math.abs(valor.coeficiente - Number(clave.coeficiente)) < 1e-9 &&
      valor.exponente === Number(clave.exponente);
  }
  if (reactivo.tipo === 'expression'){
    const normalizada = normalizarExpresion_(respuesta);
    const aceptadas = Array.isArray(clave.aceptadas) ? clave.aceptadas : [];
    return aceptadas.map(normalizarExpresion_).indexOf(normalizada) >= 0;
  }
  return false;
}

function parseNumero_(valor){
  let text = texto_(valor).toLowerCase()
    .replace(/−/g, '-').replace(/,/g, '.').replace(/\$/g, '');
  text = text.replace(/\b(pesos?|mxn|kg)\b/g, '').trim().replace(/^x\s*=\s*/, '');
  const mixto = text.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixto){
    const entero = Number(mixto[1]), numerador = Number(mixto[2]), denominador = Number(mixto[3]);
    if (!denominador) return NaN;
    return entero < 0 ? entero - numerador / denominador : entero + numerador / denominador;
  }
  const fraccion = text.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (fraccion){
    const denominador = Number(fraccion[2]);
    return denominador ? Number(fraccion[1]) / denominador : NaN;
  }
  return /^-?\d+(?:\.\d+)?$/.test(text) ? Number(text) : NaN;
}

function parseCientifica_(valor){
  let text = texto_(valor).toLowerCase().replace(/,/g, '.').replace(/[×·*]/g, 'x').replace(/\s+/g, '');
  text = text.replace(/⁻/g, '-').replace(/⁺/g, '+')
    .replace(/⁰/g, '0').replace(/¹/g, '1').replace(/²/g, '2').replace(/³/g, '3')
    .replace(/⁴/g, '4').replace(/⁵/g, '5').replace(/⁶/g, '6').replace(/⁷/g, '7')
    .replace(/⁸/g, '8').replace(/⁹/g, '9').replace(/[()]/g, '');
  let match = text.match(/^(-?\d+(?:\.\d+)?)e([+-]?\d+)$/);
  if (!match) match = text.match(/^(-?\d+(?:\.\d+)?)x10\^?([+-]?\d+)$/);
  if (!match) return null;
  return {coeficiente:Number(match[1]), exponente:Number(match[2])};
}

function normalizarExpresion_(valor){
  return texto_(valor).toLowerCase().replace(/²/g, '^2').replace(/[·×*]/g, '')
    .replace(/÷/g, '/').replace(/\s+/g, '').replace(/^y=/, '').replace(/^r=/, '');
}

function resultadoPublico_(calificacion){
  return {
    puntaje:calificacion.puntaje,
    total:100,
    pct:calificacion.puntaje,
    aciertos:calificacion.aciertos,
    totalReactivos:FINAL_REACTIVOS.length,
    bloques:FINAL_TOTALES_BLOQUE.map(function(total, indice){
      return {puntos:calificacion.puntosBloque[indice], total:total, pct:calificacion.porcentajes[indice]};
    })
  };
}

function resultadoDesdeFila_(fila){
  const porcentajes = [9,10,11,12,13,14].map(function(indice){ return Number(fila[indice]) || 0; });
  return {
    puntaje:Number(fila[4]) || 0,
    total:Number(fila[5]) || 100,
    pct:Number(fila[6]) || 0,
    aciertos:Number(fila[7]) || 0,
    totalReactivos:Number(fila[8]) || FINAL_REACTIVOS.length,
    bloques:FINAL_TOTALES_BLOQUE.map(function(total, indice){
      return {puntos:Math.round(porcentajes[indice] * total / 100), total:total, pct:porcentajes[indice]};
    })
  };
}

/* Compara nombres ignorando acentos, mayúsculas y espacios de más, para que
   "Dafne Sofía Macías" y "dafne sofia  macias" cuenten como la misma persona. */
function normalizarNombre_(valor){
  const ACENTOS = {'á':'a','é':'e','í':'i','ó':'o','ú':'u','ü':'u','ñ':'n',
                   'à':'a','è':'e','ì':'i','ò':'o','ù':'u',
                   'â':'a','ê':'e','î':'i','ô':'o','û':'u'};
  return texto_(valor).toLowerCase()
    .replace(/[áéíóúüñàèìòùâêîôû]/g, function(c){ return ACENTOS[c]; })
    .replace(/\s+/g, ' ')
    .trim();
}

/* Busca si ese alumno (nombre + grupo) ya tiene un registro en la hoja.
   Devuelve el número de fila, o null si es su primer envío. */
function buscarPorAlumno_(sh, colNombre, colGrupo, nombre, grupo){
  const ultimaFila = sh.getLastRow();
  if (ultimaFila < 2) return null;
  const objetivo = normalizarNombre_(nombre);
  if (!objetivo) return null;
  const grupoTexto = texto_(grupo);
  const ancho = Math.max(colNombre, colGrupo);
  const filas = sh.getRange(2, 1, ultimaFila - 1, ancho).getValues();
  for (let i = 0; i < filas.length; i++){
    if (normalizarNombre_(filas[i][colNombre - 1]) === objetivo &&
        texto_(filas[i][colGrupo - 1]) === grupoTexto){
      return i + 2;
    }
  }
  return null;
}

function validarTipo_(tipo){
  if (['diagnostico','encuesta','final'].indexOf(tipo) < 0){
    throw new Error('Tipo de envío no reconocido: ' + tipo);
  }
}

function validarGrupo_(grupo){
  if (['1','2','3','4'].indexOf(String(grupo || '')) < 0){
    throw new Error('Grupo no válido.');
  }
}

function validarNombre_(nombre){
  if (!texto_(nombre)) throw new Error('Nombre no válido.');
}

function getSheet_(ss, nombre, encabezados){
  let sh = ss.getSheetByName(nombre);
  if (!sh) sh = ss.insertSheet(nombre);
  if (sh.getLastRow() === 0){
    sh.appendRow(encabezados);
    sh.setFrozenRows(1);
    return sh;
  }
  // La hoja ya existía con menos columnas: se agregan solo los encabezados
  // nuevos, sin tocar los datos ya guardados.
  const faltan = encabezados.length - sh.getLastColumn();
  if (faltan > 0){
    if (sh.getMaxColumns() < encabezados.length){
      sh.insertColumnsAfter(sh.getMaxColumns(), encabezados.length - sh.getMaxColumns());
    }
    sh.getRange(1, encabezados.length - faltan + 1, 1, faltan)
      .setValues([encabezados.slice(encabezados.length - faltan)]);
  }
  return sh;
}

function dato_(valor){
  return valor === undefined || valor === null ? '' : valor;
}

function texto_(valor){
  return String(valor === undefined || valor === null ? '' : valor).trim();
}

function serializar_(valor){
  if (typeof valor === 'string') return valor;
  try{ return JSON.stringify(valor === undefined ? null : valor); }
  catch(error){ return String(valor || ''); }
}

function responder_(obj, cb){
  const callback = cb && /^[A-Za-z_$][\w$\.]*$/.test(cb) ? cb : null;
  const txt = callback
    ? callback + '(' + JSON.stringify(obj) + ');'
    : JSON.stringify(obj);
  return ContentService.createTextOutput(txt).setMimeType(
    callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON
  );
}
