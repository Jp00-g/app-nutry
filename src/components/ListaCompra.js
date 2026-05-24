import React, { useState } from 'react';

export default function ListaCompra({ lista, plan, platos, dias, momentos }) {
  const [checked, setChecked] = useState({});
  const [exportOpen, setExportOpen] = useState(false);

  const toggle = (nombre) => setChecked(c => ({ ...c, [nombre]: !c[nombre] }));
  const resetChecked = () => setChecked({});

  const platosEnPlan = new Set();
  dias.forEach(d => momentos.forEach(m => { if (plan[d]?.[m]) platosEnPlan.add(plan[d][m]); }));
  const numPlatos = platosEnPlan.size;

  // Group by categoria
  const grouped = {};
  lista.forEach(item => {
    const cat = item.categoria || 'Otros';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const exportText = () => {
    const lines = ['🛒 LISTA DE LA COMPRA', ''];
    Object.entries(grouped).forEach(([cat, items]) => {
      lines.push(`── ${cat.toUpperCase()} ──`);
      items.forEach(i => {
        const cant = i.cantidad > 0 ? `${Math.round(i.cantidad)} ${i.unidad}` : '';
        lines.push(`  • ${i.nombre}${cant ? ` (${cant})` : ''}`);
      });
      lines.push('');
    });
    return lines.join('\n');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportText());
      alert('¡Copiado al portapapeles!');
    } catch {
      alert('No se pudo copiar. Selecciona el texto manualmente.');
    }
  };

  const shareText = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Lista de la compra', text: exportText() });
    } else {
      copyToClipboard();
    }
  };

  if (lista.length === 0) {
    return (
      <div className="compra-wrap">
        <p className="section-title">Lista de la compra</p>
        <div className="compra-empty">
          <div className="compra-empty-icon">🛒</div>
          <p>Aún no has seleccionado platos en el plan semanal.<br />¡Empieza por ahí!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="section-title">Lista de la compra</p>
      <p className="section-sub">{numPlatos} platos · {lista.length} ingredientes</p>

      <div className="compra-wrap">
        <div className="compra-actions">
          <button className="btn-primary" style={{ flex: 1 }} onClick={() => setExportOpen(true)}>
            📤 Exportar lista
          </button>
          <button className="btn-secondary" onClick={resetChecked}>
            🔄 Reiniciar
          </button>
        </div>

        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <div className="compra-cat-title">{cat}</div>
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

      {exportOpen && (
        <div className="export-modal" onClick={() => setExportOpen(false)}>
          <div className="export-sheet" onClick={e => e.stopPropagation()}>
            <h3>Exportar lista</h3>
            <pre className="export-text">{exportText()}</pre>
            <div className="export-btns">
              <button className="btn-primary" style={{ flex: 1 }} onClick={shareText}>
                📱 Compartir
              </button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={copyToClipboard}>
                📋 Copiar
              </button>
              <button className="btn-secondary" onClick={() => setExportOpen(false)}>
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
