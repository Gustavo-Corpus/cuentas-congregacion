/**
 * ============================================================================
 *  MOTOR DE CÁLCULO CONTABLE
 * ============================================================================
 *  Convierte las transacciones semánticas que captura el usuario en:
 *    - Filas y totales de la HOJA DE CUENTAS (S-26)
 *    - Valores del INFORME MENSUAL (S-30)
 *    - Valores del REGISTRO DE TRASPASO (TO-62)
 *
 *  Tipos de transacción que maneja la app:
 *    donacion  -> { donTipo: 'OM' | 'C', monto, fecha, descripcion }
 *    deposito  -> { monto, fecha, descripcion }   (mueve Recibido -> Principal)
 *    gasto     -> { monto, fecha, concepto, notas }
 *    cajachica -> { cajaSubtipo: 'entrada' | 'salida', monto, fecha, descripcion }
 *
 *  El traspaso a la sucursal (remesa) se guarda en `mes.to62`:
 *    { resolucion, cargos, otras:[{desc,monto}], fondosDepositar,
 *      metodo, fechaTransaccion, referencia, confirmacion,
 *      personaLlena, personaAutoriza }
 *
 *  Reglas (ver analisis_formularios.md):
 *    - CT=D (depósitos) NUNCA se incluyen en el S-30.
 *    - Donaciones OM recogidas se reenvían íntegras a la sucursal -> (f).
 *    - La resolución mensual OM va dentro de (e).
 * ============================================================================
 */

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/** Suma segura de un arreglo de números/objetos. */
const sum = (arr, sel = (x) => x) =>
  round2(arr.reduce((a, b) => a + (Number(sel(b)) || 0), 0));

/**
 * Calcula todos los derivados del mes.
 * @param {object} mes  documento del mes (incluye saldoAnterior y to62)
 * @param {Array}  txs  transacciones del mes
 */
