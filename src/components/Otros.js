import React, { useState, useMemo, useRef } from 'react';

export default function Otros({ otros, categoriasOtros, onUpdate, onAdd, onDelete, onAddCat, onUpdateCat, onDeleteCat }) {
  const [subTab, setSubTab] = useState('items');

  // Items state
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todo');
  const [view, setView] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ nombre: '', categoria: '', ubicacion: 'Supermercado' });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const savedScroll = useRef(0);

  // Categorías state
  const [catView, setCatView] = useState('list');
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState({ nombre: '' });
  const [savingCat, setSavingCat] = useState(false);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(false);
  const [deletingCat, setDeletingCat] = useState(false);

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
      await onDelete(editingItem.id);
      setConfirmDelete(false);
      backToList();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const cats = useMemo(() => {
    const names = categoriasOtros.map(c => c.nombre).filter(Boolean);
    return ['Todo', ...names.sort()];
  }, [categoriasOtros]);

  const filtered = useMemo(() => {
    return otros.filter(i => {
      const matchSearch = i.nombre.toLowerCase().includes(search.toLowerCase());
      const matchCat = catFilter === 'Todo' || i.categoria === catFilter;
      return matchSearch && matchCat;
    });
  }, [otros, search, catFilter]);

  const grouped = useMemo(() => {
    const map = filtered.reduce((acc, item) => {
      const cat = item.categoria || 'Sin categoría';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, items]) => [cat, items.sort((a, b) => a.nombre.localeCompare(b.nombre))]);
  }, [filtered]);

  const openEdit = (item) => {
    savedScroll.current = document.querySelector('.app-main')?.scrollTop || 0;
    setForm({ nombre: item.nombre, categoria: item.categoria || '', ubicacion: item.ubicacion || 'Supermercado' });
    setEditingItem(item);
    setView('edit');
  };

  const openAdd = () => {
    savedScroll.current = document.querySelector('.app-main')?.scrollTop || 0;
    setForm({ nombre: '', categoria: catFilter === 'Todo' ? '' : catFilter, ubicacion: 'Supermercado' });
    setEditingItem(null);
    setView('add');
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    try {
      if (view === 'edit') await onUpdate(editingItem.id, form);
      else await onAdd(form);
      backToList();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const openEditCat = (cat) => {
    setCatForm({ nombre: cat.nombre });
    setEditingCat(cat);
    setCatView('edit');
  };

  const openAddCat = () => {
    setCatForm({ nombre: '' });
    setEditingCat(null);
    setCatView('add');
  };

  const handleSaveCat = async () => {
    if (!catForm.nombre.trim()) return;
    setSavingCat(true);
    try {
      if (catView === 'edit') await onUpdateCat(editingCat.id, catForm);
      else await onAddCat(catForm);
      setCatView('list');
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setSavingCat(false);
    }
  };

  const handleDeleteCat = async () => {
    setDeletingCat(true);
    try {
      await onDeleteCat(editingCat.id);
      setConfirmDeleteCat(false);
      setCatView('list');
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setDeletingCat(false);
    }
  };

  if (view === 'add' || view === 'edit') {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px 4px', gap: 12 }}>
          <p className="section-title" style={{ padding: 0, flex: 1 }}>
            {view === 'edit' ? 'Editar objeto' : 'Nuevo objeto'}
          </p>
          <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={backToList}>
            Volver
          </button>
        </div>
        <p className="section-sub">
          {view === 'edit' ? 'Modifica los datos y guarda' : 'Rellena los datos del objeto'}
        </p>
        <div className="anadir-wrap">
          <div className="form-group">
            <label>Nombre</label>
            <input
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="ej. Pasta de dientes"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Categoría</label>
            <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
              <option value="">-- Selecciona --</option>
              {categoriasOtros.map(c => (
                <option key={c.id} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Ubicación</label>
            <select value={form.ubicacion} onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}>
              <option value="Supermercado">🛒 Supermercado</option>
              <option value="Mercado">🏪 Mercado</option>
              <option value="Casa">🏠 Casa</option>
            </select>
          </div>
          <button className="btn-primary" onClick={handleSave} disabled={saving || !form.nombre.trim()} style={{ marginTop: 8 }}>
            {saving ? 'Guardando…' : view === 'edit' ? '💾 Guardar cambios' : '✚ Añadir objeto'}
          </button>
          {view === 'edit' && (
            <button className="btn-danger" onClick={() => setConfirmDelete(true)} style={{ marginTop: 8, width: '100%' }}>
              🗑️ Eliminar objeto
            </button>
          )}
        </div>
        {confirmDelete && (
          <div className="modal-overlay centered" onClick={() => setConfirmDelete(false)}>
            <div className="confirm-sheet" onClick={e => e.stopPropagation()}>
              <div className="confirm-title">¿Eliminar objeto?</div>
              <div className="confirm-body">
                Se eliminará <strong>{editingItem.nombre}</strong>. Esta acción no se puede deshacer.
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

  if (catView === 'add' || catView === 'edit') {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px 4px', gap: 12 }}>
          <p className="section-title" style={{ padding: 0, flex: 1 }}>
            {catView === 'edit' ? 'Editar categoría' : 'Nueva categoría'}
          </p>
          <button className="btn-secondary" style={{ padding: '7px 14px', fontSize: 13 }} onClick={() => setCatView('list')}>
            Volver
          </button>
        </div>
        <p className="section-sub">
          {catView === 'edit' ? 'Modifica el nombre y guarda' : 'Escribe el nombre de la categoría'}
        </p>
        <div className="anadir-wrap">
          <div className="form-group">
            <label>Nombre</label>
            <input
              value={catForm.nombre}
              onChange={e => setCatForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="ej. Higiene"
              autoFocus
            />
          </div>
          <button className="btn-primary" onClick={handleSaveCat} disabled={savingCat || !catForm.nombre.trim()} style={{ marginTop: 8 }}>
            {savingCat ? 'Guardando…' : catView === 'edit' ? '💾 Guardar cambios' : '✚ Añadir categoría'}
          </button>
          {catView === 'edit' && (
            <button className="btn-danger" onClick={() => setConfirmDeleteCat(true)} style={{ marginTop: 8, width: '100%' }}>
              🗑️ Eliminar categoría
            </button>
          )}
        </div>
        {confirmDeleteCat && (
          <div className="modal-overlay centered" onClick={() => setConfirmDeleteCat(false)}>
            <div className="confirm-sheet" onClick={e => e.stopPropagation()}>
              <div className="confirm-title">¿Eliminar categoría?</div>
              <div className="confirm-body">
                Se eliminará <strong>{editingCat.nombre}</strong>. Los objetos de esta categoría quedarán sin categorizar.
              </div>
              <div className="confirm-btns">
                <button className="btn-secondary" onClick={() => setConfirmDeleteCat(false)}>Cancelar</button>
                <button className="btn-danger" onClick={handleDeleteCat} disabled={deletingCat}>
                  {deletingCat ? 'Eliminando…' : 'Eliminar'}
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
        <p className="section-title" style={{ padding: 0, flex: 1 }}>Otros</p>
        {subTab === 'items' && (
          <button className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '7px 14px', fontSize: 13 }} onClick={openAdd}>
            + Nuevo
          </button>
        )}
        {subTab === 'categorias' && (
          <button className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '7px 14px', fontSize: 13 }} onClick={openAddCat}>
            + Nueva
          </button>
        )}
      </div>

      <div className="otros-subtabs">
        <button className={`otros-subtab ${subTab === 'items' ? 'active' : ''}`} onClick={() => setSubTab('items')}>
          Objetos
        </button>
        <button className={`otros-subtab ${subTab === 'categorias' ? 'active' : ''}`} onClick={() => setSubTab('categorias')}>
          Categorías
        </button>
      </div>

      {subTab === 'items' && (
        <div className="catalogo-wrap">
          <p className="section-sub" style={{ padding: '0 0 12px' }}>{otros.length} objetos en total</p>
          <div className="catalogo-search">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar objeto…" autoComplete="off" />
          </div>
          <div className="catalogo-cats">
            {cats.map(c => (
              <button key={c} className={`cat-filter ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>
                {c}
              </button>
            ))}
          </div>
          {grouped.map(([cat, items]) => (
            <div key={cat}>
              <div className="compra-cat-title">{cat}</div>
              {items.map(item => (
                <div key={item.id} className="ing-list-row" onClick={() => openEdit(item)}>
                  <span className="ing-list-nombre">{item.nombre}</span>
                  <span className="ing-list-unidad">{item.ubicacion}</span>
                  <span className="ing-list-edit">›</span>
                </div>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="compra-empty"><p>Sin resultados</p></div>
          )}
        </div>
      )}

      {subTab === 'categorias' && (
        <div className="catalogo-wrap">
          <p className="section-sub" style={{ padding: '0 0 12px' }}>{categoriasOtros.length} categorías</p>
          {categoriasOtros.length === 0 && (
            <div className="compra-empty"><p>Sin categorías aún</p></div>
          )}
          {[...categoriasOtros].sort((a, b) => a.nombre.localeCompare(b.nombre)).map(cat => (
            <div key={cat.id} className="ing-list-row" onClick={() => openEditCat(cat)}>
              <span className="ing-list-nombre">{cat.nombre}</span>
              <span className="ing-list-edit">›</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
