/***********************************************************************
 * CURSO DE INDUCCIÓN — Registro de diagnóstico, encuesta y examen final
 * M.C. José Luis López Saynes · Bachillerato UNAM-Descartes
 * v3 — confirmación real, hoja Final, deduplicación y respaldo por correo
 *
 * IMPORTANTE: conserva los valores privados de TOKEN y CORREO que ya usas
 * en el proyecto desplegado. No publiques esos valores en GitHub.
 ***********************************************************************/

const TOKEN  = 'CONSERVA_AQUI_TU_TOKEN_ACTUAL';
const CORREO = 'CONSERVA_AQUI_TU_CORREO_DE_RESPALDO';

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
      const guardado = guardarFinal_(ss, d);
      extra = {duplicado:!guardado};
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

function guardarFinal_(ss, d){
  const id = texto_(d.submissionId);
  if (!/^[A-Za-z0-9-]{10,100}$/.test(id)){
    throw new Error('El examen final no incluye un identificador válido.');
  }

  const puntaje = Number(d.puntaje);
  if (!isFinite(puntaje) || puntaje < 0 || puntaje > 100){
    throw new Error('El puntaje del examen final no es válido.');
  }

  const sh = getSheet_(ss, 'Final', [
    'Fecha','ID de envío','Nombre','Grupo','Puntaje','Total','%',
    'Aciertos','Reactivos','Enteros','Fracciones','Porcentajes',
    'Potencias','Álgebra','Ecuaciones','Duración (s)',
    'Tiempo agotado','Fecha del dispositivo','Detalle JSON'
  ]);

  // Si el servidor guardó pero la respuesta se perdió, el reintento no duplica.
  if (existeEnvio_(sh, id)) return false;

  sh.appendRow([
    new Date(), id, texto_(d.nombre), texto_(d.grupo),
    puntaje, dato_(d.total), dato_(d.pct),
    dato_(d.aciertos), dato_(d.totalReactivos),
    dato_(d.b1), dato_(d.b2), dato_(d.b3),
    dato_(d.b4), dato_(d.b5), dato_(d.b6),
    dato_(d.duracionSegundos), d.tiempoAgotado === true ? 'Sí' : 'No',
    texto_(d.fechaCliente), serializar_(d.detalle)
  ]);
  return true;
}

function existeEnvio_(sh, id){
  const ultimaFila = sh.getLastRow();
  if (ultimaFila < 2) return false;
  return sh.getRange(2, 2, ultimaFila - 1, 1)
    .createTextFinder(id)
    .matchEntireCell(true)
    .findNext() !== null;
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
