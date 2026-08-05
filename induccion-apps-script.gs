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
      validarNombre_(d.nombre);
      guardarDiagnostico_(ss, d);
    } else if (d.tipo === 'final'){
      validarNombre_(d.nombre);
      const proceso = procesarFinal_(ss, d);
      extra = {duplicado:!proceso.guardado, resultado:proceso.resultado};
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
  return responder_(out, cb);
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

function guardarDiagnostico_(ss, d){
  const sh = getSheet_(ss, 'Diagnostico', [
    'Fecha','Nombre','Grupo','Aciertos','Total','%',
    'Enteros','Fracciones','Porcentajes','Potencias','Álgebra','Ecuaciones'
  ]);
  sh.appendRow([
    new Date(), texto_(d.nombre), texto_(d.grupo),
    dato_(d.aciertos), dato_(d.total), dato_(d.pct),
    dato_(d.b1), dato_(d.b2), dato_(d.b3),
    dato_(d.b4), dato_(d.b5), dato_(d.b6)
  ]);
}

function procesarFinal_(ss, d){
  const id = texto_(d.submissionId);
  if (!/^[A-Za-z0-9-]{10,100}$/.test(id)){
    throw new Error('El examen final no incluye un identificador válido.');
  }

  const sh = getSheet_(ss, 'Final', [
    'Fecha','ID de envío','Nombre','Grupo','Puntaje','Total','%',
    'Aciertos','Reactivos','Enteros','Fracciones','Porcentajes',
    'Potencias','Álgebra','Ecuaciones','Duración (s)',
    'Tiempo agotado','Fecha del dispositivo','Detalle JSON'
  ]);

  // Si el servidor guardó pero la respuesta se perdió, el reintento no duplica.
  const existente = buscarEnvio_(sh, id);
  if (existente){
    return {guardado:false, resultado:resultadoDesdeFila_(existente)};
  }

  if (texto_(d.versionExamen) !== FINAL_VERSION){
    throw new Error('La versión del examen final no coincide con la del servidor.');
  }

  const calificacion = calificarFinal_(d);

  sh.appendRow([
    new Date(), id, texto_(d.nombre), texto_(d.grupo),
    calificacion.puntaje, 100, calificacion.puntaje,
    calificacion.aciertos, FINAL_REACTIVOS.length,
    calificacion.porcentajes[0], calificacion.porcentajes[1],
    calificacion.porcentajes[2], calificacion.porcentajes[3],
    calificacion.porcentajes[4], calificacion.porcentajes[5],
    dato_(d.duracionSegundos), d.tiempoAgotado === true ? 'Sí' : 'No',
    texto_(d.fechaCliente), serializar_(calificacion.detalle)
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
