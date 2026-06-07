# Análisis Completo de Formularios de Contabilidad de Congregación

> **Documento de referencia para desarrollo de aplicación web**
> Basado en: S-26_S.pdf, S-30_S.pdf, TO-62_S.pdf, Instrucciones.pdf (S-27c)

---

## 1. Resumen General del Sistema

El sistema de contabilidad de la congregación se compone de **tres formularios principales** que trabajan en conjunto para registrar, resumir y traspasar los fondos:

| Formulario | Nombre | Propósito |
|---|---|---|
| **S-26** | Hoja de Cuentas | Libro de contabilidad principal — registro detallado de TODAS las transacciones |
| **S-30** | Informe Mensual de las Cuentas de la Congregación | Resumen mensual de ingresos y gastos para presentar a la congregación |
| **TO-62** | Registro de Traspaso de Fondos | Documentar donaciones y pagos enviados a la sucursal |

**Flujo general:** Las transacciones se registran en el S-26 → se resumen en el S-30 → los traspasos a la sucursal se documentan en el TO-62.

---

## 2. Formulario S-26: HOJA DE CUENTAS (2 páginas)

### 2.1 Página 1 — Registro de Transacciones

#### Encabezado
| Campo | Tipo | Descripción |
|---|---|---|
| Congregación o evento | Texto | Nombre de la congregación |
| Ciudad | Texto | Ciudad de la congregación |
| Provincia o estado | Texto | Provincia o estado |
| Mes y año / Fecha(s) | Texto | Para congregación: mes y año; para evento: fecha(s) |

#### Tabla de Transacciones (filas múltiples, ~40 filas)
Cada fila tiene las siguientes columnas:

| Columna | Tipo | Descripción |
|---|---|---|
| **FECHA** | Fecha | Fecha de la transacción |
| **DESCRIPCIÓN DE LA TRANSACCIÓN** | Texto | Descripción del tipo de transacción |
| **CT** (Código de Transacción) | Código | Código que identifica el tipo de transacción |
| **RECIBIDO / ENTRADA** | Moneda | Donaciones recibidas (cantidades de los Registros de Transacción) |
| **RECIBIDO / SALIDA** | Moneda | Contribuciones depositadas en la cuenta principal |
| **CUENTA PRINCIPAL / ENTRADA** | Moneda | Depósitos realizados en la cuenta principal |
| **CUENTA PRINCIPAL / SALIDA** | Moneda | Pagos realizados desde la cuenta principal |
| **CUENTA SECUNDARIA / ENTRADA** | Moneda | Entradas en otras cuentas (ej. fondos depositados en sucursal) |
| **CUENTA SECUNDARIA / SALIDA** | Moneda | Salidas de otras cuentas |

#### Pie de Página 1
- **TOTALES DE TODAS LAS COLUMNAS**: Suma automática de cada columna numérica.

#### Códigos de Transacción (CT)
| Código | Categoría | Uso |
|---|---|---|
| **OM** | Donaciones para la Obra Mundial | Contribuciones recogidas de la caja de Obra Mundial |
| **C** | Donaciones para gastos de la congregación | Contribuciones para el funcionamiento de la congregación |
| **D** | Depósito en la cuenta principal | Cuando se deposita dinero en la caja de efectivo |
| **G** | Gasto de la congregación | Pagos de gastos aprobados |
| **E** | Fondos recibidos para propósito especial | Donaciones con destino específico |

### 2.2 Página 2 — Conciliaciones y Resumen

#### Sección: CONCILIACIÓN DE LA CUENTA PRINCIPAL
Tiene **dos opciones** (se usa solo una según el tipo de cuenta principal):

**Opción A: Cuenta Bancaria** (si se usa cuenta bancaria como cuenta principal)

