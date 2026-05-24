import React, { useState, useMemo } from 'react';

export default function Ingredientes({ ingredientes, onUpdate, onAdd }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todo');
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingIng, setEditingIng] = useState(null);
  const [form, setForm] = useState({ nombre: '', unidad: 'ud', categoria: '' });
  const [saving, setSaving] = useState(false);

  const cats = useMemo(() => {
    const set = new Set(ingredientes.map(i => i.categoria).filter(Boolean));
    return ['Todo', ...Array.from(set).sort()];
  }, [ingredientes]);

  const filtered = useMemo(() => {
    return ingredientes.filter(i => {
      const matchSearch = i.nombre.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'Todo' || i.categoria === catFilter;
      return matchSearch && matchCat;
    });
  }, [ingredientes, search, catFilter]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, ing) => {
      const cat = ing.categoria || 'Sin categoría';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(ing);
      return acc;
    }, {});
  }, [filtered]);

  const openEdit = (ing) => {
    setForm({ nombre: ing.nombre, unidad: ing.unidad || 'ud', categoria: ing.categoria || '' });
    setEditingIng(ing);
    setView('edit');
  };

  const openAdd = () => {
    setForm({ nombre: '', unidad: 'ud', categoria: catFilter === 'Todo' ? '' : catFilter });
    setEditingIng(null);
    setView('add');
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      if (view === 'edit') {
        await onUpdate(editingIng.id, form);
      } else {
        await onAdd(form);
      }
      setView('list');
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (view === 'add' || view === 'edit') {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px 4px', gap: 12 }}>
          <p className="section-title" style={{ padding: 0, flex: 1 }}>
            {view === 'edit' ? 'Editar ingrediente' : 'Nuevo ingrediente'}
          </p>
          <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => setView('list')}>
            Volver
          </button>
        </div>
        <p className="section-sub">
          {view === 'edit' ? 'Modifica los datos y guarda' : 'Rellena los datos del ingrediente'}
        </p>

        <div className="anadir-wrap">
          <div className="form-group">
            <label>Nombre</label>
            <input
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="ej. Pechuga de pollo"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Unidad</label>
            <select
              value={form.unidad}
              onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))}
            >
              <option value="ud">ud</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="L">L</option>
            </select>
          </div>

          <div className="form-group">
            <label>Categoría</label>
            <select
              value={form.categoria}
              onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
            >
              <option value="">-- Selecciona --</option>
              {cats.filter(c => c !== 'Todo').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button className="btn-primary" onClick={handleSave} disabled={saving || !form.nombre.trim()} style={{ marginTop: 8 }}>
            {saving ? 'Guardando…' : view === 'edit' ? '💾 Guardar cambios' : '✚ Añadir ingrediente'}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px 4px', gap: 12 }}>
        <p className="section-title" style={{ padding: 0, flex: 1 }}>Ingredientes</p>
        <button className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '7px 14px', fontSize: 13 }} onClick={openAdd}>
          + Nuevo
        </button>
      </div>
      <p className="section-sub">{ingredientes.length} ingredientes en total</p>

      <div className="catalogo-wrap">
        <div className="catalogo-search">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ingrediente…"
            autoComplete="off"
          />
        </div>

        <div className="catalogo-cats">
          {cats.map(c => (
            <button
              key={c}
              className={`cat-filter ${catFilter === c ? 'active' : ''}`}
              onClick={() => setCatFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {Object.entries(grouped).map(([cat, ings]) => (
          <div key={cat}>
            <div className="compra-cat-title">{cat}</div>
            {ings.map(ing => (
              <div key={ing.id} className="ing-list-row" onClick={() => openEdit(ing)}>
                <span className="ing-list-nombre">{ing.nombre}</span>
                <span className="ing-list-unidad">{ing.unidad}</span>
                <span className="ing-list-edit">›</span>
              </div>
            ))}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="compra-empty">
            <p>Sin resultados</p>
          </div>
        )}
      </div>
    </>
  );
}
