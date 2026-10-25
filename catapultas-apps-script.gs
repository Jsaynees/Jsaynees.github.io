/** Registro privado de equipos · Bachillerato UNAM-Descartes, 2026. */
const CIERRE = '2026-10-30T23:00:00-06:00';
const DOCENTES = ['M.C. José Luis López Saynes','Ing. Jorge Roberto Pascacio Ruiz','Mtra. Julissa Farrera Molina','LEI. Ameth Cruz Fuentes'];
const COLUMNAS = ['ID de envío','Folio','Fecha de registro','Equipo','Docente de referencia','Representante','Integrantes (JSON)','Firma de envío','Claves de integrantes (JSON)','Integrante 1','Grupo 1','Integrante 2','Grupo 2','Integrante 3','Grupo 3','Integrante 4','Grupo 4'];

function prepararRegistro() {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const props = PropertiesService.getScriptProperties();
    let id = props.getProperty('REGISTRO_SHEET_ID');
    if (!id) {
      const ss = SpreadsheetApp.create('Catapultas 2026 - Registro de equipos');
      const sh = ss.getSheets()[0]; sh.setName('Equipos');
      sh.appendRow(COLUMNAS); sh.setFrozenRows(1);
      sh.getRange(1,1,1,COLUMNAS.length).setBackground('#17385f').setFontColor('#ffffff').setFontWeight('bold');
      sh.setColumnWidths(1,COLUMNAS.length,180); sh.setColumnWidth(7,450);
      sh.getRange('A:I').setNumberFormat('@');
      id = ss.getId(); props.setProperty('REGISTRO_SHEET_ID',id);
    }
    const hoja=SpreadsheetApp.openById(id).getSheetByName('Equipos');
    hoja.getRange('A:Q').setNumberFormat('@');
    hoja.getRange(1,1,1,COLUMNAS.length).setValues([COLUMNAS]).setBackground('#17385f').setFontColor('#ffffff').setFontWeight('bold');
    hoja.setColumnWidths(10,8,170); hoja.hideColumns(1); hoja.hideColumns(7,3);
    console.log('Hoja privada del docente: https://docs.google.com/spreadsheets/d/'+id+'/edit');
    return id;
  } finally { lock.releaseLock(); }
}
function salida_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function doGet() {
  const listo = !!PropertiesService.getScriptProperties().getProperty('REGISTRO_SHEET_ID');
  return salida_({ok:listo,abierto:listo && Date.now()<Date.parse(CIERRE),cierre:CIERRE,version:'catapultas-2026-v1'});
}
function texto_(value,min,max,label) {
  if (typeof value!=='string') throw new Error('Revisa '+label+'.');
  const s=value.trim().replace(/\s+/g,' ');
  if (s.length<min || s.length>max || /[\u0000-\u001f<>]/.test(s)) throw new Error('Revisa '+label+'.');
  return s;
}
function clave_(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,''); }
function validar_(d) {
  if (!d || d.acepta!==true || d.website) throw new Error('Revisa los datos y confirma que leyeron la convocatoria.');
  if (typeof d.id!=='string' || !/^[a-f0-9-]{36}$/i.test(d.id)) throw new Error('El identificador de envío no es válido. Recarga la página.');
  const equipo=texto_(d.equipo,3,60,'el nombre del equipo');
  if (clave_(equipo).length<3) throw new Error('El nombre del equipo debe contener al menos tres letras o números.');
  if (!DOCENTES.includes(d.docente)) throw new Error('Selecciona un docente de referencia.');
  if (!Array.isArray(d.integrantes) || d.integrantes.length<3 || d.integrantes.length>4) throw new Error('El equipo debe tener 3 o 4 integrantes.');
  const integrantes=d.integrantes.map(m=>{
    const nombre=texto_(m.nombre,5,100,'el nombre completo de cada integrante');
    const grupo=texto_(m.grupo,4,4,'el grupo de cada integrante');
    if (!/^\d{4}$/.test(grupo)) throw new Error('El grupo debe tener cuatro dígitos.');
    if (!/^[\p{L}\p{M} .'-]+$/u.test(nombre) || clave_(nombre).length<5) throw new Error('Escribe nombres completos, sin números ni símbolos.');
    return {nombre,grupo};
  });
  const claves=integrantes.map(m=>clave_(m.nombre)+'|'+m.grupo);
  if (new Set(claves).size!==claves.length) throw new Error('Hay integrantes repetidos en este equipo.');
  return {equipo,docente:d.docente,integrantes,claves};
}
function seguro_(s) { return /^[=+\-@]/.test(s)?"'"+s:s; }
function firma_(d) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify(d)).map(b=>('0'+(b&255).toString(16)).slice(-2)).join('');
}
function doPost(e) {
  let lock;
  try {
    const raw=e && e.postData && e.postData.contents;
    if (!raw || raw.length>12000) return salida_({ok:false,error:'El envío no es válido.'});
    let d; try { d=JSON.parse(raw); } catch (_) { return salida_({ok:false,error:'El envío no es válido.'}); }
    const v=validar_(d), firma=firma_(v);
    lock=LockService.getScriptLock();
    if (!lock.tryLock(15000)) return salida_({ok:false,retryable:true,error:'Hay otro registro en proceso. Reintenta en unos segundos.'});
    const id=PropertiesService.getScriptProperties().getProperty('REGISTRO_SHEET_ID');
    if (!id) return salida_({ok:false,retryable:true,error:'El registro aún no está habilitado.'});
    const sh=SpreadsheetApp.openById(id).getSheetByName('Equipos');
    const rows=sh.getDataRange().getValues().slice(1);
    const previo=rows.find(r=>r[0]===d.id);
    if (previo) {
      if (previo[7]!==firma) return salida_({ok:false,error:'Este envío ya se guardó con otros datos. No lo modifiques al reintentar.'});
      return salida_({ok:true,folio:previo[1],fecha:previo[2],duplicado:true});
    }
    if (Date.now()>=Date.parse(CIERRE)) return salida_({ok:false,error:'Las inscripciones cerraron el 30 de octubre de 2026 a las 23:00 h, hora de Ciudad de México.'});
    if (rows.some(r=>clave_(String(r[3]))===clave_(v.equipo))) return salida_({ok:false,error:'Ese nombre de equipo ya está registrado. Elige otro nombre.'});
    const usados=new Set(rows.flatMap(r=>{try{return JSON.parse(r[8]);}catch(_){return [];}}));
    if (v.claves.some(k=>usados.has(k))) return salida_({ok:false,error:'Uno o más integrantes ya aparecen en un equipo registrado. Consulta a tu docente antes de volver a inscribirlos.'});
    const folio='CAT-2026-'+Utilities.getUuid().slice(0,8).toUpperCase(), fecha=new Date().toISOString();
    const visibles=Array.from({length:4},(_,i)=>v.integrantes[i]?[seguro_(v.integrantes[i].nombre),v.integrantes[i].grupo]:['','']).flat();
    sh.appendRow([d.id,folio,fecha,seguro_(v.equipo),v.docente,seguro_(v.integrantes[0].nombre),JSON.stringify(v.integrantes),firma,JSON.stringify(v.claves),...visibles]);
    SpreadsheetApp.flush();
    return salida_({ok:true,folio,fecha});
  } catch(err) {
    if (err && /^Revisa|^Selecciona|^El equipo|^El nombre|^Hay integrantes|^El grupo|^Escribe|^El identificador/.test(err.message)) return salida_({ok:false,error:err.message});
    console.error('No se pudo registrar el equipo: '+String(err));
    return salida_({ok:false,retryable:true,error:'No se pudo confirmar el registro. Conserva esta página y reintenta; no se duplicará tu envío.'});
  } finally { if(lock && lock.hasLock()) lock.releaseLock(); }
}