| Línea | Campo | Tipo | Operación |
|---|---|---|---|
| 1 | Saldo final del extracto bancario | Moneda | Valor del extracto |
| 2 | Depósitos registrados en la Hoja de cuentas que no aparezcan en el extracto | Moneda | + (sumar) |
| 3 | Comisiones bancarias sin registrar en la Hoja de cuentas | Moneda | + (sumar) |
| 4 | Total de las líneas 1 a 3 | Moneda | = L1 + L2 + L3 |
| 5 | Cheques o transferencias electrónicas registradas que el banco todavía no haya pagado | Lista | Cheque/núm. confirmación + Cantidad (hasta 7 entradas) |
| 6 | Total de cheques/transferencias no pagados (suma línea 5) | Moneda | = Σ línea 5 |
| 7 | Intereses bancarios sin registrar en la Hoja de cuentas | Moneda | − (restar) |
| 8 | Donaciones electrónicas sin registrar en la Hoja de cuentas | Moneda | − (restar) |
| 9 | Saldo bancario conciliado (reste a línea 4 las líneas 6 a 8) | Moneda | = L4 − L6 − L7 − L8 |

> **Validación:** Línea 9 debe coincidir con "Cuenta Principal/Saldo final" del Resumen.

**Opción B: Caja de dinero en efectivo** (si se usa caja de efectivo como cuenta principal)

| Línea | Campo | Tipo | Operación |
|---|---|---|---|
| 1 | Dinero en efectivo en la caja | Moneda | Conteo físico |
| 2 | Pagos realizados sin registrar en la Hoja de cuentas | Moneda | + (sumar) |
| 3 | Adelantos de efectivo sin liquidar | Moneda | + (sumar) |
| 4 | Saldo de la caja de efectivo conciliado (total líneas 1 a 3) | Moneda | = L1 + L2 + L3 |

> **Validación:** Línea 4 debe coincidir con "Cuenta Principal/Saldo final" del Resumen.

#### Sección: RESUMEN DE LA HOJA DE CUENTAS

| Sección | Campo | Tipo | Fórmula |
|---|---|---|---|
| **Para el mes que termina el:** | Fecha | Texto | Último día del mes |
| | | | |
| **RECIBIDO** | Saldo anterior | Moneda | Del mes anterior (siempre debe ser 0 al cerrar) |
| | ENTRADA | Moneda | + Total columna Recibido/Entrada pág.1 |
| | SALIDA | Moneda | − Total columna Recibido/Salida pág.1 |
| | **Saldo final** | Moneda | = Saldo anterior + ENTRADA − SALIDA (**debe ser 0**) |
| | | | |
| **CUENTA PRINCIPAL** | Saldo anterior | Moneda | = Saldo final del mes anterior |
| | ENTRADA | Moneda | + Total columna Cuenta Principal/Entrada pág.1 |
| | SALIDA | Moneda | − Total columna Cuenta Principal/Salida pág.1 |
| | **Saldo final** | Moneda | = Saldo anterior + ENTRADA − SALIDA |
| | | | |
| **CUENTA SECUNDARIA** | Saldo anterior | Moneda | = Saldo final del mes anterior |
| | ENTRADA | Moneda | + Total columna Cuenta Secundaria/Entrada pág.1 |
| | SALIDA | Moneda | − Total columna Cuenta Secundaria/Salida pág.1 |
| | **Saldo final** | Moneda | = Saldo anterior + ENTRADA − SALIDA |
| | | | |
| **TOTAL DE FONDOS AL FINAL DEL MES** | | Moneda | = Saldo final Recibido + Saldo final Cta. Principal + Saldo final Cta. Secundaria |

#### Sección: CONCILIACIÓN DE LA CUENTA SECUNDARIA

| Línea | Campo | Tipo | Operación |
|---|---|---|---|
| 1 | Saldo del extracto | Moneda | Valor del extracto de la sucursal |
| 2 | Depósitos registrados que no aparezcan en el extracto | Moneda | + (sumar) |
| 3 | Cargos sin registrar en la Hoja de cuentas | Moneda | + (sumar) |
| 4 | Total de las filas 1 a 3 | Moneda | = L1 + L2 + L3 |
| 5 | Retiradas que no figuren en el extracto | Lista | Descripción + Cantidad (hasta 3 entradas) |
| 6 | Total de retiradas que no aparecen en el extracto (suma línea 5) | Moneda | = Σ línea 5 |
| 7 | Intereses sin registrar en la Hoja de cuentas | Moneda | − (restar) |
| 8 | Saldo conciliado (reste a línea 4 las líneas 6 y 7) | Moneda | = L4 − L6 − L7 |