export function computeMonth(mes, txs) {
  const saldoAnt = mes.saldoAnterior || {
    recibido: 0,
    principal: 0,
    secundaria: 0
  };
  const to62 = mes.to62 || {};

  const donacionesOM = txs.filter(
    (t) => t.tipo === "donacion" && t.donTipo === "OM"
  );
  const donacionesC = txs.filter(
    (t) => t.tipo === "donacion" && t.donTipo === "C"
  );
  const depositos = txs.filter((t) => t.tipo === "deposito");
  const gastos = txs.filter((t) => t.tipo === "gasto");
  const cajaEntradas = txs.filter(
    (t) => t.tipo === "cajachica" && t.cajaSubtipo === "entrada"
  );
  const cajaSalidas = txs.filter(
    (t) => t.tipo === "cajachica" && t.cajaSubtipo === "salida"
  );

  const totalOM = sum(donacionesOM, (t) => t.monto);
  const totalC = sum(donacionesC, (t) => t.monto);
  const totalDepositos = sum(depositos, (t) => t.monto);
  const totalGastos = sum(gastos, (t) => t.monto);
  const totalCajaEntrada = sum(cajaEntradas, (t) => t.monto);
  const totalCajaSalida = sum(cajaSalidas, (t) => t.monto);

  // ---- Componentes del traspaso (TO-62) ----
  const resolucionOM = round2(to62.resolucion || mes.resolucionOM || 0);
  const cargosCuenta = round2(to62.cargos || 0);
  const otrasTo62 = Array.isArray(to62.otras) ? to62.otras : [];
  const totalOtrasTo62 = sum(otrasTo62, (x) => x.monto);
  const fondosDepositar = round2(to62.fondosDepositar || 0);

  // Obra mundial (cajas) reenviada = todo lo recogido OM.
  const omCajasEnviadas = totalOM;
  const totalDonacionesPagos = round2(
    omCajasEnviadas + resolucionOM + cargosCuenta + totalOtrasTo62
  );
  // La remesa (TO-62 "Total de fondos enviados") es lo que sale de la cuenta
  // principal hacia la sucursal. Equivale a la suma de los conceptos del TO-62.
  // "Fondos para depositar" es informativo y refleja ese mismo importe salvo
  // que el usuario capture un valor distinto.
  const totalFondosEnviados = totalDonacionesPagos;
  const fondosDepositarMostrar = fondosDepositar || totalFondosEnviados;

  /* ----------------------- RESUMEN S-26 (saldos) ----------------------- */
  // RECIBIDO: entran donaciones (OM+C), salen al depositarse.
  const recibidoEntrada = round2(totalOM + totalC);
  const recibidoSalida = totalDepositos;
  const recibidoFinal = round2(
    saldoAnt.recibido + recibidoEntrada - recibidoSalida
  );

  // CUENTA PRINCIPAL: entran depósitos; salen gastos, remesa a sucursal y
  // los fondeos de la caja chica (transferencia principal -> secundaria).
  const principalEntrada = totalDepositos;
  const principalSalida = round2(
    totalGastos + totalFondosEnviados + totalCajaEntrada
  );
  const principalFinal = round2(
    saldoAnt.principal + principalEntrada - principalSalida
  );

  // CUENTA SECUNDARIA: caja chica. Entrada = fondeo desde principal;
  // salida = gasto pagado con caja chica.
  const secundariaEntrada = totalCajaEntrada;
  const secundariaSalida = totalCajaSalida;
  const secundariaFinal = round2(
    saldoAnt.secundaria + secundariaEntrada - secundariaSalida
  );

  const totalFondosFinMes = round2(
    recibidoFinal + principalFinal + secundariaFinal
  );

  /* ----------------------------- S-30 ----------------------------- */
  const a = round2(
    (saldoAnt.recibido || 0) +
      (saldoAnt.principal || 0) +
      (saldoAnt.secundaria || 0)
  );
  const b = totalC; // Recibido para la congregación (cajas)
  const c = totalOM; // Otros ingresos (donaciones obra mundial)
  const d = round2(b + c);

  const eResolucion = resolucionOM; // resolución mensual OM (línea aparte)
  // Gastos de funcionamiento = gastos capturados + gastos pagados con caja chica.
  const eFuncionamiento = round2(totalGastos + totalCajaSalida);
  const eTotal = round2(eFuncionamiento + eResolucion + cargosCuenta);

  // Otros desembolsos = donaciones OM (cajas) + otros pagos del TO-62.
  const f = round2(omCajasEnviadas + totalOtrasTo62);
  const g = round2(eTotal + f);
  const h = round2(d - g);
  const i = round2(a + h);
  const previsiones = Array.isArray(mes.previsiones) ? mes.previsiones : [];
  const j = sum(previsiones, (x) => x.monto);
  const k = round2(Math.max(0, i - j));

  /* ----------------------- Validaciones cruzadas ----------------------- */
  const validaciones = [];
  validaciones.push({
    ok: Math.abs(recibidoFinal) < 0.005,
    msg: "Saldo final de RECIBIDO debe ser 0 al cerrar el mes."
  });
  validaciones.push({
    ok: Math.abs(i - totalFondosFinMes) < 0.005,
    msg: "S-30 (i) debe ser igual al Total de fondos del S-26."
  });
  validaciones.push({
    ok: principalFinal >= -0.005,
    msg: "La cuenta principal no debería quedar en negativo."
  });

  return {
    // agregados base
    totalOM,
    totalC,
    totalDepositos,
    totalGastos,
    totalCajaEntrada,
    totalCajaSalida,
    // S-26 resumen
    saldoAnterior: saldoAnt,
    recibido: {
      anterior: saldoAnt.recibido,
      entrada: recibidoEntrada,
      salida: recibidoSalida,
      final: recibidoFinal
    },
    principal: {
      anterior: saldoAnt.principal,
      entrada: principalEntrada,
      salida: principalSalida,
      final: principalFinal
    },
    secundaria: {
      anterior: saldoAnt.secundaria,
      entrada: secundariaEntrada,
      salida: secundariaSalida,
      final: secundariaFinal
    },
    totalFondosFinMes,
    // S-30
    s30: { a, b, c, d, e: eTotal, eFuncionamiento, eResolucion, cargosCuenta, f, g, h, i, j, k, previsiones },
    // TO-62
    to62: {
      omCajas: omCajasEnviadas,
      resolucion: resolucionOM,
      cargos: cargosCuenta,
      otras: otrasTo62,
      totalDonacionesPagos,
      fondosDepositar: fondosDepositarMostrar,
      totalFondosEnviados,
      metodo: to62.metodo || "",
      fechaTransaccion: to62.fechaTransaccion || "",
      referencia: to62.referencia || "",
      confirmacion: to62.confirmacion || "",
      reembolso: round2(to62.reembolso || 0),
      personaLlena: to62.personaLlena || "",
      personaAutoriza: to62.personaAutoriza || ""
    },
    validaciones
  };
}

