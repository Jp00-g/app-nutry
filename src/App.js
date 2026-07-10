import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import PlanSemanal from './components/PlanSemanal';
import ListaCompra from './components/ListaCompra';
import Catalogo from './components/Catalogo';
import AnadirPlato from './components/AnadirPlato';
import EditarReceta from './components/EditarReceta';
import Ingredientes from './components/Ingredientes';
import Otros from './components/Otros';
import './App.css';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MOMENTOS = ['Desayuno', 'Comida', 'Cena'];

const NAV = [
  { id: 'plan',         label: 'Plan',    icon: '📅' },
  { id: 'compra',       label: 'Compra',  icon: '🛒' },
  { id: 'catalogo',     label: 'Recetas', icon: '🍽️' },
  { id: 'ingredientes', label: 'Ingred.', icon: '🥑' },
  { id: 'otros',        label: 'Otros',   icon: '📦' },
];

const emptyPlan = () => {
  const p = {};
  DIAS.forEach(d => { p[d] = {}; MOMENTOS.forEach(m => { p[d][m] = null; }); });
  p.extras = { recetas: [], otros: [] };
  return p;
};

export default function App() {
  const [tab, setTab] = useState('plan');
  const [catalogoView, setCatalogoView] = useState('list');
  const [editingPlato, setEditingPlato] = useState(null);
  const [platos, setPlatos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [otros, setOtros] = useState([]);
  const [categoriasOtros, setCategoriasOtros] = useState([]);
  const [plans, setPlans] = useState([emptyPlan(), emptyPlan(), emptyPlan(), emptyPlan()]);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = React.useRef(null);
  const mainRef = React.useRef(null);
  const catalogoScrollRef = React.useRef(0);

  const showToast = useCallback((msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(''), 2000);
  }, []);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const [p, i, r, cats, otr, catOtr, pl1, pl2, pl3, pl4] = await Promise.all([
        api.getPlatos(),
        api.getIngredientes(),
        api.getRecetas(),
        api.getCategorias(),
        api.getOtros(),
        api.getCategoriasOtros(),
        api.getPlanSemana(1),
        api.getPlanSemana(2),
        api.getPlanSemana(3),
        api.getPlanSemana(4),
      ]);
      setPlatos(p || []);
      setIngredientes(i || []);
      setRecetas(r || []);
      setCategorias(cats || []);
      setOtros(otr || []);
      setCategoriasOtros(catOtr || []);
      setPlans([pl1, pl2, pl3, pl4].map(pl => {
        const base = emptyPlan();
        if (pl) {
          Object.keys(pl).forEach(d => {
            if (d === 'extras') return;
            if (base[d]) Object.keys(pl[d]).forEach(m => {
              const val = pl[d][m];
              if (!val) base[d][m] = null;
              else if (typeof val === 'string') base[d][m] = { id: val, personas: 1 };
              else base[d][m] = val;
            });
          });
          if (pl.extras) base.extras = pl.extras;
        }
        return base;
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const clearPlan = async (weekIdx) => {
    const empty = emptyPlan();
    const newPlans = [...plans];
    newPlans[weekIdx] = empty;
    setPlans(newPlans);
    setSaving(true);
    try { await api.setPlanSemana(weekIdx + 1, empty); } catch (_) {}
    setSaving(false);
  };

  const updatePlan = async (weekIdx, dia, momento, platoId, personas = 1) => {
    const cur = plans[weekIdx];
    const entry = platoId === null ? null : { id: platoId, personas };
    const next = { ...cur, [dia]: { ...cur[dia], [momento]: entry } };
    const newPlans = [...plans];
    newPlans[weekIdx] = next;
    setPlans(newPlans);
    setSaving(true);
    try { await api.setPlanSemana(weekIdx + 1, next); } catch (_) {}
    setSaving(false);
  };

  const updateExtras = async (weekIdx, extras) => {
    const cur = plans[weekIdx];
    const next = { ...cur, extras };
    const newPlans = [...plans];
    newPlans[weekIdx] = next;
    setPlans(newPlans);
    setSaving(true);
    try { await api.setPlanSemana(weekIdx + 1, next); } catch (_) {}
    setSaving(false);
  };

  const addPlato = async (platoData, ingredientesData) => {
    await api.addPlato(platoData, ingredientesData);
    await loadData();
  };

  const updateIngrediente = async (id, data) => {
    await api.updateIngrediente(id, data);
    await loadData();
  };

  const addIngrediente = async (data) => {
    await api.addIngrediente(data);
    await loadData();
  };

  const deletePlato = async (id) => {
    await api.deletePlato(id);
    await loadData(true);
  };

  const deleteIngrediente = async (id) => {
    await api.deleteIngrediente(id);
    await loadData(true);
  };

  const updateReceta = async (id, platoData, ingRows) => {
    await api.updatePlato(id, platoData);
    await api.updateRecetaIngredientes(id, ingRows);
    await loadData(true);
  };

  const addOtro = async (data) => {
    await api.addOtro(data);
    await loadData(true);
  };

  const updateOtro = async (id, data) => {
    await api.updateOtro(id, data);
    await loadData(true);
  };

  const deleteOtro = async (id) => {
    await api.deleteOtro(id);
    await loadData(true);
  };

  const addCategoriaOtros = async (data) => {
    await api.addCategoriaOtros(data);
    await loadData(true);
  };

  const updateCategoriaOtros = async (id, data) => {
    await api.updateCategoriaOtros(id, data);
    await loadData(true);
  };

  const deleteCategoriaOtros = async (id) => {
    await api.deleteCategoriaOtros(id);
    await loadData(true);
  };

  const getPlatoById = (id) => platos.find(p => p.id === id);

  const generarLista = useCallback((plan) => {
    const totales = {};

    DIAS.forEach(dia => {
      MOMENTOS.forEach(momento => {
        const entry = plan[dia]?.[momento];
        if (!entry) return;
        const platoId = typeof entry === 'object' ? entry.id : entry;
        const personas = typeof entry === 'object' ? (entry.personas || 1) : 1;
        if (!platoId) return;
        recetas.filter(r => String(r.idPlato) === String(platoId)).forEach(r => {
          const key = r.nombreIng;
          if (!totales[key]) {
            const ing = ingredientes.find(i => String(i.id) === String(r.idIngrediente))
                     || ingredientes.find(i => i.nombre === r.nombreIng);
            totales[key] = { nombre: r.nombreIng, unidad: ing?.unidad || r.unidad || '', cantidad: 0, categoria: ing?.categoria || 'Otros', ubicacion: ing?.ubicacion || 'Supermercado' };
          }
          const cant = parseFloat(String(r.cantidad).replace(',', '.'));
          if (!isNaN(cant)) totales[key].cantidad += cant * personas;
        });
      });
    });

    (plan.extras?.recetas || []).forEach(({ id, personas = 1 }) => {
      recetas.filter(r => String(r.idPlato) === String(id)).forEach(r => {
        const key = r.nombreIng;
        if (!totales[key]) {
          const ing = ingredientes.find(i => String(i.id) === String(r.idIngrediente))
                   || ingredientes.find(i => i.nombre === r.nombreIng);
          totales[key] = { nombre: r.nombreIng, unidad: ing?.unidad || r.unidad || '', cantidad: 0, categoria: ing?.categoria || 'Otros', ubicacion: ing?.ubicacion || 'Supermercado' };
        }
        const cant = parseFloat(String(r.cantidad).replace(',', '.'));
        if (!isNaN(cant)) totales[key].cantidad += cant * personas;
      });
    });

    (plan.extras?.otros || []).forEach(item => {
      const key = item.nombre;
      if (!totales[key]) {
        totales[key] = { nombre: item.nombre, unidad: '', cantidad: 0, categoria: item.categoria || 'Otros', ubicacion: item.ubicacion || 'Supermercado' };
      }
    });

    return Object.values(totales).sort((a, b) => a.categoria.localeCompare(b.categoria));
  }, [recetas, ingredientes]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <span className="header-logo">🌿</span>
          <h1 className="header-title">Nutry</h1>
          {saving && <span className="saving-badge">Guardando…</span>}
        </div>
      </header>

      <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>

      <main className="app-main" ref={mainRef}>
        {loading ? (
          <div className="loading-screen">
            <div className="loading-spinner" />
            <p>Cargando tu dieta…</p>
          </div>
        ) : error ? (
          <div className="error-screen">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={loadData} className="btn-primary">Reintentar</button>
          </div>
        ) : (
          <>
            {tab === 'plan' && (
              <PlanSemanal
                plans={plans}
                platos={platos}
                dias={DIAS}
                momentos={MOMENTOS}
                categorias={categorias}
                otros={otros}
                ingredientes={ingredientes}
                onUpdate={updatePlan}
                onClear={clearPlan}
                onUpdateExtras={updateExtras}
                getPlatoById={getPlatoById}
              />
            )}
            {tab === 'compra' && (
              <ListaCompra
                plans={plans}
                generarLista={generarLista}
                platos={platos}
                dias={DIAS}
                momentos={MOMENTOS}
              />
            )}
            {tab === 'catalogo' && catalogoView === 'list' && (
              <Catalogo
                platos={platos}
                recetas={recetas}
                categorias={categorias}
                onAnadir={() => {
                  catalogoScrollRef.current = mainRef.current?.scrollTop || 0;
                  setCatalogoView('add');
                }}
                onEditar={(plato) => {
                  catalogoScrollRef.current = mainRef.current?.scrollTop || 0;
                  setEditingPlato(plato);
                  setCatalogoView('edit');
                }}
                onDelete={deletePlato}
              />
            )}
            {tab === 'catalogo' && catalogoView === 'add' && (
              <AnadirPlato
                ingredientes={ingredientes}
                categorias={categorias}
                onAdd={addPlato}
                onDone={() => {
                  setCatalogoView('list');
                  requestAnimationFrame(() => {
                    if (mainRef.current) mainRef.current.scrollTop = catalogoScrollRef.current;
                  });
                }}
              />
            )}
            {tab === 'catalogo' && catalogoView === 'edit' && editingPlato && (
              <EditarReceta
                plato={editingPlato}
                recetasPlato={recetas.filter(r => String(r.idPlato) === String(editingPlato.id))}
                ingredientes={ingredientes}
                categorias={categorias}
                onUpdate={updateReceta}
                onDone={() => {
                  setEditingPlato(null);
                  setCatalogoView('list');
                  requestAnimationFrame(() => {
                    if (mainRef.current) mainRef.current.scrollTop = catalogoScrollRef.current;
                  });
                }}
                onToast={showToast}
              />
            )}
            {tab === 'ingredientes' && (
              <Ingredientes
                ingredientes={ingredientes}
                onUpdate={updateIngrediente}
                onAdd={addIngrediente}
                onDelete={deleteIngrediente}
              />
            )}
            {tab === 'otros' && (
              <Otros
                otros={otros}
                categoriasOtros={categoriasOtros}
                onUpdate={updateOtro}
                onAdd={addOtro}
                onDelete={deleteOtro}
                onAddCat={addCategoriaOtros}
                onUpdateCat={updateCategoriaOtros}
                onDeleteCat={deleteCategoriaOtros}
              />
            )}
          </>
        )}
      </main>

      <nav className="bottom-nav">
        {NAV.map(n => (
          <button
            key={n.id}
            className={`nav-item ${tab === n.id ? 'active' : ''}`}
            onClick={() => { setTab(n.id); setCatalogoView('list'); }}
          >
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
