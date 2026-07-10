import React, { useState, useMemo, useRef } from 'react';

export default function Ingredientes({ ingredientes, categoriasIngredientes, onUpdate, onAdd, onDelete }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todo');
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingIng, setEditingIng] = useState(null);
  const [form, setForm] = useState({ nombre: '', unidad: 'ud', categoria: '', ubicacion: 'Supermercado' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const savedScroll = useRef(0);

  const backToList = () => {
    setView('list');
    requestAnimationFrame(() => {
      const main = document.querySelector('.app-main');
      if (main) main.scrollTop = savedScroll.current;
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(editingIng.id);
      setConfirmDelete(false);
      backToList();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const cats = useMemo(() => {
    const fromCollection = (categoriasIngredientes || []).map(c => c.nombre).filter(Boolean);
    const fromData = ingredientes.map(i => i.categoria).filter(Boolean);
    const merged = Array.from(new Set([...fromCollection, ...fromData])).sort();
    return ['Todo', ...merged];
  }, [categoriasIngredientes, ingredientes]);

  const filtered = useMemo(() => {
    return ingredientes.filter(i => {
      const matchSearch = i.nombre.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'Todo' || i.categoria === catFilter;
      return matchSearch && matchCat;
    });
  }, [ingredientes, search, catFilter]);

  const grouped = useMemo(() => {
    const map = filtered.reduce((acc, ing) => {
      const cat = ing.categoria || 'Sin categoría';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(ing);
      return acc;
    }, {});
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, ings]) => [cat, ings.sort((a, b) => a.nombre.localeCompare(b.nombre))]);
  }, [filtered]);

  const openEdit = (ing) => {
    savedScroll.current = document.querySelector('.app-main')?.scrollTop || 0;
    setForm({ nombre: ing.nombre, unidad: ing.unidad || 'ud', categoria: ing.categoria || '', ubicacion: ing.ubicacion || 'Supermercado' });
    setEditingIng(ing);
    setView('edit');
  };

  const openAdd = () => {
    savedScroll.current = document.querySelector('.app-main')?.scrollTop || 0;
    setForm({ nombre: '', unidad: 'ud', categoria: catFilter === 'Todo' ? '' : catFilter, ubicacion: 'Supermercado' });
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
      backToList();
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
          <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={backToList}>
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

          <div className="form-group">
            <label>Ubicación</label>
            <select
              value={form.ubicacion}
              onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
            >
              <option value="Supermercado">🛒 Supermercado</option>
              <option value="Mercado">🏪 Mercado</option>
              <option value="Casa">🏠 Casa</option>
            </select>
          </div>

          <button className="btn-primary" onClick={handleSave} disabled={saving || !form.nombre.trim()} style={{ marginTop: 8 }}>
            {saving ? 'Guardando…' : view === 'edit' ? '💾 Guardar cambios' : '✚ Añadir ingrediente'}
          </button>
          {view === 'edit' && (
            <button className="btn-danger" onClick={() => setConfirmDelete(true)} style={{ marginTop: 8, width: '100%' }}>
              🗑️ Eliminar ingrediente
            </button>
          )}
        </div>

        {confirmDelete && (
          <div className="modal-overlay centered" onClick={() => setConfirmDelete(false)}>
            <div className="confirm-sheet" onClick={e => e.stopPropagation()}>
              <div className="confirm-title">¿Eliminar ingrediente?</div>
              <div className="confirm-body">
                Se eliminará <strong>{editingIng.nombre}</strong>. Esta acción no se puede deshacer.
              </div>
              <div className="confirm-btns">
                <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}
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

        {grouped.map(([cat, ings]) => (
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
