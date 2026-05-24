import React, { useState } from 'react';

const CATS = ['Todo', 'CARNES', 'ENSALADAS', 'CUCHARA', 'PASTA', 'ARROZ', 'PESCADO', 'WRAP', 'PLATO'];
const CAT_CLASS = {
  CARNES: 'cat-carnes', ENSALADAS: 'cat-ensaladas', CUCHARA: 'cat-cuchara',
  PASTA: 'cat-pasta', ARROZ: 'cat-arroz', PESCADO: 'cat-pescado',
  WRAP: 'cat-wrap', PLATO: 'cat-otros',
};

export default function PlanSemanal({ plan, platos, dias, momentos, onUpdate, getPlatoById }) {
  const [modal, setModal] = useState(null); // { dia, momento }
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todas');

  const openModal = (dia, momento) => {
    setSearch('');
    setCatFilter('Todo');
    setModal({ dia, momento });
  };

  const closeModal = () => setModal(null);

  const selectPlato = (id) => {
    onUpdate(modal.dia, modal.momento, id);
    closeModal();
  };

  const filteredPlatos = platos.filter(p => {
    const matchMomento = modal ? (
      modal.momento === 'Desayuno' ? true :
      modal.momento === 'Comida' ? p.momento === 'Comidas' : p.momento === 'Cenas'
    ) : true;
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Todo' || p.categoria === catFilter;
    return matchMomento && matchSearch && matchCat;
  });

  const currentSelection = modal ? plan[modal.dia]?.[modal.momento] : null;

  return (
    <>
      <p className="section-title">Plan semanal</p>
      <p className="section-sub">Toca cualquier celda para elegir el plato</p>

      <div className="plan-scroll">
        <div className="plan-grid">
          {/* Header */}
          <div />
          {dias.map(d => (
            <div key={d} className="plan-header-cell">{d.slice(0, 3)}</div>
          ))}

          {/* Rows */}
          {momentos.map(momento => (
            <React.Fragment key={momento}>
              <div className="plan-moment-label">
                {momento === 'Desayuno' ? '🌅' : momento === 'Comida' ? '☀️' : '🌙'} {momento}
              </div>
              {dias.map(dia => {
                const platoId = plan[dia]?.[momento];
                const plato = platoId ? getPlatoById(platoId) : null;
                return (
                  <div
                    key={dia}
                    className={`plan-cell ${plato ? 'filled' : ''}`}
                    onClick={() => openModal(dia, momento)}
                  >
                    {plato ? (
                      <span className="plan-cell-name">{plato.nombre}</span>
                    ) : (
                      <span className="plan-cell-empty">＋</span>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-header">
              <span className="modal-title">
                {modal.momento} · {modal.dia}
              </span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-search">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar plato…"
                autoComplete="off"
              />
            </div>

            <div className="modal-cats">
              {CATS.filter(c => c === 'Todo' || filteredPlatos.some(p => p.categoria === c) || catFilter === c).map(c => (
                <button
                  key={c}
                  className={`cat-filter ${catFilter === c ? 'active' : ''}`}
                  onClick={() => setCatFilter(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="modal-list">
              {currentSelection && (
                <div className="clear-option" onClick={() => selectPlato(null)}>
                  <span>🗑️</span> Quitar plato
                </div>
              )}
              {filteredPlatos.map(p => (
                <div
                  key={p.id}
                  className={`plato-option ${currentSelection === p.id ? 'selected' : ''}`}
                  onClick={() => selectPlato(p.id)}
                >
                  <span className={`chip ${CAT_CLASS[p.categoria] || ''}`}>{p.categoria}</span>
                  <span className="plato-option-name">{p.nombre}</span>
                  <div className="plato-option-check">
                    {currentSelection === p.id ? '✓' : ''}
                  </div>
                </div>
              ))}
              {filteredPlatos.length === 0 && (
                <p style={{ color: 'var(--text3)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
                  No hay platos con ese nombre
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
