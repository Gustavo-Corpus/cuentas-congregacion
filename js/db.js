/**
 * Capa de acceso a datos (Firestore).
 * Todos los datos se guardan bajo `usuarios/{uid}/...` para aislar al usuario.
 *
 * Estructura:
 *   usuarios/{uid}/meses/{mesId}              -> documento de mes contable
 *   usuarios/{uid}/meses/{mesId}/transacciones/{txId}
 *
 *   mesId tiene el formato "AAAA-MM" (ej. "2026-06").
 */
import { db, auth } from "./firebase.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function uid() {
  if (!auth.currentUser) throw new Error("No hay usuario autenticado.");
  return auth.currentUser.uid;
}

const mesesCol = () => collection(db, "usuarios", uid(), "meses");
const mesRef = (mesId) => doc(db, "usuarios", uid(), "meses", mesId);
const txCol = (mesId) =>
  collection(db, "usuarios", uid(), "meses", mesId, "transacciones");
const txRef = (mesId, txId) =>
  doc(db, "usuarios", uid(), "meses", mesId, "transacciones", txId);

/* --------------------------- MESES CONTABLES --------------------------- */

/** Crea (o devuelve) un mes contable. mesId = "AAAA-MM". */
export async function crearMes(mesId, datos) {
  const ref = mesRef(mesId);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data();
  const data = {
    id: mesId,
    year: datos.year,
    month: datos.month, // 1-12
    estado: "abierto",
    saldoAnterior: datos.saldoAnterior || {
      recibido: 0,
      principal: 0,
      secundaria: 0
    },
    resolucionOM: datos.resolucionOM || 0,
    to62: datos.to62 || {},
    conciliacion: datos.conciliacion || {},
    createdAt: serverTimestamp()
  };
  await setDoc(ref, data);
  return data;
}

export async function obtenerMes(mesId) {
  const snap = await getDoc(mesRef(mesId));
  return snap.exists() ? snap.data() : null;
}

export async function actualizarMes(mesId, cambios) {
  await updateDoc(mesRef(mesId), cambios);
}

export async function eliminarMes(mesId) {
  // Borra transacciones primero
  const txs = await getDocs(txCol(mesId));
  await Promise.all(txs.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(mesRef(mesId));
}

/** Lista todos los meses (una sola vez). */
export async function listarMeses() {
  const snap = await getDocs(query(mesesCol(), orderBy("id", "desc")));
  return snap.docs.map((d) => d.data());
}

/** Observa la lista de meses en tiempo real. */
export function observarMeses(cb) {
  return onSnapshot(query(mesesCol(), orderBy("id", "desc")), (snap) => {
    cb(snap.docs.map((d) => d.data()));
  });
}

/* ----------------------------- TRANSACCIONES ----------------------------- */

export async function agregarTransaccion(mesId, tx) {
  const ref = await addDoc(txCol(mesId), {
    ...tx,
    createdAt: serverTimestamp()
  });
  return ref.id;
}

export async function actualizarTransaccion(mesId, txId, cambios) {
  await updateDoc(txRef(mesId, txId), cambios);
}

export async function eliminarTransaccion(mesId, txId) {
  await deleteDoc(txRef(mesId, txId));
}

/** Observa las transacciones de un mes en tiempo real (ordenadas por fecha). */
export function observarTransacciones(mesId, cb) {
  const q = query(txCol(mesId), orderBy("fecha", "asc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

/** Obtiene las transacciones de un mes una sola vez. */
export async function obtenerTransacciones(mesId) {
  const snap = await getDocs(query(txCol(mesId), orderBy("fecha", "asc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
