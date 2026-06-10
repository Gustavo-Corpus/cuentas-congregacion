/**
 * Generación de PDFs rellenados (S-26, S-30, TO-62) con pdf-lib.
 * Carga las plantillas originales desde /assets/templates y rellena los
 * AcroForms usando los mapeos de pdf-fields.js.
 */
import { PDFDocument, StandardFonts } from "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm";
import {
  s26RowFields,
  S26_HEADER,
  S26_TOTALS,
  S26_SUMMARY,
  S26_CONCIL_CAJA,
  S26_MAX_ROWS,
  S30,
  TO62
} from "./pdf-fields.js";
import { fmtNum, buildS26Rows, nombreMes, MESES_ES } from "./calculations.js";

const TEMPLATES = {
  s26: "assets/templates/S-26_S.pdf",
  s30: "assets/templates/S-30_S.pdf",
  to62: "assets/templates/TO-62_S.pdf"
};

async function loadTemplate(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo cargar la plantilla: ${url}`);
  const bytes = await res.arrayBuffer();
  return PDFDocument.load(bytes);
}

async function guardarConFuente(pdf, form) {
  const timesFont = await pdf.embedFont(StandardFonts.TimesRoman);
  form.updateFieldAppearances(timesFont);
  return pdf.save();
}

/** Asigna texto a un campo de forma segura (ignora si no existe). */
function setText(form, name, value) {
  if (value === undefined || value === null || value === "") return;
  try {
    const f = form.getTextField(name);
    f.setText(String(value));
  } catch (e) {
    // campo inexistente o de otro tipo: ignorar
  }
}

function setCheck(form, name, on) {
  try {
    const f = form.getCheckBox(name);
    if (on) f.check();
    else f.uncheck();
  } catch (e) {}
}

function descargar(bytes, filename) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ============================== S-26 ============================== */
export async function generarS26(mes, txs, derived, cong) {
  const pdf = await loadTemplate(TEMPLATES.s26);
  const form = pdf.getForm();

  // Encabezado
  setText(form, S26_HEADER.congregacion, cong.nombre);
  setText(form, S26_HEADER.ciudad, cong.ciudad);
  setText(form, S26_HEADER.provincia, cong.provincia);
  setText(form, S26_HEADER.mesAno, nombreMes(mes.id));

  // Filas
  const rows = buildS26Rows(mes, txs, derived).slice(0, S26_MAX_ROWS);
  rows.forEach((r, idx) => {
    const f = s26RowFields(idx + 1);
    setText(form, f.fecha, formatFechaCorta(r.fecha));
    setText(form, f.desc, r.descripcion);
    setText(form, f.ct, r.ct);
    setText(form, f.recEnt, fmtNum(r.recEnt));
    setText(form, f.recSal, fmtNum(r.recSal));
    setText(form, f.priEnt, fmtNum(r.priEnt));
    setText(form, f.priSal, fmtNum(r.priSal));
    setText(form, f.secEnt, fmtNum(r.secEnt));
    setText(form, f.secSal, fmtNum(r.secSal));
  });

  // Totales de columnas
  setText(form, S26_TOTALS.recEnt, fmtNum(derived.recibido.entrada));
  setText(form, S26_TOTALS.recSal, fmtNum(derived.recibido.salida));
  setText(form, S26_TOTALS.priEnt, fmtNum(derived.principal.entrada));
  setText(form, S26_TOTALS.priSal, fmtNum(derived.principal.salida));
  setText(form, S26_TOTALS.secEnt, fmtNum(derived.secundaria.entrada));
  setText(form, S26_TOTALS.secSal, fmtNum(derived.secundaria.salida));

  // Resumen (página 2)
  const finMes = ultimoDiaMes(mes.year, mes.month);
  setText(form, S26_SUMMARY.fechaTermina, finMes);
  setText(form, S26_SUMMARY.recAnterior, fmtNum(derived.recibido.anterior));
  setText(form, S26_SUMMARY.recEntrada, fmtNum(derived.recibido.entrada));
  setText(form, S26_SUMMARY.recSalida, fmtNum(derived.recibido.salida));
  setText(form, S26_SUMMARY.recFinal, fmtNum(derived.recibido.final));
  setText(form, S26_SUMMARY.priAnterior, fmtNum(derived.principal.anterior));
  setText(form, S26_SUMMARY.priEntrada, fmtNum(derived.principal.entrada));
  setText(form, S26_SUMMARY.priSalida, fmtNum(derived.principal.salida));
  setText(form, S26_SUMMARY.priFinal, fmtNum(derived.principal.final));
  setText(form, S26_SUMMARY.secAnterior, fmtNum(derived.secundaria.anterior));
  setText(form, S26_SUMMARY.secEntrada, fmtNum(derived.secundaria.entrada));
  setText(form, S26_SUMMARY.secSalida, fmtNum(derived.secundaria.salida));
  setText(form, S26_SUMMARY.secFinal, fmtNum(derived.secundaria.final));
  setText(form, S26_SUMMARY.totalFondos, fmtNum(derived.totalFondosFinMes));

  // Conciliación caja de efectivo (saldo conciliado = principal final)
  if ((cong.tipoCuentaPrincipal || "caja_efectivo") === "caja_efectivo") {
    setText(form, S26_CONCIL_CAJA.dineroCaja, fmtNum(derived.principal.final));
    setText(form, S26_CONCIL_CAJA.saldoConciliado, fmtNum(derived.principal.final));
  }
  setText(form, S26_SUMMARY.fechaCompletado, finMes);

  const bytes = await guardarConFuente(pdf, form);
  descargar(bytes, `S-26_${mes.id}.pdf`);
}

/* ============================== S-30 ============================== */
export async function generarS30(mes, txs, derived, cong) {
  const pdf = await loadTemplate(TEMPLATES.s30);
  const form = pdf.getForm();
  const s = derived.s30;

  setText(form, S30.congregacion, cong.nombre);
  setText(form, S30.mesAno, nombreMes(mes.id));
  setText(form, S30.a, fmtNum(s.a));
  setText(form, S30.donCongCajas, fmtNum(s.b));
  setText(form, S30.b, fmtNum(s.b));
  setText(form, S30.donOMCajas, fmtNum(s.c));
  setText(form, S30.c, fmtNum(s.c));
  setText(form, S30.d, fmtNum(s.d));

// --- Gastos desglosados ---
// 1. Gastos de salón (esSalon=true) + caja chica → se agrupan en gastoFuncionamiento
const totalSalon = txs
  .filter(t => t.tipo === "gasto" && t.esSalon)
  .reduce((acc, t) => acc + (Number(t.monto) || 0), 0);

const totalCajaSalida = txs
  .filter(t => t.tipo === "cajachica" && t.cajaSubtipo === "salida")
  .reduce((acc, t) => acc + (Number(t.monto) || 0), 0);

const totalFuncionamiento = totalSalon + totalCajaSalida;
if (totalFuncionamiento > 0)
  setText(form, S30.gastoFuncionamiento, fmtNum(totalFuncionamiento));

// 2. Gastos individuales (esSalon=false) → renglones con descripción
const lineasGasto = txs
  .filter(t => t.tipo === "gasto" && !t.esSalon)
  .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""))
  .map(t => ({ desc: t.concepto || "Gasto de la congregación", monto: Number(t.monto) || 0 }));

if (s.cargosCuenta)
  lineasGasto.push({ desc: "Pago por cargos a la cuenta", monto: s.cargosCuenta });

const slots = [
  [S30.gastoOtro1Desc, S30.gastoOtro1],
  [S30.gastoOtro2Desc, S30.gastoOtro2],
  [S30.gastoOtro3Desc, S30.gastoOtro3],
  [S30.gastoOtro4Desc, S30.gastoOtro4],
  [S30.gastoOtro5Desc, S30.gastoOtro5],
];

lineasGasto.slice(0, 5).forEach((g, i) => {
  setText(form, slots[i][0], g.desc);
  setText(form, slots[i][1], fmtNum(g.monto));
});

// Resolución OM y total sin cambio
setText(form, S30.resolucionOM, fmtNum(s.eResolucion));
setText(form, S30.e, fmtNum(s.e));

  // Otros desembolsos
  setText(form, S30.donOMEnviadas, fmtNum(s.f));
  setText(form, S30.f, fmtNum(s.f));
  setText(form, S30.g, fmtNum(s.g));
  setText(form, S30.h, fmtNum(s.h));
  setText(form, S30.i, fmtNum(s.i));
  // Previsiones
  (s.previsiones || []).slice(0, 2).forEach((p, idx) => {
    setText(form, idx === 0 ? S30.prev1Desc : S30.prev2Desc, p.desc);
    setText(form, idx === 0 ? S30.prev1 : S30.prev2, fmtNum(p.monto));
  });
  setText(form, S30.j, fmtNum(s.j));
  setText(form, S30.k, fmtNum(s.k));
  // Anuncio (página 2)
  setText(form, S30.anuncioMes, nombreMes(mes.id));
  setText(form, S30.anuncioB, fmtNum(s.b));
  setText(form, S30.anuncioE, fmtNum(s.e));
  setText(form, S30.anuncioI, fmtNum(s.i));

  const bytes = await guardarConFuente(pdf, form);
  descargar(bytes, `S-30_${mes.id}.pdf`);
}

/* ============================== TO-62 ============================== */
export async function generarTO62(mes, derived, cong) {
  const pdf = await loadTemplate(TEMPLATES.to62);
  const form = pdf.getForm();
  const t = derived.to62;

  setText(form, TO62.nombreCong, cong.nombre);
  setText(form, TO62.numeroCong, cong.numero || "");

  // Método de traspaso
  setCheck(form, TO62.cbAutomatica, t.metodo === "automatica");
  setCheck(form, TO62.cbElectronica, t.metodo === "electronica");
  setCheck(form, TO62.cbCheque, t.metodo === "cheque");

  setText(form, TO62.omCajas, fmtNum(t.omCajas));
  setText(form, TO62.resolucion, fmtNum(t.resolucion));
  setText(form, TO62.cargos, fmtNum(t.cargos));
  (t.otras || []).slice(0, 5).forEach((o, idx) => {
    const dKey = `otra${idx + 1}Desc`;
    const vKey = `otra${idx + 1}`;
    setText(form, TO62[dKey], o.desc);
    setText(form, TO62[vKey], fmtNum(o.monto));
  });
  setText(form, TO62.totalDonaciones, fmtNum(t.totalDonacionesPagos));
  setText(form, TO62.fondosDepositar, fmtNum(t.fondosDepositar));
  setText(form, TO62.totalFondos, fmtNum(t.totalFondosEnviados));
  setText(form, TO62.referencia, t.referencia);
  if (t.reembolso) setText(form, TO62.reembolso, fmtNum(t.reembolso));
  setText(form, TO62.fechaTransaccion, formatFechaMedia(t.fechaTransaccion));
  if (t.confirmacion) {
    const partes = String(t.confirmacion).split("/");
    setText(form, TO62.confirmacion1, partes[0] || "");
    setText(form, TO62.confirmacion2, partes[1] || "");
  }
  setText(form, TO62.personaLlena, t.personaLlena || cong.siervoCuentas);
  setText(form, TO62.personaAutoriza, t.personaAutoriza);

  const bytes = await guardarConFuente(pdf, form);
  descargar(bytes, `TO-62_${mes.id}.pdf`);
}

/* ----------------------------- helpers ----------------------------- */
function formatFechaCorta(iso) {
  if (!iso) return "";
  const [, , d] = iso.split("-");
  if (!d) return iso;
  return String(parseInt(d, 10));
}

function ultimoDiaMes(year, month) {
  const d = new Date(year, month, 0).getDate();
  return `${d} de ${MESES_ES[month - 1]} del ${year}`;
}

function formatFechaMedia(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!d) return iso;
  const mes = MESES_ES[parseInt(m, 10) - 1].slice(0, 3);
  return `${parseInt(d, 10)}-${mes}-${y}`;
}