> **Validación:** Línea 8 debe coincidir con "Cuenta Secundaria/Saldo final" del Resumen.

---

## 3. Formulario S-30: INFORME MENSUAL DE LAS CUENTAS DE LA CONGREGACIÓN (2 páginas)

### 3.1 Página 1 — Informe Financiero

#### Encabezado
| Campo | Tipo | Descripción |
|---|---|---|
| Congregación | Texto | Nombre de la congregación |
| Mes/año | Texto | Mes y año del informe |

#### Campos del Informe (con posiciones etiquetadas a-k)

| Pos. | Campo | Tipo | Fuente / Fórmula |
|---|---|---|---|
| **(a)** | Fondos al comienzo del mes | Moneda | = posición (i) del informe del mes anterior |
| | | | |
| | **INGRESOS** | | |
| | **RECIBIDO PARA LA CONGREGACIÓN:** | | |
| | Donaciones para la congregación (cajas) | Moneda | Suma de transacciones con código CT = "C" |
| | Donaciones para la congregación (transfs. electrónicas) | Moneda | Transferencias electrónicas recibidas |
| | _(2 líneas adicionales para otros conceptos)_ | Moneda | Otros ingresos para la congregación |
| **(b)** | **Total recibido para la congregación** | Moneda | = Suma de todas las líneas anteriores |
| | **OTROS INGRESOS** | | |
| | Donaciones para la obra mundial (cajas) | Moneda | Suma de transacciones con código CT = "OM" |
| | _(2 líneas adicionales)_ | Moneda | Otras donaciones (propósitos especiales) |
| **(c)** | **Total de otros ingresos** | Moneda | = Suma de líneas de otros ingresos |
| **(d)** | **Total de ingresos [(b) + (c)]** | Moneda | = (b) + (c) |
| | | | |
| | **DESEMBOLSOS** | | |
| | **GASTOS DE LA CONGREGACIÓN** | | |
| | Gastos de funcionamiento del Salón del Reino | Moneda | Transacciones con CT = "G" (funcionamiento) |
| | Resolución mensual para la obra mundial | Moneda | Transacciones con CT = "G" (resolución) |
| | _(5 líneas adicionales para otros gastos)_ | Moneda | Otros gastos de la congregación |
| **(e)** | **Total de gastos de la congregación** | Moneda | = Suma de gastos de congregación |
| | **OTROS DESEMBOLSOS** | | |
| | Donaciones para la obra mundial (cajas) | Moneda | Donaciones OM enviadas a sucursal |
| | _(2 líneas adicionales)_ | Moneda | Otros desembolsos |
| **(f)** | **Total de otros desembolsos** | Moneda | = Suma de otros desembolsos |
| **(g)** | **Total de desembolsos [(e) + (f)]** | Moneda | = (e) + (f) |
| | | | |
| **(h)** | **Superávit / Déficit [(d) − (g)]** | Moneda | = (d) − (g) |
| **(i)** | **Fondos al final de mes [(a) + (h)]** | Moneda | = (a) + (h) |
| | | | |
| | **PREVISIÓN PARA GRANDES GASTOS** | | |
| | _(2 líneas para describir grandes gastos previstos)_ | Moneda | Descripción + cantidad |
| **(j)** | **Total de la previsión para grandes gastos** | Moneda | = Suma de previsiones |
| **(k)** | **FONDOS DISPONIBLES AL FINAL DEL MES [(i) − (j)]** | Moneda | = (i) − (j) |

> **Nota:** Si (i) − (j) es negativa, escribir "0,00".

> **Validación crítica:** La posición **(i)** debe ser igual al "TOTAL DE FONDOS AL FINAL DEL MES" del Resumen de la Hoja de Cuentas (S-26, pág. 2).

### 3.2 Página 2 — Anuncio Mensual

#### Sección: ANUNCIO MENSUAL DE LAS CUENTAS DE LA CONGREGACIÓN

Texto predeterminado con campos a insertar:

| Campo en el anuncio | Fuente |
|---|---|
| Mes del informe | Encabezado del S-30 |
| Total recibido por la congregación | Posición **(b)** del S-30 |
| Total de gastos de la congregación | Posición **(e)** del S-30 |
| Saldo al final del mes | Posición **(i)** del S-30 |

