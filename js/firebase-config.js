/**
 * ============================================================================
 *  CONFIGURACIÓN DE FIREBASE  (PLANTILLA)
 * ============================================================================
 *  1. Crea un proyecto en https://console.firebase.google.com
 *  2. Agrega una app web (</>) y copia el objeto `firebaseConfig`.
 *  3. Pega tus valores reales abajo.
 *  4. Habilita Authentication -> Email/Password.
 *  5. Crea una base de datos Firestore (modo producción) y aplica las reglas
 *     que aparecen en el README.md.
 *
 *  NOTA: Estos valores NO son secretos (son claves públicas de cliente). La
 *  seguridad real se aplica con las Reglas de Firestore y Authentication.
 * ============================================================================
 */

export const firebaseConfig = {
  apiKey: "AIzaSyAdOojXHV5TAeGOO3sKUIHooz8Ir3fB5A8",
  authDomain: "cuentas-araucarias.firebaseapp.com",
  projectId: "cuentas-araucarias",
  storageBucket: "cuentas-araucarias.firebasestorage.app",
  messagingSenderId: "621066441155",
  appId: "1:621066441155:web:2258e6c98cf82fd38ead76"
};

/**
 * Datos maestros de la congregación.
 * Edita estos valores para tu congregación.
 */
export const CONGREGACION = {
  nombre: "Araucarias",
  numero: "",                       // Número de congregación (opcional, para TO-62)
  ciudad: "Xalapa",
  provincia: "Veracruz",
  pais: "México",
  siervoCuentas: "Gustavo Eduardo Corpus Durón",
  moneda: "MXN",
  localeMoneda: "es-MX",
  // Email autorizado para iniciar sesión (solo informativo en la UI)
  emailAutorizado: "guscorpus40@gmail.com",
  // Tipo de cuenta principal: "caja_efectivo" | "bancaria"
  tipoCuentaPrincipal: "caja_efectivo"
};
