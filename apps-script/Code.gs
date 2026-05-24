// ═══════════════════════════════════════════════════════════════════
//  MI APP DE DIETA — Google Apps Script Backend
//  Pega este código en: script.google.com → Nuevo proyecto
//  Luego: Implementar → Nueva implementación → Aplicación web
//         Ejecutar como: Yo | Quién tiene acceso: Cualquiera
// ═══════════════════════════════════════════════════════════════════

const SS_ID = 'PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET';
// El ID está en la URL de tu Sheet:
// https://docs.google.com/spreadsheets/d/[ESTE_ES_EL_ID]/edit

function getSheet(name) {
  return SpreadsheetApp.openById(SS_ID).getSheetByName(name);
}

function doGet(e)  { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function err(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleRequest(e) {
  try {
    const action = (e.parameter && e.parameter.action) || '';
    let body = {};
    if (e.postData && e.postData.contents) {
      try { body = JSON.parse(e.postData.contents); } catch (_) {}
    }

    switch (action) {
      case 'getPlatos':       return ok(getPlatos());
      case 'getIngredientes': return ok(getIngredientes());
      case 'getRecetas':      return ok(getRecetas());
      case 'getPlanSemanal':  return ok(getPlanSemanal());
      case 'setPlanSemanal':  return ok(setPlanSemanal(body.plan));
      case 'addPlato':          return ok(addPlato(body.plato, body.ingredientes));
      case 'updateIngrediente':      return ok(updateIngrediente(body.id, body.nombre, body.unidad, body.categoria));
      case 'addIngrediente':         return ok(addIngrediente(body.nombre, body.unidad, body.categoria));
      case 'updatePlato':            return ok(updatePlato(body.id, body.nombre, body.momento, body.categoria));
      case 'updateRecetaIngredientes': return ok(updateRecetaIngredientes(body.platoId, body.ingredientes));
      default:                       return err('Acción desconocida: ' + action);
    }
  } catch (ex) {
    return err(ex.message);
  }
}

// ── PLATOS ──────────────────────────────────────────────────────────
function getPlatos() {
  const sheet = getSheet('Platos');
  const rows = sheet.getDataRange().getValues();
  return rows.slice(1).filter(r => r[0]).map(r => ({
    id:        String(r[0]),
    nombre:    r[1],
    momento:   r[2],
    categoria: r[3],
  }));
}

// ── INGREDIENTES ────────────────────────────────────────────────────
function getIngredientes() {
  const sheet = getSheet('Ingredientes');
  const rows = sheet.getDataRange().getValues();
  return rows.slice(1).filter(r => r[0]).map(r => ({
    id:        String(r[0]),
    nombre:    r[1],
    unidad:    r[2],
    categoria: r[3],
    ubicacion: r[4] || 'Supermercado',
  }));
}

// ── RECETAS ─────────────────────────────────────────────────────────
function getRecetas() {
  const sheet = getSheet('Recetas');
  const rows = sheet.getDataRange().getValues();
  return rows.slice(1).filter(r => r[0]).map(r => ({
    idPlato:        String(r[0]),
    nombrePlato:    r[1],
    idIngrediente:  String(r[2]),
    nombreIng:      r[3],
    cantidad:       r[4],
    unidad:         r[5],
    notas:          r[6] || '',
  }));
}

// ── PLAN SEMANAL ────────────────────────────────────────────────────
function getPlanSemanal() {
  const sheet = getSheet('Plan semanal');
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return {};

  const dias = rows[0].slice(1);
  const plan = {};

  rows.slice(1).forEach(row => {
    const momento = row[0];
    if (!momento) return;
    row.slice(1).forEach((val, i) => {
      const dia = dias[i];
      if (!dia) return;
      if (!plan[dia]) plan[dia] = {};
      plan[dia][momento] = val ? String(val) : null;
    });
  });

  return plan;
}

function setPlanSemanal(plan) {
  if (!plan) return false;

  const sheet = getSheet('Plan semanal');
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const momentos = ['Desayuno', 'Comida', 'Cena'];

  // Ensure header row
  sheet.clearContents();
  const header = ['Momento', ...dias];
  sheet.getRange(1, 1, 1, header.length).setValues([header]);

  momentos.forEach((momento, ri) => {
    const row = [momento, ...dias.map(d => (plan[d] && plan[d][momento]) ? plan[d][momento] : '')];
    sheet.getRange(ri + 2, 1, 1, row.length).setValues([row]);
  });

  return true;
}

// ── AÑADIR PLATO ────────────────────────────────────────────────────
function addPlato(platoData, ingredientesData) {
  if (!platoData || !platoData.nombre) throw new Error('Nombre de plato requerido');

  const platosSheet = getSheet('Platos');
  const recetasSheet = getSheet('Recetas');

  // Get next ID
  const lastRow = platosSheet.getLastRow();
  const ids = platosSheet.getRange(2, 1, Math.max(lastRow - 1, 1)).getValues().flat().filter(Boolean);
  const maxId = ids.reduce((m, v) => Math.max(m, parseFloat(v) || 0), 0);
  const newId = maxId + 1;

  // Add plato row
  platosSheet.appendRow([newId, platoData.nombre, platoData.momento, platoData.categoria]);

  // Add receta rows
  if (Array.isArray(ingredientesData)) {
    ingredientesData.forEach(ing => {
      recetasSheet.appendRow([
        newId, platoData.nombre,
        ing.id, ing.nombre,
        ing.cantidad, ing.unidad,
        ing.notas || ''
      ]);
    });
  }

  return { id: newId };
}

// ── PLATOS (UPDATE) ─────────────────────────────────────────────────
function updatePlato(id, nombre, momento, categoria) {
  const sheet = getSheet('Platos');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.getRange(i + 1, 2, 1, 3).setValues([[nombre, momento, categoria]]);
      return { id };
    }
  }
  throw new Error('Plato no encontrado: ' + id);
}

