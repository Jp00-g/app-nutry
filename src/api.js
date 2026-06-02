import {
  collection, doc, getDocs, getDoc,
  setDoc, addDoc, updateDoc, deleteDoc,
  writeBatch, query, where,
} from 'firebase/firestore';
import { db } from './firebase';

const toArr = (snap) => snap.docs.map(d => ({ id: d.id, ...d.data() }));

const DEFAULT_CATEGORIAS = [
  { nombre: 'CARNES',          momentos: ['Comidas', 'Cenas'],              colorClass: 'cat-carnes',    orden: 1  },
  { nombre: 'ENSALADAS',       momentos: ['Comidas', 'Cenas'],              colorClass: 'cat-ensaladas', orden: 2  },
  { nombre: 'CUCHARA',         momentos: ['Comidas', 'Cenas'],              colorClass: 'cat-cuchara',   orden: 3  },
  { nombre: 'PASTA',           momentos: ['Comidas'],                       colorClass: 'cat-pasta',     orden: 4  },
  { nombre: 'ARROZ',           momentos: ['Comidas'],                       colorClass: 'cat-arroz',     orden: 5  },
  { nombre: 'PESCADO',         momentos: ['Comidas'],                       colorClass: 'cat-pescado',   orden: 6  },
  { nombre: 'WRAP',            momentos: ['Cenas'],                         colorClass: 'cat-wrap',      orden: 7  },
  { nombre: 'TOSTAS/SANDWICH', momentos: ['Cenas'],                         colorClass: '',              orden: 8  },
  { nombre: 'PLATO',           momentos: ['Cenas'],                         colorClass: 'cat-otros',     orden: 9  },
  { nombre: 'OTROS',           momentos: ['Comidas', 'Cenas'],              colorClass: '',              orden: 10 },
  { nombre: 'DULCE',           momentos: ['Desayunos'],                     colorClass: '',              orden: 11 },
  { nombre: 'TOSTAS',          momentos: ['Desayunos'],                     colorClass: '',              orden: 12 },
  { nombre: 'SMOOTHIE',        momentos: ['Desayunos'],                     colorClass: '',              orden: 13 },
  { nombre: 'OTROS',           momentos: ['Desayunos'],                     colorClass: '',              orden: 14 },
];

export const api = {
  getPlatos: () => getDocs(collection(db, 'platos')).then(toArr),

  getIngredientes: () => getDocs(collection(db, 'ingredientes')).then(toArr),

  getRecetas: () => getDocs(collection(db, 'recetas')).then(toArr),

  getCategorias: async () => {
    const snap = await getDocs(collection(db, 'categorias'));
    if (!snap.empty) return toArr(snap).sort((a, b) => a.orden - b.orden);
    const batch = writeBatch(db);
    DEFAULT_CATEGORIAS.forEach(cat => batch.set(doc(collection(db, 'categorias')), cat));
    await batch.commit();
    const fresh = await getDocs(collection(db, 'categorias'));
    return toArr(fresh).sort((a, b) => a.orden - b.orden);
  },

  getPlanSemana: async (n) => {
    const snap = await getDoc(doc(db, 'config', `semana${n}`));
    if (snap.exists()) return snap.data();
    if (n === 1) {
      const old = await getDoc(doc(db, 'config', 'planSemanal'));
      return old.exists() ? old.data() : {};
    }
    return {};
  },

  setPlanSemana: (n, plan) => setDoc(doc(db, 'config', `semana${n}`), plan),

  addPlato: async (plato, ingredientes) => {
    const platoRef = await addDoc(collection(db, 'platos'), plato);
    const batch = writeBatch(db);
    (ingredientes || []).forEach(ing => {
      batch.set(doc(collection(db, 'recetas')), {
        idPlato:       platoRef.id,
        nombrePlato:   plato.nombre,
        idIngrediente: ing.id,
        nombreIng:     ing.nombre,
        cantidad:      ing.cantidad,
        unidad:        ing.unidad,
        notas:         ing.notas || '',
      });
    });
    await batch.commit();
    return { id: platoRef.id };
  },

  updateIngrediente: (id, data) => updateDoc(doc(db, 'ingredientes', id), data),

  addIngrediente: async (data) => {
    const ref = await addDoc(collection(db, 'ingredientes'), data);
    return { id: ref.id };
  },

  updatePlato: (id, data) => updateDoc(doc(db, 'platos', id), data),

  deletePlato: async (id) => {
    const q = query(collection(db, 'recetas'), where('idPlato', '==', id));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));
    batch.delete(doc(db, 'platos', id));
    await batch.commit();
  },

  deleteIngrediente: (id) => deleteDoc(doc(db, 'ingredientes', id)),

  getOtros: () => getDocs(collection(db, 'otros')).then(toArr),

  addOtro: async (data) => {
    const ref = await addDoc(collection(db, 'otros'), data);
    return { id: ref.id };
  },

  updateOtro: (id, data) => updateDoc(doc(db, 'otros', id), data),

  deleteOtro: (id) => deleteDoc(doc(db, 'otros', id)),

  getCategoriasOtros: () =>
    getDocs(collection(db, 'categoriasOtros')).then(snap =>
      toArr(snap).sort((a, b) => a.nombre.localeCompare(b.nombre))
    ),

  addCategoriaOtros: async (data) => {
    const ref = await addDoc(collection(db, 'categoriasOtros'), data);
    return { id: ref.id };
  },

  updateCategoriaOtros: (id, data) => updateDoc(doc(db, 'categoriasOtros', id), data),

  deleteCategoriaOtros: (id) => deleteDoc(doc(db, 'categoriasOtros', id)),

  updateRecetaIngredientes: async (platoId, ingredientes) => {
    const q = query(collection(db, 'recetas'), where('idPlato', '==', platoId));
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach(d => batch.delete(d.ref));

    const platoSnap = await getDoc(doc(db, 'platos', platoId));
    const nombrePlato = platoSnap.exists() ? platoSnap.data().nombre : '';

    (ingredientes || []).forEach(ing => {
      batch.set(doc(collection(db, 'recetas')), {
        idPlato:       platoId,
        nombrePlato,
        idIngrediente: ing.id,
        nombreIng:     ing.nombre,
        cantidad:      ing.cantidad,
        unidad:        ing.unidad,
        notas:         ing.notas || '',
      });
    });
    await batch.commit();
  },
};