**Texto del anuncio:**
> "Una copia del *Informe mensual de las cuentas de la congregación* de **[Mes del informe]** se colocará en el tablero de anuncios. En resumen, la congregación recibió un total de **[Cantidad (b)]**. Los gastos de la congregación ascendieron a **[Cantidad (e)]**. El saldo al final del mes es de **[Cantidad (i)]**."

**Instrucciones del anuncio:**
- Debe leerse en la reunión de entre semana de la segunda semana de cada mes
- Si no es posible leerlo esa semana, puede hacerse la siguiente
- Una vez leído, la página 1 se coloca en el tablero de anuncios

---

## 4. Formulario TO-62: REGISTRO DE TRASPASO DE FONDOS (1 página)

### 4.1 Encabezado
| Campo | Tipo | Descripción |
|---|---|---|
| Nombre de la congregación | Texto | Nombre completo de la congregación |
| Número de la congregación | Texto | Código identificador de la congregación |

### 4.2 Método de Traspaso (seleccionar uno)
| Opción | Descripción |
|---|---|
| ☐ Transferencia automática | Si hay acuerdo aprobado de autorización |
| ☐ Transferencia electrónica o depósito en cuenta bancaria de la sucursal | UNA ÚNICA transferencia por el total |
| ☐ Cheque o giro bancario | Enviar junto con este formulario |

### 4.3 Sección: Donaciones y Pagos
| Campo | Tipo | Descripción |
|---|---|---|
| Obra mundial (cajas de contribuciones) | Moneda | Total recogido en cajas de Obra Mundial durante el mes |
| Obra mundial (resolución) | Moneda | Cantidad mensual resuelta por la congregación |
| Pago por cargos a la cuenta | Moneda | Cargos realizados por la sucursal |
| _(Hasta 5 líneas adicionales)_ | Texto + Moneda | Otras categorías que aparezcan en JW Hub |
| **Total de donaciones y pagos** | Moneda | = Suma de todas las líneas anteriores |

### 4.4 Fondos para Depositar
| Campo | Tipo | Descripción |
|---|---|---|
| Envío de fondos para depositar en la sucursal | Moneda | Fondos adicionales para depositar en sucursal |

### 4.5 Total y Referencias
| Campo | Tipo | Descripción |
|---|---|---|
| **TOTAL DE FONDOS ENVIADOS** | Moneda | = Total donaciones y pagos + Envío de fondos para depositar |
| Número de referencia del pago o transferencia | Texto | Número del giro/transferencia bancaria |

### 4.6 Solicitud de Reembolso
| Campo | Tipo | Descripción |
|---|---|---|
| Solicitud de reembolso de fondos depositados en la sucursal | Moneda | Si se solicita devolución de fondos |

### 4.7 Confirmación
| Campo | Tipo | Descripción |
|---|---|---|
| Fecha de la transacción | Fecha | Fecha del envío de fondos |
| Número(s) de confirmación | Texto | Número de confirmación de JW Hub |
| Persona que lo llena | Texto/Firma | Siervo de cuentas |
| Persona que lo autoriza | Texto/Firma | Secretario o encargado de la caja de efectivo |

---

## 5. Relaciones Entre los Formularios

