/**
 * Módulo de autenticación.
 * Envuelve Firebase Auth con helpers sencillos para la aplicación.
 */
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/** Inicia sesión con email y contraseña. */
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

/** Cierra la sesión actual. */
export function logout() {
  return signOut(auth);
}

/** Envía correo para restablecer la contraseña. */
export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Observa el estado de autenticación.
 * @param {(user: import("firebase/auth").User|null) => void} cb
 */
export function observeAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

/**
 * Protege una página: redirige a `redirectTo` si NO hay sesión.
 * Devuelve una promesa que resuelve con el usuario autenticado.
 */
export function requireAuth(redirectTo = "index.html") {
  return new Promise((resolve) => {
    observeAuth((user) => {
      if (user) {
        resolve(user);
      } else {
        window.location.replace(redirectTo);
      }
    });
  });
}

/** Traduce códigos de error de Firebase Auth a mensajes en español. */
export function authErrorMessage(code) {
  const map = {
    "auth/invalid-email": "El correo electrónico no es válido.",
    "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Inténtalo más tarde.",
    "auth/network-request-failed": "Error de red. Revisa tu conexión.",
    "auth/missing-password": "Ingresa tu contraseña."
  };
  return map[code] || "No se pudo iniciar sesión. Verifica tus datos.";
}
