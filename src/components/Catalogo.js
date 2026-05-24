import React, { useState } from 'react';

const CAT_CLASS = {
  CARNES: 'cat-carnes', ENSALADAS: 'cat-ensaladas', CUCHARA: 'cat-cuchara',
  PASTA: 'cat-pasta', ARROZ: 'cat-arroz', PESCADO: 'cat-pescado',
  WRAP: 'cat-wrap', PLATO: 'cat-otros',
};

const MOMENTOS = ['Todos', 'Comidas', 'Cenas', 'Desayunos'];

export default function Catalogo({ platos, recetas, onAnadir, onEditar, onDelete }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');
  const [momentoFilter, setMomentoFilter] = useState('Todos');
  const [open, setOpen] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // plato object
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(confirmDelete.id);
      setConfirmDelete(null);
      setOpen(null);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const cats = ['Todas', ...new Set(platos.map(p => p.categoria))];

  const filtered = platos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Todas' || p.categoria === catFilter;
    const matchMomento = momentoFilter === 'Todos' || p.momento === momentoFilter;
    return matchSearch && matchCat && matchMomento;
  });

  const getRecetasPlato = (platoId) =>
    recetas.filter(r => String(r.idPlato) === String(platoId));

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px 4px', gap: 12 }}>
        <p className="section-title" style={{ padding: 0, flex: 1 }}>Recetas</p>
        <button className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '7px 14px', fontSize: 13 }} onClick={onAnadir}>
          + Nueva
        </button>
      </div>
      <p className="section-sub">{platos.length} recetas disponibles</p>

      <div className="catalogo-wrap">
        <div className="catalogo-search">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar plato…"
          />
        </div>

        <div className="catalogo-cats">
          {MOMENTOS.map(m => (
            <button
              key={m}
              className={`cat-filter ${momentoFilter === m ? 'active' : ''}`}
              onClick={() => { setMomentoFilter(m); setCatFilter('Todas'); }}
            >
              {m}
            </button>
          ))}
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

        {filtered.map(plato => {
          const isOpen = open === plato.id;
          const recetaItems = isOpen ? getRecetasPlato(plato.id) : [];
          return (
            <div key={plato.id} className="plato-card">
              <div className="plato-card-header" onClick={() => setOpen(isOpen ? null : plato.id)}>
                <span className={`chip ${CAT_CLASS[plato.categoria] || ''}`}>{plato.categoria}</span>
                <span className="plato-card-name">{plato.nombre}</span>
                <button
                  className="btn-danger"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={e => { e.stopPropagation(); setConfirmDelete(plato); }}
                >
                  🗑️
                </button>
                <button
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={e => { e.stopPropagation(); onEditar(plato); }}
                >
                  Editar
                </button>
                <span className={`plato-card-arrow ${isOpen ? 'open' : ''}`}>▼</span>
              </div>
              {isOpen && (
                <div className="plato-card-body">
                  {recetaItems.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--text3)', paddingTop: 10 }}>
                      Sin ingredientes registrados
                    </p>
                  ) : (
                    recetaItems.map((r, i) => (
                      <div key={i} className="ing-row">
                        <div>
                          <div className="ing-name">{r.nombreIng}</div>
                          {r.notas && <div className="ing-nota">{r.notas}</div>}
                        </div>
                        <span className="ing-cant">
                          {r.cantidad !== 'a elegir' ? `${r.cantidad} ${r.unidad}` : '⚡ a elegir'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p style={{ color: 'var(--text3)', fontSize: 14, textAlign: 'center', padding: '40px 0' }}>
            No se encontraron recetas
          </p>
        )}

      </div>

      {confirmDelete && (
        <div className="modal-overlay centered" onClick={() => setConfirmDelete(null)}>
          <div className="confirm-sheet" onClick={e => e.stopPropagation()}>
            <div className="confirm-title">¿Eliminar receta?</div>
            <div className="confirm-body">
              Se eliminará <strong>{confirmDelete.nombre}</strong> y todos sus ingredientes. Esta acción no se puede deshacer.
            </div>
            <div className="confirm-btns">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
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
