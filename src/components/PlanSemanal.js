import React, { useState } from 'react';

const MOMENTO_MAP = { 'Desayuno': 'Desayunos', 'Comida': 'Comidas', 'Cena': 'Cenas' };

const getEntryId = (entry) => entry && typeof entry === 'object' ? entry.id : entry;
const getEntryPersonas = (entry) => entry && typeof entry === 'object' ? (entry.personas || 1) : 1;

function SemanaGrid({ weekIdx, plan, platos, dias, momentos, categorias, onUpdate, getPlatoById }) {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todo');
  const [personasStep, setPersonasStep] = useState(null); // { id, personas }

  const openModal = (dia, momento) => {
    setSearch('');
    setCatFilter('Todo');
    setPersonasStep(null);
    setModal({ dia, momento });
  };
  const closeModal = () => { setModal(null); setPersonasStep(null); };

  const selectPlato = (id) => {
    if (id === null) {
      onUpdate(weekIdx, modal.dia, modal.momento, null, 1);
      closeModal();
      return;
    }
    const currentEntry = plan[modal.dia]?.[modal.momento];
    const currentId = getEntryId(currentEntry);
    const currentPersonas = id === currentId ? getEntryPersonas(currentEntry) : 1;
    setPersonasStep({ id, personas: currentPersonas });
  };

  const confirmPersonas = () => {
    onUpdate(weekIdx, modal.dia, modal.momento, personasStep.id, personasStep.personas);
    closeModal();
  };

  const catColorMap = Object.fromEntries(categorias.map(c => [c.nombre, c.colorClass]));
  const catsForModal = modal
    ? ['Todo', ...categorias.filter(c => c.momentos.includes(MOMENTO_MAP[modal.momento])).map(c => c.nombre)]
    : ['Todo'];

  const filteredPlatos = platos.filter(p => {
    const matchMomento = modal ? (
      p.momento === MOMENTO_MAP[modal.momento] ||
      (p.momento === 'Comidas o cenas' && (modal.momento === 'Comida' || modal.momento === 'Cena')) ||
      (p.momento === 'Desayunos o cenas' && (modal.momento === 'Desayuno' || modal.momento === 'Cena'))
    ) : true;
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Todo' || p.categoria === catFilter;
    return matchMomento && matchSearch && matchCat;
  }).sort((a, b) => {
    const catDiff = (a.categoria || '').localeCompare(b.categoria || '');
    return catDiff !== 0 ? catDiff : a.nombre.localeCompare(b.nombre);
  });

  const currentEntry = modal ? plan[modal.dia]?.[modal.momento] : null;
  const currentSelectionId = getEntryId(currentEntry);

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
                const entry = plan[dia]?.[momento];
                const platoId = getEntryId(entry);
                const personas = getEntryPersonas(entry);
                const plato = platoId ? getPlatoById(platoId) : null;
                return (
                  <div
                    key={dia}
                    className={`plan-cell ${plato ? 'filled' : ''}`}
                    onClick={() => openModal(dia, momento)}
                  >
                    {plato
                      ? <>
                          <span className="plan-cell-name">{plato.nombre}</span>
                          {personas > 1 && <span className="plan-cell-personas">×{personas}</span>}
                        </>
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
              <span className="modal-title">
                {personasStep && (
                  <button className="modal-back" onClick={() => setPersonasStep(null)}>←</button>
                )}
                {modal.momento} · {modal.dia}
              </span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {personasStep ? (
              <div className="personas-step">
                <p className="personas-step-plato">{getPlatoById(personasStep.id)?.nombre}</p>
                <p className="personas-step-label">¿Para cuántas personas?</p>
                <div className="personas-counter">
                  <button
                    className="personas-counter-btn"
                    onClick={() => setPersonasStep(s => ({ ...s, personas: Math.max(1, s.personas - 1) }))}
                  >−</button>
                  <span className="personas-counter-val">{personasStep.personas}</span>
                  <button
                    className="personas-counter-btn"
                    onClick={() => setPersonasStep(s => ({ ...s, personas: Math.min(20, s.personas + 1) }))}
                  >+</button>
                </div>
                <button className="btn-primary personas-confirm" onClick={confirmPersonas}>
                  Confirmar
                </button>
              </div>
            ) : (
              <>
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
                  {currentSelectionId && (
                    <div className="clear-option" onClick={() => selectPlato(null)}>
                      <span>🗑️</span> Quitar plato
                    </div>
                  )}
                  {filteredPlatos.map(p => (
                    <div
                      key={p.id}
                      className={`plato-option ${currentSelectionId === p.id ? 'selected' : ''}`}
                      onClick={() => selectPlato(p.id)}
                    >
                      <span className={`chip ${catColorMap[p.categoria] || ''}`}>{p.categoria}</span>
                      <span className="plato-option-name">{p.nombre}</span>
                      <div className="plato-option-check">{currentSelectionId === p.id ? '✓' : ''}</div>
                    </div>
                  ))}
                  {filteredPlatos.length === 0 && (
                    <p style={{ color: 'var(--text3)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
                      No hay recetas con ese nombre
                    </p>
                  )}
                </div>
              </>
            )}
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