### 5.1 Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRANSACCIONES DIARIAS                         │
│  (Donaciones, pagos, depósitos, etc.)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    S-26: HOJA DE CUENTAS                        │
│  • Registro individual de cada transacción                      │
│  • Códigos CT: OM, C, D, G, E                                  │
│  • Totales por columna                                          │
│  • Resumen (Saldos: Recibido, Cta. Principal, Cta. Secundaria) │
│  • Conciliaciones                                               │
└───────────┬─────────────────────────────────┬───────────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────────┐   ┌─────────────────────────────────┐
│  S-30: INFORME MENSUAL    │   │  TO-62: REGISTRO DE TRASPASO    │
│  • Agrupa por categoría   │   │  • Detalla montos enviados      │
│  • Calcula superávit      │   │    a la sucursal                │
│  • Genera anuncio         │   │  • Obra mundial (cajas)         │
│  • Fondos disponibles     │   │  • Obra mundial (resolución)    │
│                           │   │  • Cargos de cuenta             │
│  Posición (i) = Total     │   │  • Fondos para depositar        │
│  de fondos S-26           │   │                                 │
└───────────────────────────┘   └─────────────────────────────────┘
```

### 5.2 Relaciones Específicas de Datos

| Origen (formulario.campo) | Destino (formulario.campo) | Relación |
|---|---|---|
| S-26 Resumen: Total de fondos al final del mes | S-30 posición **(i)** | **Deben ser iguales** |
| S-30 posición **(i)** del mes anterior | S-30 posición **(a)** del mes actual | Arrastre mensual |
| S-26 Transacciones CT="C" + CT="E" | S-30 sección "Recibido para la congregación" | Agrupación |
| S-26 Transacciones CT="OM" | S-30 sección "Otros ingresos" → Donaciones obra mundial | Agrupación |
| S-26 Transacciones CT="G" | S-30 sección "Gastos de la congregación" | Agrupación |
| S-26 Transacciones CT="OM" (enviadas) | S-30 sección "Otros desembolsos" | Agrupación |
| S-26 Transacciones CT="D" | **NO se incluyen en S-30** | Excluidas del informe |
| S-30 posición **(b)** | S-30 pág.2 Anuncio: Total recibido | Copia directa |
| S-30 posición **(e)** | S-30 pág.2 Anuncio: Total gastos | Copia directa |
| S-30 posición **(i)** | S-30 pág.2 Anuncio: Saldo final | Copia directa |
| S-26 Transacciones CT="OM" (cajas) | TO-62: Obra mundial (cajas) | Suma del mes |
| S-26 Transacciones CT="G" (resolución obra mundial) | TO-62: Obra mundial (resolución) | Cantidad resuelta |
| S-26 Última transacción del mes (pago a sucursal) | TO-62: Total de fondos enviados | Debe coincidir |
| S-26 Resumen: Cta. Principal/Saldo final | S-26 Conciliación: Saldo conciliado | **Deben ser iguales** |
| S-26 Resumen: Cta. Secundaria/Saldo final | S-26 Conciliación Secundaria: Saldo conciliado | **Deben ser iguales** |

### 5.3 Regla Crítica: Saldo Recibido = 0

Al cerrar el mes, el **Saldo final de "RECIBIDO"** en el Resumen de la Hoja de Cuentas **siempre debe ser 0**. Esto significa que todas las donaciones recogidas durante el mes deben haberse depositado en la cuenta principal.

---

## 6. Flujo de Trabajo Mensual

### 6.1 Durante el Mes (operaciones continuas)

```
SEMANA 1-4 (después de cada reunión):
  1. Recoger contribuciones de las cajas (2 hermanos)
  2. Contar el dinero y llenar Registro de Transacción S-24 (por duplicado)
  3. Separar: Donaciones congregación (CT=C) vs. Obra mundial (CT=OM)
  4. Registrar en S-26: cada donación como línea individual

SEMANALMENTE:
  5. Depositar fondos recogidos en la cuenta principal (caja de efectivo)
  6. Registrar depósito en S-26 con CT=D:
     - Recibido/Salida = monto
     - Cuenta Principal/Entrada = monto (misma línea)

CUANDO SE APRUEBEN GASTOS:
  7. Registrar cada pago en S-26 con CT=G:
     - Cuenta Principal/Salida = monto del gasto
```

### 6.2 Al Cierre del Mes (últimos días)

```
PASO 1: Última recogida de contribuciones del mes
  → Registrar donaciones en S-26
  → Depositar en cuenta principal y registrar depósito

PASO 2: Preparar TO-62 (Registro de Traspaso de Fondos)
  → Sumar todas las donaciones OM del mes → "Obra mundial (cajas)"
  → Anotar la resolución mensual → "Obra mundial (resolución)"
  → Anotar cargos pendientes de la sucursal
  → Calcular "Total de fondos enviados"

PASO 3: Registrar la remesa a la sucursal como ÚLTIMA transacción del S-26
  → CT=G (o según corresponda)
  → Cuenta Principal/Salida = Total de fondos enviados del TO-62
  → Fecha = último día del mes
  → Descripción: incluir fecha del TO-62 entre paréntesis

