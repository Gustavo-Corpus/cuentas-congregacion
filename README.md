# 💛 Cuentas de Congregación — Araucarias

Aplicación web para la gestión de las cuentas de la congregación **Araucarias** (Xalapa, Veracruz). Permite registrar donaciones, gastos, depósitos, traspasos y movimientos de caja chica, calcular automáticamente el resumen mensual y **generar los formularios oficiales S-26, S-30 y TO-62 en PDF, prellenados** y listos para imprimir o enviar.

- **Hosting:** GitHub Pages (sitio estático, sin servidor)
- **Backend:** Firebase (Firestore + Authentication)
- **Sincronización en tiempo real** entre dispositivos (PC y móvil)
- **Tema oscuro** profesional y responsive
- **Moneda:** Pesos mexicanos (MXN)

## Entrar

Puedes ver el proyecto desplegado en: [Enlace a GitHub Pages](https://gustavo-corpus.github.io/cuentas-congregacion/)


## 📁 Estructura del proyecto

```
cuentas_congregacion/
├── index.html                  # Pantalla de inicio de sesión
├── app.html                    # Panel principal (dashboard)
├── firestore.rules             # Reglas de seguridad de Firestore
├── README.md
├── css/
│   └── styles.css              # Tema oscuro y estilos
├── js/
│   ├── firebase-config.js      # ⚙️ TU configuración de Firebase (editar)
│   ├── firebase-config.example.js
│   ├── firebase.js             # Inicialización de Firebase
│   ├── auth.js                 # Autenticación
│   ├── db.js                   # Acceso a datos (Firestore)
│   ├── calculations.js         # Motor de cálculo contable (S-26/S-30/TO-62)
│   ├── pdf-fields.js           # Mapeo de campos de los PDF originales
│   ├── pdf-generator.js        # Relleno y descarga de los PDF
│   └── app.js                  # Controlador principal de la interfaz
└── assets/
    ├── analisis_formularios.md # Documento de referencia de los formularios
    └── templates/              # PDFs oficiales (plantillas que se rellenan)
        ├── S-26_S.pdf
        ├── S-30_S.pdf
        └── TO-62_S.pdf
```