import React, { useState } from 'react';

const CAT_CLASS = {
  CARNES: 'cat-carnes', ENSALADAS: 'cat-ensaladas', CUCHARA: 'cat-cuchara',
  PASTA: 'cat-pasta', ARROZ: 'cat-arroz', PESCADO: 'cat-pescado',
  WRAP: 'cat-wrap', PLATO: 'cat-otros',
};

export default function Catalogo({ platos, recetas, ingredientes, onAnadir }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');
  const [open, setOpen] = useState(null);

  const cats = ['Todas', ...new Set(platos.map(p => p.categoria))];

  const filtered = platos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Todas' || p.categoria === catFilter;
    return matchSearch && matchCat;
  });

  const getRecetasPlato = (platoId) => {
    return recetas.filter(r => String(r.idPlato) === String(platoId)).map(r => {
      const ing = ingredientes.find(i => String(i.id) === String(r.idIngrediente));
      return { ...r, nombreIng: ing?.nombre || r.idIngrediente, unidad: ing?.unidad || '' };
    });
  };

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
    </>
  );
}
