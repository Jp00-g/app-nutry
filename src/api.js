const APPS_SCRIPT_URL =
  process.env.NODE_ENV === 'development'
    ? '/gas-proxy'
    : process.env.REACT_APP_SCRIPT_URL || '';

const call = async (action, payload = {}) => {
  const url = `${APPS_SCRIPT_URL}?action=${action}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
};

export const api = {
  getPlatos: () => call('getPlatos'),
  getIngredientes: () => call('getIngredientes'),
  getRecetas: () => call('getRecetas'),
  getPlanSemanal: () => call('getPlanSemanal'),
  setPlanSemanal: (plan) => call('setPlanSemanal', { plan }),
  addPlato: (plato, ingredientes) => call('addPlato', { plato, ingredientes }),
  updateIngrediente: (id, data) => call('updateIngrediente', { id, ...data }),
  addIngrediente: (data) => call('addIngrediente', data),
  updatePlato: (id, data) => call('updatePlato', { id, ...data }),
  updateRecetaIngredientes: (platoId, ingredientes) => call('updateRecetaIngredientes', { platoId, ingredientes }),
};
