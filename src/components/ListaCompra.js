import React, { useState, useMemo } from 'react';

const UBICACION_ORDER = ['Supermercado', 'Mercado', 'Casa'];

function buildGrouped(lista) {
  const grouped = {};
  lista.forEach(item => {
    const ub = item.ubicacion || 'Supermercado';
    if (!grouped[ub]) grouped[ub] = {};
    const cat = item.categoria || 'Otros';
    if (!grouped[ub][cat]) grouped[ub][cat] = [];
    grouped[ub][cat].push(item);
  });
  return UBICACION_ORDER.filter(u => grouped[u]).map(u => ({ ubicacion: u, cats: grouped[u] }));
}

function exportText(lista, weekNum) {
  const grouped = buildGrouped(lista);
  const lines = [`🛒 LISTA DE LA COMPRA — Semana ${weekNum}`, ''];
  grouped.forEach(({ ubicacion, cats }) => {
    lines.push(`📍 ${ubicacion.toUpperCase()}`);
    Object.entries(cats).forEach(([cat, items]) => {
      lines.push(`  ── ${cat} ──`);
      items.forEach(i => {
        const cant = i.cantidad > 0 ? `${Math.round(i.cantidad)} ${i.unidad}` : '';
        lines.push(`    • ${i.nombre}${cant ? ` (${cant})` : ''}`);
      });
    });
    lines.push('');
  });
  return lines.join('\n');
}

function SemanaCard({ weekNum, lista, dias, momentos }) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState({});
  const [exportOpen, setExportOpen] = useState(false);

  const grouped = useMemo(() => buildGrouped(lista), [lista]);
  const toggle = (nombre) => setChecked(c => ({ ...c, [nombre]: !c[nombre] }));

  const share = async () => {
    const text = exportText(lista, weekNum);
    if (navigator.share) {
      await navigator.share({ title: `Lista semana ${weekNum}`, text });
    } else {
      await navigator.clipboard.writeText(text);
      alert('¡Copiado al portapapeles!');
    }
    setExportOpen(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(exportText(lista, weekNum));
    alert('¡Copiado!');
    setExportOpen(false);
  };

  return (
    <div className="semana-card">
      <div className="semana-card-header" onClick={() => setOpen(o => !o)}>
        <div>
          <span className="semana-card-title">Semana {weekNum}</span>
          <span className="semana-card-count">
            {lista.length > 0 ? `${lista.length} ingredientes` : 'Sin planificar'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {lista.length > 0 && (
            <button
              className="btn-secondary"
              style={{ padding: '5px 12px', fontSize: 12 }}
              onClick={e => { e.stopPropagation(); setExportOpen(true); }}
            >
              📤 Exportar
            </button>
          )}
          <span className="semana-card-arrow" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: 'var(--text3)' }}>▼</span>
        </div>
      </div>

      {open && lista.length > 0 && (
        <div className="semana-card-body">
          {grouped.map(({ ubicacion, cats }) => (
            <div key={ubicacion}>
              <div className="compra-ubicacion-title">{ubicacion}</div>
              {Object.entries(cats).map(([cat, items]) => (
                <div key={cat}>
                  <div className="compra-cat-title" style={{ position: 'static' }}>{cat}</div>
                  <div className="card" style={{ padding: '0 14px' }}>
                    {items.map(item => (
                      <div key={item.nombre} className="compra-item">
                        <div
                          className={`compra-check ${checked[item.nombre] ? 'done' : ''}`}
                          onClick={() => toggle(item.nombre)}
                        >
                          {checked[item.nombre] ? '✓' : ''}
                        </div>
                        <span className={`compra-item-name ${checked[item.nombre] ? 'done' : ''}`}>
                          {item.nombre}
                        </span>
                        {item.cantidad > 0 && (
                          <span className="compra-item-cant">
                            {Math.round(item.cantidad)} {item.unidad}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {open && lista.length === 0 && (
        <div className="semana-card-body" style={{ padding: '16px 0', color: 'var(--text3)', fontSize: 14, textAlign: 'center' }}>
          No hay recetas planificadas esta semana
        </div>
      )}

      {exportOpen && (
        <div className="export-modal" onClick={() => setExportOpen(false)}>
          <div className="export-sheet" onClick={e => e.stopPropagation()}>
            <h3>Exportar Semana {weekNum}</h3>
            <pre className="export-text">{exportText(lista, weekNum)}</pre>
            <div className="export-btns">
              <button className="btn-primary" style={{ flex: 1 }} onClick={share}>📱 Compartir</button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={copy}>📋 Copiar</button>
              <button className="btn-secondary" onClick={() => setExportOpen(false)}>✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ListaCompra({ plans, generarLista, dias, momentos }) {
  const listas = useMemo(
    () => plans.map(p => generarLista(p)),
    [plans, generarLista]
  );

  return (
    <>
      <p className="section-title">Lista de la compra</p>
      <p className="section-sub">Selecciona una semana para ver los ingredientes</p>
      <div className="compra-wrap">
        {listas.map((lista, i) => (
          <SemanaCard key={i} weekNum={i + 1} lista={lista} dias={dias} momentos={momentos} />
        ))}
      </div>
    </>
  );
}