/**
 * Construye las filas del S-26 (orden cronológico) a partir de transacciones.
 * Devuelve filas con columnas: fecha, descripcion, ct, recEnt, recSal,
 * priEnt, priSal, secEnt, secSal.
 */
export function buildS26Rows(mes, txs, derived) {
  const rows = [];
  function prioridad(t) {
  if (t.tipo === "donacion" && t.donTipo === "OM") return 1;
  if (t.tipo === "donacion" && t.donTipo === "C")  return 2;
  if (t.tipo === "gasto")                          return 3;
  if (t.tipo === "cajachica")                      return 4;
  if (t.tipo === "deposito")                       return 5;
  return 6;
}

const ordenadas = [...txs].sort((a, b) => {
  const porFecha = (a.fecha || "").localeCompare(b.fecha || "");
  if (porFecha !== 0) return porFecha;
  return prioridad(a) - prioridad(b);
});

  for (const t of ordenadas) {
    if (t.tipo === "donacion") {
      rows.push({
        fecha: t.fecha,
        descripcion: t.descripcion || (t.donTipo === "OM" ? "Donación Obra Mundial" : "Donación Congregación"),
        ct: t.donTipo,
        recEnt: t.monto,
        recSal: "",
        priEnt: "",
        priSal: "",
        secEnt: "",
        secSal: ""
      });
    } else if (t.tipo === "deposito") {
      rows.push({
        fecha: t.fecha,
        descripcion: t.descripcion || "Depósito en cuenta principal",
        ct: "D",
        recEnt: "",
        recSal: t.monto,
        priEnt: t.monto,
        priSal: "",
        secEnt: "",
        secSal: ""
      });
    } else if (t.tipo === "gasto") {
      rows.push({
        fecha: t.fecha,
        descripcion: t.concepto || "Gasto de la congregación",
        ct: "G",
        recEnt: "",
        recSal: "",
        priEnt: "",
        priSal: t.monto,
        secEnt: "",
        secSal: ""
      });
    } else if (t.tipo === "cajachica") {
      const ent = t.cajaSubtipo === "entrada";
      // Entrada = traspaso de la cuenta principal a la caja chica (sale de
      // principal, entra a secundaria, en la misma fila).
      // Salida = gasto pagado con la caja chica (solo sale de secundaria).
      rows.push({
        fecha: t.fecha,
        descripcion:
          t.descripcion ||
          (ent ? "Fondeo de caja chica" : "Gasto de caja chica"),
        ct: "E",
        recEnt: "",
        recSal: "",
        priEnt: "",
        priSal: ent ? t.monto : "",
        secEnt: ent ? t.monto : "",
        secSal: ent ? "" : t.monto
      });
    }
  }

  // Remesa a la sucursal (última transacción del mes) si hay traspaso.
  const tot = derived.to62.totalFondosEnviados;
  if (tot > 0) {
    const fecha =
      derived.to62.fechaTransaccion ||
      (mes.year && mes.month
        ? `${mes.year}-${String(mes.month).padStart(2, "0")}-28`
        : "");
    rows.push({
      fecha,
      descripcion: `Traspaso de fondos a la sucursal (TO-62${
        derived.to62.fechaTransaccion ? " " + derived.to62.fechaTransaccion : ""
      })`,
      ct: "G",
      recEnt: "",
      recSal: "",
      priEnt: "",
      priSal: tot,
      secEnt: "",
      secSal: ""
    });
  }

  return rows;
}

/** Formatea un número como moneda MXN. */
export function fmtMoney(n, locale = "es-MX", currency = "MXN") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency
  }).format(Number(n) || 0);
}

/** Formatea para celdas de PDF (sin símbolo, con coma decimal opcional). */
export function fmtNum(n) {
  if (n === "" || n === undefined || n === null) return "";
  const v = Number(n);
  if (isNaN(v)) return "";
  return "$" + v.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export const MESES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function nombreMes(mesId) {
  const [y, m] = mesId.split("-");
  return `${MESES_ES[parseInt(m, 10) - 1]} ${y}`;
}
