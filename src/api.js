import {
  collection, doc, getDocs, getDoc,
  setDoc, addDoc, updateDoc, deleteDoc,
  writeBatch, query, where,
} from 'firebase/firestore';
import { db } from './firebase';

const toArr = (snap) => snap.docs.map(d => ({ id: d.id, ...d.data() }));

export const api = {
  getPlatos: () => getDocs(collection(db, 'platos')).then(toArr),

  getIngredientes: () => getDocs(collection(db, 'ingredientes')).then(toArr),

  getRecetas: () => getDocs(collection(db, 'recetas')).then(toArr),

  getPlanSemana: async (n) => {
    const snap = await getDoc(doc(db, 'config', `semana${n}`));
    if (snap.exists()) return snap.data();
    // Fallback: semana 1 puede estar en el doc antiguo
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