PASO 4: Cerrar S-26
  → Sumar totales de todas las columnas (pág. 1)
  → Completar el Resumen de la Hoja de Cuentas (pág. 2):
     • Saldo anterior + ENTRADA − SALIDA = Saldo final (para cada sección)
     • Verificar que Recibido/Saldo final = 0
     • Calcular TOTAL DE FONDOS AL FINAL DEL MES

PASO 5: Realizar conciliación de la cuenta principal (pág. 2 del S-26)
  → Contar dinero en la caja (o verificar extracto bancario)
  → Completar los campos de la conciliación
  → Verificar que el saldo conciliado = Cuenta Principal/Saldo final

PASO 6: Preparar S-30 (Informe Mensual)
  → Posición (a) = posición (i) del S-30 del mes anterior
  → Agrupar ingresos por categoría desde S-26
  → Agrupar desembolsos por categoría desde S-26
  → Calcular (b), (c), (d), (e), (f), (g), (h), (i), (j), (k)
  → Verificar que posición (i) = Total de fondos S-26

PASO 7: Completar el Anuncio (pág. 2 del S-30)
  → Insertar valores de posiciones (b), (e), (i)
```

### 6.3 Primeros Días del Mes Siguiente (hasta el día 6)

```
PASO 8: Enviar fondos a la sucursal
  → Realizar la transferencia/giro/depósito bancario
  → Anotar número de referencia en TO-62
  → Obtener justificante de la transacción

PASO 9: Enviar TO-62 a la sucursal
  → Vía JW Hub (introducir datos y obtener número de confirmación)
  → O por correo electrónico/postal
  → Plazo: a más tardar el día 6 del mes siguiente

PASO 10: Entregar S-30 para revisión
  → Siervo de cuentas firma → entrega copia al secretario
  → Secretario revisa → entrega copia al coordinador
  → Coordinador programa lectura del anuncio

PASO 11: Lectura del anuncio a la congregación
  → En la reunión de entre semana de la 2ª semana del mes
  → Se lee la página 2 del S-30
  → Se coloca la página 1 en el tablero de anuncios

PASO 12: Iniciar nuevo S-26 del mes actual
  → Arrastrar saldos finales como saldos anteriores del nuevo mes
  → NO arrastrar saldos a las columnas de Entrada/Salida de la pág. 1
```

---

## 7. Fórmulas y Cálculos

### 7.1 Fórmulas del S-26 (Resumen)

```
Para cada sección (Recibido, Cuenta Principal, Cuenta Secundaria):
  Saldo_final = Saldo_anterior + ENTRADA − SALIDA

Total_fondos_final_mes = Recibido_saldo_final + Cta_principal_saldo_final + Cta_secundaria_saldo_final
```

### 7.2 Fórmulas de Conciliación (S-26, Cuenta Principal - Caja de Efectivo)

```
Saldo_conciliado = Dinero_en_caja + Pagos_sin_registrar + Adelantos_sin_liquidar
Validación: Saldo_conciliado == Cta_principal_saldo_final
```

### 7.3 Fórmulas de Conciliación (S-26, Cuenta Principal - Cuenta Bancaria)

```
Subtotal = Saldo_extracto + Depósitos_no_en_extracto + Comisiones_sin_registrar
Saldo_conciliado = Subtotal − Cheques_no_pagados − Intereses_sin_registrar − Donaciones_electrónicas_sin_registrar
Validación: Saldo_conciliado == Cta_principal_saldo_final
```

### 7.4 Fórmulas de Conciliación (S-26, Cuenta Secundaria)

```
Subtotal = Saldo_extracto + Depósitos_no_en_extracto + Cargos_sin_registrar
Saldo_conciliado = Subtotal − Retiradas_no_en_extracto − Intereses_sin_registrar
Validación: Saldo_conciliado == Cta_secundaria_saldo_final
```

### 7.5 Fórmulas del S-30

```
(b) = Σ(donaciones congregación: cajas + electrónicas + otros)
(c) = Σ(donaciones obra mundial + otros ingresos especiales)
(d) = (b) + (c)
(e) = Σ(gastos funcionamiento + resolución mensual + otros gastos)
(f) = Σ(donaciones OM enviadas + otros desembolsos)
(g) = (e) + (f)
(h) = (d) − (g)    // Superávit o Déficit
(i) = (a) + (h)    // Fondos al final del mes
(j) = Σ(previsiones para grandes gastos)
(k) = (i) − (j)    // Fondos disponibles (si < 0, escribir "0,00")

