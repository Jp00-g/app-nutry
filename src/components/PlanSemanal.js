import React, { useState } from 'react';

const MOMENTO_MAP = { 'Desayuno': 'Desayunos', 'Comida': 'Comidas', 'Cena': 'Cenas' };

function SemanaGrid({ weekIdx, plan, platos, dias, momentos, categorias, onUpdate, getPlatoById }) {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todo');

  const openModal = (dia, momento) => {
    setSearch('');
    setCatFilter('Todo');
    setModal({ dia, momento });
  };
  const closeModal = () => setModal(null);
  const selectPlato = (id) => {
    onUpdate(weekIdx, modal.dia, modal.momento, id);
    closeModal();
  };

  const catColorMap = Object.fromEntries(categorias.map(c => [c.nombre, c.colorClass]));
  const catsForModal = modal
    ? ['Todo', ...categorias.filter(c => c.momentos.includes(MOMENTO_MAP[modal.momento])).map(c => c.nombre)]
    : ['Todo'];

  const filteredPlatos = platos.filter(p => {
    const matchMomento = modal ? p.momento === MOMENTO_MAP[modal.momento] : true;
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Todo' || p.categoria === catFilter;
    return matchMomento && matchSearch && matchCat;
  });

  const currentSelection = modal ? plan[modal.dia]?.[modal.momento] : null;

  return (
    <>
      <div className="plan-scroll">
        <div className="plan-grid">
          <div />
          {dias.map(d => (
            <div key={d} className="plan-header-cell">{d.slice(0, 3)}</div>
          ))}
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
                    {plato
                      ? <span className="plan-cell-name">{plato.nombre}</span>
                      : <span className="plan-cell-empty">＋</span>
                    }
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-header">
              <span className="modal-title">{modal.momento} · {modal.dia}</span>
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
              {catsForModal.filter(c => c === 'Todo' || filteredPlatos.some(p => p.categoria === c) || catFilter === c).map(c => (
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
                  <span className={`chip ${catColorMap[p.categoria] || ''}`}>{p.categoria}</span>
                  <span className="plato-option-name">{p.nombre}</span>
                  <div className="plato-option-check">{currentSelection === p.id ? '✓' : ''}</div>
                </div>
              ))}
              {filteredPlatos.length === 0 && (
                <p style={{ color: 'var(--text3)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
                  No hay recetas con ese nombre
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PlanSemanal({ plans, platos, dias, momentos, categorias, onUpdate, onClear, getPlatoById }) {
  const [confirmClear, setConfirmClear] = useState(null); // weekIdx

  return (
    <>
      <p className="section-title">Plan semanal</p>
      <p className="section-sub">Edita cualquier semana tocando una celda</p>

      {plans.map((plan, i) => (
        <div key={i} className="semana-seccion">
          <div className="semana-seccion-header">
            <span className="semana-seccion-num">Semana {i + 1}</span>
            <button
              className="btn-secondary"
              style={{ padding: '4px 12px', fontSize: 12 }}
              onClick={() => setConfirmClear(i)}
            >
              Limpiar
            </button>
          </div>
          <SemanaGrid
            weekIdx={i}
            plan={plan}
            platos={platos}
            dias={dias}
            momentos={momentos}
            categorias={categorias}
            onUpdate={onUpdate}
            getPlatoById={getPlatoById}
          />
        </div>
      ))}

      {confirmClear !== null && (
        <div className="modal-overlay centered" onClick={() => setConfirmClear(null)}>
          <div className="confirm-sheet" onClick={e => e.stopPropagation()}>
            <div className="confirm-title">¿Limpiar semana {confirmClear + 1}?</div>
            <div className="confirm-body">
              Se eliminarán todos los platos de la semana. Esta acción no se puede deshacer.
            </div>
            <div className="confirm-btns">
              <button className="btn-secondary" onClick={() => setConfirmClear(null)}>Cancelar</button>
              <button className="btn-danger" onClick={() => { onClear(confirmClear); setConfirmClear(null); }}>
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
