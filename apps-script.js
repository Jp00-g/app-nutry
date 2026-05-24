// ══════════════════════════════════════════════════════════════════
//  MI DIETA — Google Apps Script
//  Pega TODO este código en script.google.com → nuevo proyecto
//  Luego: Implementar → Web App → Acceso: Cualquiera → Implementar
// ══════════════════════════════════════════════════════════════════

const SHEET_ID = '';  // ← Deja esto vacío, el script crea la hoja automáticamente

function getOrCreateSpreadsheet() {
  const key = 'SPREADSHEET_ID';
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty(key);
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch(e) {}
  }
  const ss = SpreadsheetApp.create('Mi Dieta - Base de Datos');
  props.setProperty(key, ss.getId());
  initSheets(ss);
  return ss;
}

function initSheets(ss) {
  // Hoja Platos
  let sh = ss.getActiveSheet();
  sh.setName('Platos');
  sh.appendRow(['ID','Nombre','Momento','Categoria']);

  // Hoja Recetas
  let r = ss.insertSheet('Recetas');
  r.appendRow(['Plato','Ingrediente','Cantidad','Unidad','Categoria','Notas']);

  // Hoja Plan
  let p = ss.insertSheet('Plan');
  p.appendRow(['Dia','Momento','Plato']);

  // Importar datos del Excel inicial si quieres hacerlo manual
}

function doPost(e) {
  const result = handleRequest(e);
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const result = handleRequest(e);
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleRequest(e) {
  const action = (e.parameter && e.parameter.action) || 'getData';
  let body = {};
  if (e.postData && e.postData.contents) {
    try { body = JSON.parse(e.postData.contents); } catch(err) {}
  }

  const ss = getOrCreateSpreadsheet();

  if (action === 'getData')      return getData(ss);
  if (action === 'savePlan')     return savePlan(ss, body.plan || {});
  if (action === 'addPlato')     return addPlato(ss, body);
  return { error: 'Unknown action' };
}

// ── GET DATA ──────────────────────────────────────────────────────
function getData(ss) {
  const platosSheet  = ss.getSheetByName('Platos');
  const recetasSheet = ss.getSheetByName('Recetas');
  const planSheet    = ss.getSheetByName('Plan');

  const platos = sheetToObjects(platosSheet).map(r => ({
    id:        r['ID'],
    nombre:    r['Nombre'],
    momento:   r['Momento'],
    categoria: r['Categoria']
  }));

  const recetas = sheetToObjects(recetasSheet).map(r => ({
    plato:       r['Plato'],
    ingrediente: r['Ingrediente'],
    cantidad:    r['Cantidad'],
    unidad:      r['Unidad'],
    categoria:   r['Categoria'],
    notas:       r['Notas']
  }));

  // Plan: Dia | Momento | Plato  →  { Lunes: { Comida: 'Lentejas', ... }, ... }
  const planRows = sheetToObjects(planSheet);
  const plan = {};
  planRows.forEach(r => {
    if (!r['Dia']) return;
    if (!plan[r['Dia']]) plan[r['Dia']] = {};
    plan[r['Dia']][r['Momento']] = r['Plato'];
  });

  return { platos, recetas, plan };
}

// ── SAVE PLAN ─────────────────────────────────────────────────────
function savePlan(ss, plan) {
  const sh = ss.getSheetByName('Plan');
  // Limpiar excepto cabecera
  const lastRow = sh.getLastRow();
  if (lastRow > 1) sh.deleteRows(2, lastRow - 1);

  Object.entries(plan).forEach(([dia, momentos]) => {
    Object.entries(momentos).forEach(([momento, plato]) => {
      if (plato) sh.appendRow([dia, momento, plato]);
    });
  });
  return { ok: true };
}

// ── ADD PLATO ─────────────────────────────────────────────────────
function addPlato(ss, data) {
  const platosSheet  = ss.getSheetByName('Platos');
  const recetasSheet = ss.getSheetByName('Recetas');

  // Nuevo ID
  const lastRow = platosSheet.getLastRow();
  const newId = lastRow; // fila 1 = cabecera, fila 2 = plato 1, etc.

  platosSheet.appendRow([newId, data.nombre, data.momento, data.categoria]);

  (data.ingredientes || []).forEach(ing => {
    recetasSheet.appendRow([data.nombre, ing.nombre, ing.cantidad, ing.unidad, '', '']);
  });

  return { ok: true, id: newId };
}

// ── HELPER ────────────────────────────────────────────────────────
function sheetToObjects(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}