Validación: (i) == Total_fondos_final_mes del S-26
```

### 7.6 Fórmulas del TO-62

```
Total_donaciones_y_pagos = Obra_mundial_cajas + Obra_mundial_resolución + Cargos_cuenta + Otros
Total_fondos_enviados = Total_donaciones_y_pagos + Fondos_para_depositar_sucursal
```

### 7.7 Cálculo del Saldo Máximo (referencia para la app)

```
Media_gastos_12_meses = Σ(posición (e) de los últimos 12 S-30) / 12

Si comparte Salón del Reino:
  Saldo_máximo = entre 1x y 2x la media

Si NO comparte Salón del Reino:
  Saldo_máximo = entre 2x y 4x la media
```

---

## 8. Validaciones Cruzadas (para implementar en la aplicación)

| # | Validación | Formularios involucrados |
|---|---|---|
| 1 | Recibido/Saldo final del S-26 = 0 al cerrar el mes | S-26 |
| 2 | S-26 Cta. Principal/Saldo final = Conciliación Cta. Principal saldo conciliado | S-26 |
| 3 | S-26 Cta. Secundaria/Saldo final = Conciliación Cta. Secundaria saldo conciliado | S-26 |
| 4 | S-30 posición (i) = S-26 Total de fondos al final del mes | S-26 ↔ S-30 |
| 5 | S-30 posición (a) mes actual = S-30 posición (i) mes anterior | S-30 ↔ S-30 |
| 6 | S-26 última salida Cta. Principal del mes = TO-62 Total de fondos enviados | S-26 ↔ TO-62 |
| 7 | S-30 Otros desembolsos (OM) = TO-62 Obra mundial (cajas) | S-30 ↔ TO-62 |
| 8 | S-30 Gastos congregación (resolución) = TO-62 Obra mundial (resolución) | S-30 ↔ TO-62 |
| 9 | Recibido/Entrada = Recibido/Salida (al cerrar, para que saldo = 0) | S-26 |
| 10 | Cada depósito: Recibido/Salida = Cuenta Principal/Entrada (misma línea) | S-26 |

---

## 9. Roles y Responsabilidades

| Rol | Responsabilidades |
|---|---|
| **Siervo de cuentas** | Registra transacciones en S-26, prepara S-30 y TO-62, realiza conciliaciones, firma formularios |
| **Secretario** | Revisa S-30 y TO-62, entrega copia al coordinador, custodia copias de S-24 |
| **Coordinador del cuerpo de ancianos** | Aprueba gastos (iniciales en facturas), se encarga de la lectura del anuncio |
| **Encargado de la caja de efectivo** | Custodia la caja, efectúa pagos, revisa y aprueba el TO-62, realiza transferencia a sucursal |

---

## 10. Consideraciones para el Desarrollo de la Aplicación Web

### 10.1 Datos Maestros Necesarios
- Nombre de la congregación
- Número de la congregación
- Ciudad, provincia/estado
- Tipo de cuenta principal (bancaria vs. caja de efectivo)
- Saldo máximo aprobado
- Resoluciones mensuales vigentes (ej. donación mensual para construcción mundial)

### 10.2 Entidades Principales del Modelo de Datos

```
Congregación
  ├── id, nombre, número, ciudad, provincia
  ├── tipo_cuenta_principal (bancaria | caja_efectivo)
  └── saldo_maximo

Mes_Contable
  ├── id, congregación_id, mes, año
  ├── saldo_anterior_recibido, saldo_anterior_principal, saldo_anterior_secundaria
  └── estado (abierto | cerrado)

Transacción (= línea del S-26)
  ├── id, mes_contable_id
  ├── fecha, descripción, código_ct
  ├── recibido_entrada, recibido_salida
  ├── cuenta_principal_entrada, cuenta_principal_salida
  └── cuenta_secundaria_entrada, cuenta_secundaria_salida

