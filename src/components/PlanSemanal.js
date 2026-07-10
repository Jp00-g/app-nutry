import React, { useState, useMemo } from 'react';

const MOMENTO_MAP = { 'Desayuno': 'Desayunos', 'Comida': 'Comidas', 'Cena': 'Cenas' };

const getEntryId = (entry) => entry && typeof entry === 'object' ? entry.id : entry;
const getEntryPersonas = (entry) => entry && typeof entry === 'object' ? (entry.personas || 1) : 1;

function SemanaGrid({ weekIdx, plan, platos, dias, momentos, categorias, onUpdate, getPlatoById }) {
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Todo');
  const [personasStep, setPersonasStep] = useState(null);

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

function ExtrasSection({ weekIdx, extras, platos, otros, ingredientes, onUpdate }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('recetas');
  const [search, setSearch] = useState('');
  const [personasStep, setPersonasStep] = useState(null);

  const recetasExtras = extras?.recetas || [];
  const otrosExtras = extras?.otros || [];
  const ingredientesExtras = extras?.ingredientes || [];

  const openModal = () => {
    setModalOpen(true);
    setSearch('');
    setModalTab('recetas');
    setPersonasStep(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPersonasStep(null);
  };

  const addReceta = (plato) => {
    setPersonasStep({ id: plato.id, nombre: plato.nombre, personas: 1 });
  };

  const confirmReceta = () => {
    onUpdate(weekIdx, {
      recetas: [...recetasExtras, { id: personasStep.id, nombre: personasStep.nombre, personas: personasStep.personas }],
      otros: otrosExtras,
      ingredientes: ingredientesExtras,
    });
    closeModal();
  };

  const addOtro = (otro) => {
    onUpdate(weekIdx, {
      recetas: recetasExtras,
      otros: [...otrosExtras, { id: otro.id, nombre: otro.nombre, categoria: otro.categoria || '', ubicacion: otro.ubicacion || 'Supermercado' }],
      ingredientes: ingredientesExtras,
    });
    closeModal();
  };

  const addIngrediente = (ing) => {
    onUpdate(weekIdx, {
      recetas: recetasExtras,
      otros: otrosExtras,
      ingredientes: [...ingredientesExtras, { id: ing.id, nombre: ing.nombre }],
    });
    closeModal();
  };

  const removeReceta = (idx) => {
    onUpdate(weekIdx, { recetas: recetasExtras.filter((_, i) => i !== idx), otros: otrosExtras, ingredientes: ingredientesExtras });
  };

  const removeOtro = (idx) => {
    onUpdate(weekIdx, { recetas: recetasExtras, otros: otrosExtras.filter((_, i) => i !== idx), ingredientes: ingredientesExtras });
  };

  const removeIngrediente = (idx) => {
    onUpdate(weekIdx, { recetas: recetasExtras, otros: otrosExtras, ingredientes: ingredientesExtras.filter((_, i) => i !== idx) });
  };

  const filteredPlatos = platos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
  const filteredOtros = otros.filter(o => o.nombre.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
  const groupedIngredientes = useMemo(() => {
    const filtered = (ingredientes || []).filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()));
    const map = filtered.reduce((acc, ing) => {
      const cat = ing.categoria || 'Sin categoría';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(ing);
      return acc;
    }, {});
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, ings]) => [cat, ings.sort((a, b) => a.nombre.localeCompare(b.nombre))]);
  }, [ingredientes, search]);
  const hasExtras = recetasExtras.length > 0 || otrosExtras.length > 0 || ingredientesExtras.length > 0;

  return (
    <div className="extras-section">
      <div className="extras-header">
        <span className="extras-title">Extra</span>
        <button className="btn-secondary extras-add-btn" onClick={openModal}>+ Añadir</button>
      </div>

      {hasExtras && (
        <div className="extras-chips">
          {recetasExtras.map((r, i) => (
            <div key={`r-${i}`} className="extras-chip extras-chip-receta">
              <span>{r.nombre}{r.personas > 1 ? ` ×${r.personas}` : ''}</span>
              <button className="extras-chip-remove" onClick={() => removeReceta(i)}>✕</button>
            </div>
          ))}
          {ingredientesExtras.map((ing, i) => (
            <div key={`ing-${i}`} className="extras-chip extras-chip-ingrediente">
              <span>{ing.nombre}</span>
              <button className="extras-chip-remove" onClick={() => removeIngrediente(i)}>✕</button>
            </div>
          ))}
          {otrosExtras.map((o, i) => (
            <div key={`o-${i}`} className="extras-chip extras-chip-otro">
              <span>{o.nombre}</span>
              <button className="extras-chip-remove" onClick={() => removeOtro(i)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-header">
              <span className="modal-title">
                {personasStep && (
                  <button className="modal-back" onClick={() => setPersonasStep(null)}>←</button>
                )}
                Añadir extra
              </span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            {personasStep ? (
              <div className="personas-step">
                <p className="personas-step-plato">{personasStep.nombre}</p>
                <p className="personas-step-label">¿Para cuántas personas?</p>
                <div className="personas-counter">
                  <button className="personas-counter-btn" onClick={() => setPersonasStep(s => ({ ...s, personas: Math.max(1, s.personas - 1) }))}>−</button>
                  <span className="personas-counter-val">{personasStep.personas}</span>
                  <button className="personas-counter-btn" onClick={() => setPersonasStep(s => ({ ...s, personas: Math.min(20, s.personas + 1) }))}>+</button>
                </div>
                <button className="btn-primary personas-confirm" onClick={confirmReceta}>Confirmar</button>
              </div>
            ) : (
              <>
                <div className="modal-tabs">
                  <button
                    className={`modal-tab ${modalTab === 'recetas' ? 'active' : ''}`}
                    onClick={() => { setModalTab('recetas'); setSearch(''); }}
                  >
                    🍽️ Recetas
                  </button>
                  <button
                    className={`modal-tab ${modalTab === 'ingredientes' ? 'active' : ''}`}
                    onClick={() => { setModalTab('ingredientes'); setSearch(''); }}
                  >
                    🥑 Ingredientes
                  </button>
                  <button
                    className={`modal-tab ${modalTab === 'otros' ? 'active' : ''}`}
                    onClick={() => { setModalTab('otros'); setSearch(''); }}
                  >
                    📦 Otros
                  </button>
                </div>
                <div className="modal-search">
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={modalTab === 'recetas' ? 'Buscar receta…' : modalTab === 'ingredientes' ? 'Buscar ingrediente…' : 'Buscar objeto…'}
                    autoComplete="off"
                  />
                </div>
                <div className="modal-list">
                  {modalTab === 'recetas' ? (
                    filteredPlatos.length > 0
                      ? filteredPlatos.map(p => (
                          <div key={p.id} className="plato-option" onClick={() => addReceta(p)}>
                            <span className="plato-option-name">{p.nombre}</span>
                          </div>
                        ))
                      : <p style={{ color: 'var(--text3)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>Sin resultados</p>
                  ) : modalTab === 'ingredientes' ? (
                    groupedIngredientes.length > 0
                      ? groupedIngredientes.map(([cat, ings]) => (
                          <div key={cat}>
                            <div className="compra-cat-title">{cat}</div>
                            {ings.map(ing => (
                              <div key={ing.id} className="plato-option" onClick={() => addIngrediente(ing)}>
                                <span className="plato-option-name">{ing.nombre}</span>
                              </div>
                            ))}
                          </div>
                        ))
                      : <p style={{ color: 'var(--text3)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
                          {(ingredientes || []).length === 0 ? 'Ve a la pestaña Ingred. para añadir ingredientes.' : 'Sin resultados'}
                        </p>
                  ) : (
                    filteredOtros.length > 0
                      ? filteredOtros.map(o => (
                          <div key={o.id} className="plato-option" onClick={() => addOtro(o)}>
                            <span className="plato-option-name">{o.nombre}</span>
                            {o.categoria && <span style={{ color: 'var(--text3)', fontSize: 12, flexShrink: 0 }}>{o.categoria}</span>}
                          </div>
                        ))
                      : <p style={{ color: 'var(--text3)', fontSize: 14, padding: '20px 0', textAlign: 'center' }}>
                          {otros.length === 0 ? 'Ve a la pestaña Otros para añadir objetos.' : 'Sin resultados'}
                        </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PlanSemanal({ plans, platos, dias, momentos, categorias, otros, ingredientes, onUpdate, onClear, onUpdateExtras, getPlatoById }) {
  const [confirmClear, setConfirmClear] = useState(null);

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
          <ExtrasSection
            weekIdx={i}
            extras={plan.extras}
            platos={platos}
            otros={otros}
            ingredientes={ingredientes}
            onUpdate={onUpdateExtras}
          />
        </div>
      ))}

      {confirmClear !== null && (
        <div className="modal-overlay centered" onClick={() => setConfirmClear(null)}>
          <div className="confirm-sheet" onClick={e => e.stopPropagation()}>
            <div className="confirm-title">¿Limpiar semana {confirmClear + 1}?</div>
            <div className="confirm-body">
              Se eliminarán todos los platos y extras de la semana. Esta acción no se puede deshacer.
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