function updateRecetaIngredientes(platoId, ingredientes) {
  const recetasSheet = getSheet('Recetas');
  const data = recetasSheet.getDataRange().getValues();

  // Collect row indices to delete (1-indexed), bottom to top
  const toDelete = [];
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(platoId)) toDelete.push(i + 1);
  }
  for (let i = toDelete.length - 1; i >= 0; i--) {
    recetasSheet.deleteRow(toDelete[i]);
  }

  // Get plato nombre for denormalized column
  const platosSheet = getSheet('Platos');
  const platosData = platosSheet.getDataRange().getValues();
  let nombrePlato = '';
  for (let i = 1; i < platosData.length; i++) {
    if (String(platosData[i][0]) === String(platoId)) { nombrePlato = platosData[i][1]; break; }
  }

  if (Array.isArray(ingredientes)) {
    ingredientes.forEach(ing => {
      recetasSheet.appendRow([platoId, nombrePlato, ing.id, ing.nombre, ing.cantidad, ing.unidad, ing.notas || '']);
    });
  }
  return true;
}

// ── INGREDIENTES (CRUD) ─────────────────────────────────────────────
function updateIngrediente(id, nombre, unidad, categoria) {
  const sheet = getSheet('Ingredientes');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.getRange(i + 1, 2, 1, 3).setValues([[nombre, unidad, categoria]]);
      return { id };
    }
  }
  throw new Error('Ingrediente no encontrado: ' + id);
}

function addIngrediente(nombre, unidad, categoria) {
  if (!nombre) throw new Error('Nombre requerido');
  const sheet = getSheet('Ingredientes');
  const lastRow = sheet.getLastRow();
  const ids = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().filter(Boolean) : [];
  const maxId = ids.reduce((m, v) => Math.max(m, parseFloat(v) || 0), 0);
  const newId = maxId + 1;
  sheet.appendRow([newId, nombre, unidad || 'ud', categoria || '']);
  return { id: newId };
}