Conciliación_Principal
  ├── mes_contable_id, fecha_completado
  ├── tipo (bancaria | caja_efectivo)
  ├── [campos según tipo...]
  └── saldo_conciliado

Conciliación_Secundaria
  ├── mes_contable_id, fecha_completado
  ├── [campos...]
  └── saldo_conciliado

Informe_Mensual (= S-30)
  ├── mes_contable_id
  ├── fondos_inicio (a), ingresos_congregación (b), otros_ingresos (c)
  ├── total_ingresos (d), gastos_congregación (e), otros_desembolsos (f)
  ├── total_desembolsos (g), superavit_deficit (h), fondos_final (i)
  ├── prevision_grandes_gastos (j), fondos_disponibles (k)
  └── estado (borrador | revisado | anunciado)

Traspaso_Fondos (= TO-62)
  ├── mes_contable_id
  ├── metodo_traspaso (automática | electrónica | cheque)
  ├── obra_mundial_cajas, obra_mundial_resolución, cargos_cuenta
  ├── otras_categorías[], total_donaciones_pagos
  ├── fondos_depositar_sucursal, total_fondos_enviados
  ├── num_referencia, num_confirmacion
  ├── fecha_transaccion
  └── persona_llena, persona_autoriza

Resolución
  ├── id, congregación_id
  ├── tipo (mensual_permanente | puntual)
  ├── descripción, monto_mensual
  ├── fecha_aprobación
  └── estado (vigente | cancelada)
```

### 10.3 Funcionalidades Clave de la Aplicación

1. **Registro de transacciones** con autocompletado de códigos CT
2. **Cálculo automático** de totales de columnas (S-26 pág. 1)
3. **Generación automática del Resumen** (S-26 pág. 2) con arrastre de saldos
4. **Asistente de conciliación** con validación automática
5. **Generación automática del S-30** a partir de datos del S-26, agrupando por código CT
6. **Generación automática del TO-62** con montos calculados desde S-26
7. **Validaciones cruzadas** en tiempo real (ver sección 8)
8. **Alertas** cuando el saldo excede el máximo o fondos son insuficientes
9. **Generación de PDFs** rellenados listos para imprimir
10. **Historial mensual** con arrastre automático de saldos entre meses
11. **Cálculo automático del saldo máximo** basado en los últimos 12 meses de posición (e)

### 10.4 Reglas de Negocio Importantes

- Las transacciones con CT="D" (depósitos) **nunca** se incluyen en el S-30
- La remesa a la sucursal **siempre** es la última transacción del mes en el S-26
- El Recibido/Saldo final **debe ser 0** al cerrar el mes
- Cada depósito genera entradas en **dos secciones** simultáneamente: Recibido/Salida y Cuenta Principal/Entrada
- Los adelantos de efectivo **no se registran** en la Hoja de Cuentas (solo se liquidan)
- El TO-62 se archiva con la Hoja de Cuentas del mes que acaba de terminar, aunque la transferencia se realice en los primeros días del mes siguiente
- Fecha límite para enviar el TO-62 a la sucursal: **día 6 del mes siguiente**
- Auditorías trimestrales: Sep-Nov, Dic-Feb, Mar-May, Jun-Ago

---

## 11. Apéndice: Mapeo de Códigos CT a Secciones del S-30

| Código CT | Sección S-30 | Subsección |
|---|---|---|
| **C** | INGRESOS → Recibido para la congregación | Donaciones congregación |
| **E** | INGRESOS → Recibido para la congregación | Fondos propósito especial |
| **OM** (entrada) | INGRESOS → Otros ingresos | Donaciones obra mundial |
| **G** | DESEMBOLSOS → Gastos de la congregación | Según descripción |
| **OM** (salida) | DESEMBOLSOS → Otros desembolsos | Donaciones OM enviadas |
| **D** | ❌ NO SE INCLUYE | — |

---

*Documento generado como referencia para el desarrollo de la aplicación web de contabilidad de congregación.*
*Versiones de formularios: S-26-S 9/25, S-30-S 2/26, TO-62-S 2/26, S-27c-S 9/19*
