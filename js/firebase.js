/**
 * Inicialización de Firebase (App, Auth y Firestore).
 * Usa los SDK modulares vía CDN (v10).
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Mantener la sesión iniciada entre recargas.
setPersistence(auth, browserLocalPersistence).catch((e) =>
  console.warn("No se pudo establecer la persistencia de Auth:", e)
);

// Habilitar caché offline (sincronización en tiempo real entre dispositivos).
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === "failed-precondition") {
    console.warn("Persistencia offline: varias pestañas abiertas.");
  } else if (err.code === "unimplemented") {
    console.warn("Persistencia offline no soportada por este navegador.");
  }
});
