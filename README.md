# 💛 Cuentas de Congregación — Araucarias

Aplicación web para la gestión de las cuentas de la congregación **Araucarias** (Xalapa, Veracruz). Permite registrar donaciones, gastos, depósitos, traspasos y movimientos de caja chica, calcular automáticamente el resumen mensual y **generar los formularios oficiales S-26, S-30 y TO-62 en PDF, prellenados** y listos para imprimir o enviar.

- **Hosting:** GitHub Pages (sitio estático, sin servidor)
- **Backend:** Firebase (Firestore + Authentication)
- **Sincronización en tiempo real** entre dispositivos (PC y móvil)
- **Tema oscuro** profesional y responsive
- **Moneda:** Pesos mexicanos (MXN)

---

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

> **Importante:** la carpeta `assets/templates/` debe subirse al repositorio: la app descarga esos PDF y los rellena en el navegador con [pdf-lib](https://pdf-lib.js.org/).

---

## 1️⃣ Configuración de Firebase

### a) Crear el proyecto
1. Entra a la [Consola de Firebase](https://console.firebase.google.com) e inicia sesión con `guscorpus40@gmail.com`.
2. **Agregar proyecto** → ponle un nombre (ej. `cuentas-araucarias`) → continúa hasta crearlo.

### b) Registrar la app web
1. En la página del proyecto, haz clic en el ícono **Web** `</>`.
2. Dale un apodo (ej. `cuentas-web`) y registra la app.
3. Copia el objeto `firebaseConfig` que aparece.

### c) Pegar la configuración
1. Copia la plantilla:
   ```bash
   cp js/firebase-config.example.js js/firebase-config.js
   ```
   *(o edita directamente el `js/firebase-config.js` que ya viene incluido).*
2. Reemplaza los valores `TU_API_KEY`, `TU_PROYECTO`, etc., con los tuyos.

> Estas claves **no son secretas**: son claves públicas de cliente. La seguridad real la dan las **Reglas de Firestore** y **Authentication**.

### d) Habilitar Authentication (Email/Password)
1. Menú lateral → **Authentication** → **Comenzar**.
2. Pestaña **Sign-in method** → habilita **Correo electrónico/contraseña**.
3. Pestaña **Users** → **Agregar usuario**:
   - Email: `guscorpus40@gmail.com`
   - Contraseña: la que elijas (esta será tu contraseña de acceso).

### e) Crear la base de datos Firestore
1. Menú lateral → **Firestore Database** → **Crear base de datos**.
2. Elige **modo de producción** y una región (ej. `nam5` / `us-central`).
3. Pestaña **Reglas** → pega el contenido de [`firestore.rules`](firestore.rules) y **Publica**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /usuarios/{uid}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

### f) Autorizar tu dominio de GitHub Pages
En **Authentication → Settings → Dominios autorizados**, agrega:
```
TU_USUARIO.github.io
```

---

## 2️⃣ Despliegue en GitHub Pages

### Opción A — Interfaz web de GitHub
1. Crea un repositorio (ej. `cuentas-araucarias`) en GitHub.
2. Sube **todos** los archivos del proyecto (incluida `assets/templates/`).
3. En el repo: **Settings → Pages**.
4. En **Build and deployment → Source**, elige **Deploy from a branch**.
5. Branch: `main` · carpeta: `/ (root)` → **Save**.
6. Espera 1–2 minutos. Tu sitio quedará en:
   ```
   https://TU_USUARIO.github.io/cuentas-araucarias/
   ```

### Opción B — Línea de comandos (git)
```bash
cd cuentas_congregacion
git init
git add .
git commit -m "App de cuentas de congregación"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/cuentas-araucarias.git
git push -u origin main
```
Luego activa **Pages** como en la Opción A.

> Recuerda volver a agregar `TU_USUARIO.github.io` en los **dominios autorizados** de Firebase Authentication (paso 1f).

---

## 3️⃣ Uso de la aplicación

### Iniciar sesión
Abre el sitio y entra con el correo y la contraseña creados en Firebase.

### Flujo mensual recomendado
1. **Nuevo mes** (botón superior). Al crearlo desde un mes existente, los **saldos finales se arrastran** como saldos anteriores del nuevo mes.
2. **Donaciones** → registra cada donación indicando si es para la **Congregación (C)** u **Obra Mundial (OM)**.
3. **Depósitos** → registra los depósitos del dinero recogido a la cuenta principal. Usa **⚡ Depósito automático** para crear un depósito por el total aún no depositado (deja el saldo de “Recibido” en 0, como exige el formulario).
4. **Gastos** → registra los gastos del Salón con concepto y notas/etiquetas.
5. **Caja chica** → entradas/salidas de la cuenta secundaria.
6. **Traspaso (TO-62)** → captura la resolución para la obra mundial, cargos, fondos a depositar, método de pago, referencia y firmas. (Las “Obra mundial / cajas” se calculan solas a partir de las donaciones OM.)
7. **Resumen** → revisa los totales del S-30, los saldos del S-26 y las **validaciones automáticas** (ej. “Recibido debe ser 0”, “(i) del S-30 = Total de fondos del S-26”).
8. **Formularios PDF** → descarga el **S-26**, **S-30** y **TO-62** ya rellenados.

### Configuración del mes
En **Formularios PDF → Configuración del mes** puedes ajustar manualmente los saldos anteriores (Recibido, Cuenta principal, Cuenta secundaria) si necesitas corregir el arrastre.

---

## 🧮 Cómo se calculan los formularios

| Dato del usuario | S-26 | S-30 | TO-62 |
|---|---|---|---|
| Donación **C** | Recibido/Entrada (CT=C) | (b) Recibido para la congregación | — |
| Donación **OM** | Recibido/Entrada (CT=OM) | (c) Otros ingresos | Obra mundial (cajas) |
| Depósito | Recibido/Salida + Principal/Entrada (CT=D) | *(excluido)* | — |
| Gasto | Principal/Salida (CT=G) | (e) Gastos de la congregación | — |
| Traspaso/Resolución | Principal/Salida (última fila, CT=G) | (e) resolución / (f) OM enviadas | Resolución, cargos, total |
| Caja chica | Cuenta secundaria | — | Fondos a depositar |

Reglas implementadas (ver `assets/analisis_formularios.md`):
- Los **depósitos (CT=D) nunca** se incluyen en el S-30.
- El **saldo de “Recibido” debe ser 0** al cerrar el mes.
- La **remesa a la sucursal** es la última transacción del mes en el S-26.
- **(i)** del S-30 debe coincidir con el **Total de fondos** del S-26.

---

## 🔒 Privacidad y seguridad
- Cada usuario solo accede a sus propios datos (`usuarios/{uid}/...`).
- El acceso requiere inicio de sesión con Firebase Authentication.
- Para limitar el acceso a un único correo, créalo como **único usuario** en Authentication (no habilites el registro público).

---

## 🛠️ Tecnologías
- HTML5, CSS3 (tema oscuro propio), JavaScript modular (ES Modules)
- [Firebase v10](https://firebase.google.com/) (App, Auth, Firestore) vía CDN
- [pdf-lib](https://pdf-lib.js.org/) para rellenar los AcroForms oficiales

## ⚠️ Notas
- Funciona como sitio estático: **no requiere servidor propio**.
- Para probar localmente usa un servidor estático (los ES Modules no cargan con `file://`):
  ```bash
  cd cuentas_congregacion
  python3 -m http.server 8000
  # abre http://localhost:8000
  ```
- Los formularios oficiales tienen 52 filas en el S-26; si un mes supera ese número de transacciones, divide el registro en dos hojas.

---

*Desarrollado para uso del siervo de cuentas. Versiones de formularios: S-26-S 9/25, S-30-S 2/26, TO-62-S 2/26.*
