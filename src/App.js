import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import PlanSemanal from './components/PlanSemanal';
import ListaCompra from './components/ListaCompra';
import Catalogo from './components/Catalogo';
import AnadirPlato from './components/AnadirPlato';
import EditarReceta from './components/EditarReceta';
import Ingredientes from './components/Ingredientes';
import './App.css';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const MOMENTOS = ['Desayuno', 'Comida', 'Cena'];

const NAV = [
  { id: 'plan', label: 'Plan', icon: '🗓️' },
  { id: 'compra', label: 'Compra', icon: '🛒' },
  { id: 'catalogo', label: 'Recetas', icon: '🍽️' },
  { id: 'ingredientes', label: 'Ingred.', icon: '🥕' },
];

const emptyPlan = () => {
  const p = {};
  DIAS.forEach(d => { p[d] = {}; MOMENTOS.forEach(m => { p[d][m] = null; }); });
  return p;
};

export default function App() {
  const [tab, setTab] = useState('plan');
  const [catalogoView, setCatalogoView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingPlato, setEditingPlato] = useState(null);
  const [platos, setPlatos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [plan, setPlan] = useState(emptyPlan());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, i, r, pl] = await Promise.all([
        api.getPlatos(),
        api.getIngredientes(),
        api.getRecetas(),
        api.getPlanSemanal(),
      ]);
      setPlatos(p.data || []);
      setIngredientes(i.data || []);
      setRecetas(r.data || []);
      // Merge plan from server with empty structure
      const base = emptyPlan();
      if (pl.data) {
        Object.keys(pl.data).forEach(d => {
          if (base[d]) Object.assign(base[d], pl.data[d]);
        });
      }
      setPlan(base);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const updatePlan = async (dia, momento, platoId) => {
    const next = { ...plan, [dia]: { ...plan[dia], [momento]: platoId } };
    setPlan(next);
    setSaving(true);
    try { await api.setPlanSemanal(next); } catch (_) {}
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

  const updateReceta = async (id, platoData, ingRows) => {
    await api.updatePlato(id, platoData);
    await api.updateRecetaIngredientes(id, ingRows);
    await loadData();
  };

  const getPlatoById = (id) => platos.find(p => p.id === id);

  // Build lista de la compra
  const generarLista = () => {
    const totales = {};
    DIAS.forEach(dia => {
      MOMENTOS.forEach(momento => {
        const platoId = plan[dia][momento];
        if (!platoId) return;
        const recetasPlato = recetas.filter(r => String(r.idPlato) === String(platoId));
        recetasPlato.forEach(r => {
          const key = r.idIngrediente;
          if (!totales[key]) {
            const ing = ingredientes.find(i => String(i.id) === String(key));
            totales[key] = { nombre: ing?.nombre || key, unidad: ing?.unidad || '', cantidad: 0, categoria: ing?.categoria || 'Otros' };
          }
          const cant = parseFloat(r.cantidad);
          if (!isNaN(cant)) totales[key].cantidad += cant;
        });
      });
    });
    return Object.values(totales).sort((a, b) => a.categoria.localeCompare(b.categoria));
  };

  const configured = !!process.env.REACT_APP_SCRIPT_URL;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <span className="header-logo">🌿</span>
          <h1 className="header-title">Mi Dieta</h1>
          {saving && <span className="saving-badge">Guardando…</span>}
        </div>
      </header>

      {/* Content */}
      <main className="app-main">
        {!configured && (
          <div className="config-banner">
            <span>⚙️</span>
            <p>Configura la URL del Apps Script en <code>.env</code> para conectar con Google Sheets</p>
          </div>
        )}

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
                plan={plan}
                platos={platos}
                dias={DIAS}
                momentos={MOMENTOS}
                onUpdate={updatePlan}
                getPlatoById={getPlatoById}
              />
            )}
            {tab === 'compra' && (
              <ListaCompra
                lista={generarLista()}
                plan={plan}
                platos={platos}
                dias={DIAS}
                momentos={MOMENTOS}
              />
            )}
            {tab === 'catalogo' && catalogoView === 'list' && (
              <Catalogo
                platos={platos}
                recetas={recetas}
                ingredientes={ingredientes}
                onAnadir={() => setCatalogoView('add')}
                onEditar={(plato) => { setEditingPlato(plato); setCatalogoView('edit'); }}
              />
            )}
            {tab === 'catalogo' && catalogoView === 'add' && (
              <AnadirPlato
                ingredientes={ingredientes}
                onAdd={addPlato}
                onDone={() => setCatalogoView('list')}
              />
            )}
            {tab === 'catalogo' && catalogoView === 'edit' && editingPlato && (
              <EditarReceta
                plato={editingPlato}
                recetasPlato={recetas.filter(r => String(r.idPlato) === String(editingPlato.id))}
                ingredientes={ingredientes}
                onUpdate={updateReceta}
                onDone={() => { setEditingPlato(null); setCatalogoView('list'); }}
              />
            )}
            {tab === 'ingredientes' && (
              <Ingredientes
                ingredientes={ingredientes}
                onUpdate={updateIngrediente}
                onAdd={addIngrediente}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Nav */}
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
