import React, { useState, useRef, useEffect } from 'react';

const MOMENTOS_OPT = ['Comidas', 'Cenas'];
const CATS_COMIDA = ['CARNES', 'ENSALADAS', 'CUCHARA', 'PASTA', 'ARROZ', 'PESCADO', 'OTROS'];
const CATS_CENA = ['WRAP', 'ENSALADAS', 'CUCHARA', 'TOSTAS/SANDWICH', 'PLATO', 'CARNES'];

export default function EditarReceta({ plato, recetasPlato, ingredientes, onUpdate, onDone }) {
  const [nombre, setNombre] = useState(plato.nombre);
  const [momento, setMomento] = useState(plato.momento);
  const [categoria, setCategoria] = useState(plato.categoria);
  const [ingRows, setIngRows] = useState(
    recetasPlato.map(r => ({
      id: r.idIngrediente,
      nombre: r.nombreIng,
      unidad: r.unidad,
      cantidad: r.cantidad,
    }))
  );
  const [selIng, setSelIng] = useState('');
  const [selCant, setSelCant] = useState('');
  const [ingSearch, setIngSearch] = useState('');
  const [ingOpen, setIngOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ingRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ingRef.current && !ingRef.current.contains(e.target)) setIngOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const cats = momento === 'Comidas' ? CATS_COMIDA : CATS_CENA;

  const selectedIng = ingredientes.find(i => String(i.id) === selIng);

  const filteredIngs = ingredientes.filter(i =>
    i.nombre.toLowerCase().includes(ingSearch.toLowerCase())
  );

  const groupedIngs = filteredIngs.reduce((acc, ing) => {
    const cat = ing.categoria || 'Otros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ing);
    return acc;
  }, {});

  const addIngRow = () => {
    if (!selIng || !selCant) return;
    const ing = ingredientes.find(i => String(i.id) === selIng);
    if (!ing) return;
    setIngRows(r => [...r, { id: ing.id, nombre: ing.nombre, unidad: ing.unidad, cantidad: selCant }]);
    setSelIng('');
    setSelCant('');
  };

  const removeRow = (idx) => setIngRows(r => r.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!nombre.trim()) return alert('Escribe el nombre de la receta');
    if (ingRows.length === 0) return alert('Añade al menos un ingrediente');
    setSaving(true);
    try {
      await onUpdate(plato.id, { nombre: nombre.trim(), momento, categoria }, ingRows);
      onDone();
    } catch (e) {
      alert('Error al guardar: ' + e.message);
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px 4px', gap: 12 }}>
        <p className="section-title" style={{ padding: 0, flex: 1 }}>Editar receta</p>
        <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={onDone}>
          Cancelar
        </button>
      </div>
      <p className="section-sub">Modifica los datos y pulsa guardar</p>

      <div className="anadir-wrap">
        <div className="form-group">
          <label>Nombre</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="ej. Pollo al limón"
          />
        </div>

        <div className="form-group">
          <label>Momento</label>
          <select value={momento} onChange={e => { setMomento(e.target.value); setCategoria(''); }}>
            {MOMENTOS_OPT.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Categoría</label>
          <select value={categoria} onChange={e => setCategoria(e.target.value)}>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="divider" />

        <div className="form-group">
          <label>Ingredientes</label>
          <div className="ing-add-row">
            <div className="form-group ing-combobox-wrap" ref={ingRef}>
              <input
                value={ingOpen ? ingSearch : (selectedIng ? selectedIng.nombre : '')}
                onChange={e => { setIngSearch(e.target.value); setIngOpen(true); setSelIng(''); }}
                onFocus={() => { setIngOpen(true); setIngSearch(''); }}
                placeholder="Buscar ingrediente…"
                autoComplete="off"
              />
              {ingOpen && (
                <div className="ing-dropdown">
                  {Object.keys(groupedIngs).length === 0
                    ? <div className="ing-dropdown-empty">Sin resultados</div>
                    : Object.entries(groupedIngs).map(([cat, ings]) => (
                      <div key={cat}>
                        <div className="ing-dropdown-cat">{cat}</div>
                        {ings.map(ing => (
                          <div
                            key={ing.id}
                            className="ing-dropdown-opt"
                            onMouseDown={() => { setSelIng(String(ing.id)); setIngOpen(false); setIngSearch(''); }}
                          >
                            {ing.nombre}
                          </div>
                        ))}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            <div className="form-group small">
              <input
                value={selCant}
                onChange={e => setSelCant(e.target.value)}
                placeholder="Cant."
                type="number"
                min="0"
              />
            </div>
            <button className="btn-secondary" onClick={addIngRow} style={{ whiteSpace: 'nowrap' }}>
              ＋ Añadir
            </button>
          </div>
        </div>

        {ingRows.length > 0 && (
          <div className="ing-list-added">
            {ingRows.map((r, i) => (
              <div key={i} className="ing-added-item">
                <span>{r.nombre}</span>
                <strong>{r.cantidad} {r.unidad}</strong>
                <button className="remove-btn" onClick={() => removeRow(i)}>✕</button>
              </div>
            ))}
          </div>
        )}

        <button className="btn-primary" onClick={handleSubmit} disabled={saving} style={{ marginTop: 8 }}>
          {saving ? 'Guardando…' : '💾 Guardar cambios'}
        </button>
      </div>
    </>
  );
}
