/**
 * Controlador principal de la aplicación (dashboard).
 */
import { requireAuth, logout } from "./auth.js";
import { CONGREGACION } from "./firebase-config.js";
import * as DB from "./db.js";
import {
  computeMonth,
  fmtMoney,
  nombreMes,
  MESES_ES,
  round2
} from "./calculations.js";
import { generarS26, generarS30, generarTO62 } from "./pdf-generator.js";

/* ----------------------------- estado ----------------------------- */
const state = {
  user: null,
  meses: [],
  mesId: null,
  mes: null,
  txs: [],
  derived: null,
  unsubTx: null
};

const money = (n) =>
  fmtMoney(n, CONGREGACION.localeMoneda, CONGREGACION.moneda);

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* ----------------------------- toast ----------------------------- */
let toastTimer;
function toast(msg, type = "") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = "toast"), 2600);
}

/* ----------------------------- init ----------------------------- */
(async function init() {
  state.user = await requireAuth();
  $("#userEmail").textContent = state.user.email;
  setupNav();
  setupTopbar();
  setupModalShell();
  setupTO62Form();
  setupConfig();
  setupPdfButtons();

  // Cargar meses
  DB.observarMeses((meses) => {
    state.meses = meses;
    renderMesSelect();
    renderHistorial();
    if (!state.mesId && meses.length) selectMes(meses[0].id);
    if (!meses.length) ensureCurrentMonth();
  });
})();

async function ensureCurrentMonth() {
  const now = new Date();
  const id = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  await DB.crearMes(id, {
    year: now.getFullYear(),
    month: now.getMonth() + 1
  });
  selectMes(id);
}

/* ----------------------------- navegación ----------------------------- */
function setupNav() {
  $$("#nav button").forEach((b) =>
    b.addEventListener("click", () => switchView(b.dataset.view))
  );
  $("#logoutBtn").addEventListener("click", async () => {
    await logout();
    window.location.replace("index.html");
  });
  // add buttons (delegation)
  document.body.addEventListener("click", (e) => {
    const add = e.target.closest("[data-add]");
    if (add) openTxModal(add.dataset.add);
  });
}

function switchView(view) {
  $$("#nav button").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === view)
  );
  $$(".view").forEach((v) =>
    v.classList.toggle("active", v.id === `view-${view}`)
  );
  closeSidebar();
}

function setupTopbar() {
  $("#mesSelect").addEventListener("change", (e) => selectMes(e.target.value));
  $("#nuevoMesBtn").addEventListener("click", openNuevoMesModal);
  $("#menuToggle").addEventListener("click", () => {
    $("#sidebar").classList.toggle("open");
    $("#scrim").classList.toggle("open");
  });
  $("#scrim").addEventListener("click", closeSidebar);
  $("#depAutoBtn").addEventListener("click", depositoAutomatico);
}
function closeSidebar() {
  $("#sidebar").classList.remove("open");
  $("#scrim").classList.remove("open");
}

/* ----------------------------- meses ----------------------------- */
function renderMesSelect() {
  const sel = $("#mesSelect");
  sel.innerHTML = state.meses
    .map((m) => `<option value="${m.id}">${nombreMes(m.id)}</option>`)
    .join("");
  if (state.mesId) sel.value = state.mesId;
}

async function selectMes(mesId) {
  state.mesId = mesId;
  $("#mesSelect").value = mesId;
  state.mes = await DB.obtenerMes(mesId);
  $("#mesTitulo").textContent = nombreMes(mesId);
  loadTO62Form();
  loadConfigForm();
  // realtime de transacciones
  if (state.unsubTx) state.unsubTx();
  state.unsubTx = DB.observarTransacciones(mesId, (txs) => {
    state.txs = txs;
    recompute();
  });
}

function recompute() {
  if (!state.mes) return;
  state.derived = computeMonth(state.mes, state.txs);
  renderResumen();
  renderCharts();
  renderDonaciones();
  renderDepositos();
  renderGastos();
  renderCaja();
  updateTO62Totals();
}

/* ----------------------------- RESUMEN ----------------------------- */
function renderResumen() {
  const d = state.derived;
  const s = d.s30;
  // validaciones
  const vEl = $("#validaciones");
  vEl.innerHTML = d.validaciones
    .map(
      (v) =>
        `<div class="badge-valid ${v.ok ? "ok" : "bad"}">${
          v.ok ? "✓" : "⚠"
        } ${v.msg}</div>`
    )
    .join(" ");

  // stat cards
  const cards = [
    { label: "Total ingresos (d)", value: money(s.d), cls: "pos" },
    { label: "Total desembolsos (g)", value: money(s.g), cls: "" },
    {
      label: "Superávit / Déficit (h)",
      value: money(s.h),
      cls: s.h >= 0 ? "pos" : "neg"
    },
    { label: "Fondos al final (i)", value: money(s.i), cls: "" }
  ];
  $("#statCards").innerHTML = cards
    .map(
      (c) => `<div class="card stat">
        <div class="label">${c.label}</div>
        <div class="value ${c.cls}">${c.value}</div>
      </div>`
    )
    .join("");

  // tabla S-30
  const rowsS30 = [
    ["(a) Fondos al comienzo del mes", s.a],
    ["(b) Total recibido para la congregación", s.b],
    ["(c) Total de otros ingresos (OM)", s.c],
    ["(d) Total de ingresos", s.d, true],
    ["(e) Gastos de la congregación", s.e],
    ["(f) Otros desembolsos (OM enviadas)", s.f],
    ["(g) Total de desembolsos", s.g, true],
    ["(h) Superávit / Déficit", s.h],
    ["(i) Fondos al final de mes", s.i, true],
    ["(k) Fondos disponibles al final", s.k]
  ];
  $("#s30Tabla").innerHTML =
    "<tbody>" +
    rowsS30
      .map(
        ([l, v, b]) =>
          `<tr><td${b ? ' style="font-weight:700"' : ""}>${l}</td><td class="num"${
            b ? ' style="font-weight:700"' : ""
          }>${money(v)}</td></tr>`
      )
      .join("") +
    "</tbody>";

  // tabla S-26 saldos
  const sec = [
    ["Recibido", d.recibido],
    ["Cuenta principal", d.principal],
    ["Cuenta secundaria", d.secundaria]
  ];
  let html =
    "<tbody><tr><th>Sección</th><th class='num'>Ant.</th><th class='num'>Entr.</th><th class='num'>Sal.</th><th class='num'>Final</th></tr>";
  for (const [name, o] of sec) {
    html += `<tr><td>${name}</td><td class="num">${money(o.anterior)}</td><td class="num">${money(
      o.entrada
    )}</td><td class="num">${money(o.salida)}</td><td class="num" style="font-weight:700">${money(
      o.final
    )}</td></tr>`;
  }
  html += `<tr><td colspan="1" style="font-weight:700">Total de fondos al final del mes</td><td class="num" style="font-weight:700;color:var(--accent)">${money(
    d.totalFondosFinMes
  )}</td></tr></tbody>`;
  $("#s26Tabla").innerHTML = html;

  // anuncio
  $("#anuncioTexto").innerHTML = `Una copia del <em>Informe mensual de las cuentas de la congregación</em> de <strong>${nombreMes(
    state.mesId
  )}</strong> se colocará en el tablero de anuncios. En resumen, la congregación recibió un total de <strong>${money(
    s.b
  )}</strong>. Los gastos de la congregación ascendieron a <strong>${money(
    s.e
  )}</strong>. El saldo al final del mes es de <strong>${money(s.i)}</strong>.`;
}

/* ---- GRÁFICOS ---- */
const chartInstances = {};

function renderCharts() {
  const s = state.derived.s30;

  const chartDefaults = {
    plugins: {
      legend: {
        labels: { color: "#a0aec8", font: { family: "Inter", size: 12 } }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${money(ctx.parsed || ctx.raw)}`
        }
      }
    }
  };

  function destroyAndCreate(id, config) {
    if (chartInstances[id]) chartInstances[id].destroy();
    const ctx = document.getElementById(id)?.getContext("2d");
    if (!ctx) return;
    chartInstances[id] = new Chart(ctx, config);
  }

  // 1. Donut — Distribución de ingresos
  destroyAndCreate("chartIngresos", {
    type: "doughnut",
    data: {
      labels: ["Congregación", "Obra Mundial"],
      datasets: [{
        data: [s.b, s.c],
        backgroundColor: ["rgba(40,214,168,.75)", "rgba(180,140,255,.75)"],
        borderColor: ["#28d6a8", "#b48cff"],
        borderWidth: 2
      }]
    },
    options: {
      ...chartDefaults,
      cutout: "65%",
      plugins: {
        ...chartDefaults.plugins,
        tooltip: {
          callbacks: { label: (ctx) => ` ${money(ctx.raw)}` }
        }
      }
    }
  });

  // 2. Barras — Ingresos vs Desembolsos vs Superávit
  destroyAndCreate("chartBalance", {
    type: "bar",
    data: {
      labels: ["Ingresos (d)", "Desembolsos (g)", "Superávit/Déficit (h)"],
      datasets: [{
        data: [s.d, s.g, s.h],
        backgroundColor: [
          "rgba(40,214,168,.7)",
          "rgba(79,140,255,.7)",
          s.h >= 0 ? "rgba(40,214,168,.5)" : "rgba(255,92,122,.7)"
        ],
        borderColor: [
          "#28d6a8", "#4f8cff",
          s.h >= 0 ? "#28d6a8" : "#ff5c7a"
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      ...chartDefaults,
      plugins: {
        ...chartDefaults.plugins,
        legend: { display: false }
      },
      scales: {
        x: { ticks: { color: "#a0aec8", font: { size: 11 } }, grid: { color: "rgba(255,255,255,.06)" } },
        y: {
          ticks: {
            color: "#a0aec8",
            callback: (v) => `$${(v / 1000).toFixed(0)}k`
          },
          grid: { color: "rgba(255,255,255,.06)" }
        }
      }
    }
  });

  // 3. Donut — Distribución de desembolsos
  destroyAndCreate("chartDesembolsos", {
    type: "doughnut",
    data: {
      labels: ["Gastos congregación", "OM enviadas"],
      datasets: [{
        data: [s.e, s.f],
        backgroundColor: ["rgba(255,180,84,.75)", "rgba(79,140,255,.75)"],
        borderColor: ["#ffb454", "#4f8cff"],
        borderWidth: 2
      }]
    },
    options: {
      ...chartDefaults,
      cutout: "65%",
      plugins: {
        ...chartDefaults.plugins,
        tooltip: {
          callbacks: { label: (ctx) => ` ${money(ctx.raw)}` }
        }
      }
    }
  });
}

/* ----------------------------- listas ----------------------------- */
function tablaVacia(txt) {
  return `<div class="empty"><div class="big">📭</div>${txt}</div>`;
}

function fechaCorta(iso) {
  if (!iso) return "";
  const [y, m, dd] = iso.split("-");
  return `${dd}/${m}/${y}`;
}

function fechaLarga(iso) {
  if (!iso) return "";
  const [y, m, dd] = iso.split("-");
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio",
                 "Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  return `${parseInt(dd)} de ${meses[parseInt(m)-1]} del ${y}`;
}

function listaTabla(items, columnas, vacio) {
  if (!items.length) return tablaVacia(vacio);
  const head = columnas.map((c) => `<th class="${c.num ? "num" : ""}">${c.t}</th>`).join("");
  const body = items
    .map((it) => {
      const cells = columnas
        .map((c) => `<td class="${c.num ? "num" : ""}">${c.render(it)}</td>`)
        .join("");
      return `<tr>${cells}<td class="row-actions">
        <button class="icon-btn" data-edit="${it.id}">✏️</button>
        <button class="icon-btn del" data-del="${it.id}">🗑️</button>
      </tr>`;
    })
    .join("");
  return `<div class="table-wrap"><table><thead><tr>${head}<th></th></tr></thead><tbody>${body}</tbody></table></div>`;
}

function bindRowActions(container, tipo) {
  container.querySelectorAll("[data-edit]").forEach((b) =>
    b.addEventListener("click", () => {
      const tx = state.txs.find((t) => t.id === b.dataset.edit);
      openTxModal(tipo, tx);
    })
  );
  container.querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", async () => {
      if (confirm("¿Eliminar este registro?")) {
        await DB.eliminarTransaccion(state.mesId, b.dataset.del);
        toast("Registro eliminado", "ok");
      }
    })
  );
}

function renderDonaciones() {
  const items = state.txs.filter((t) => t.tipo === "donacion");
  const el = $("#donacionesList");

  if (!items.length) {
    el.innerHTML = tablaVacia("Sin donaciones registradas este mes.");
    return;
  }

  const porFecha = {};
  for (const tx of items) {
    if (!porFecha[tx.fecha]) porFecha[tx.fecha] = [];
    porFecha[tx.fecha].push(tx);
  }

  const fechasOrdenadas = Object.keys(porFecha).sort();

  el.innerHTML = fechasOrdenadas.map((fecha) => {
    const txsFecha = porFecha[fecha];
    const om = txsFecha.find((t) => t.donTipo === "OM");
    const cong = txsFecha.find((t) => t.donTipo === "C");
    const total = txsFecha.reduce((s, t) => s + t.monto, 0);

    const omHtml = om ? `
      <div class="don-col">
        <div class="don-tipo tag tag-om">Obra Mundial</div>
        <div class="don-monto">${money(om.monto)}</div>
        ${om.descripcion ? `<div class="don-desc">${om.descripcion}</div>` : ""}
      </div>` : "";

    const congHtml = cong ? `
      <div class="don-col">
        <div class="don-tipo tag tag-cong">Congregación</div>
        <div class="don-monto">${money(cong.monto)}</div>
        ${cong.descripcion ? `<div class="don-desc">${cong.descripcion}</div>` : ""}
      </div>` : "";

    const divider = om && cong ? `<div class="don-divider"></div>` : "";

    const omId = om?.id || "";
    const congId = cong?.id || "";

    return `
      <div class="don-card">
        <div class="don-fecha">${fechaLarga(fecha)}</div>
        <div class="don-body">
          ${omHtml}
          ${divider}
          ${congHtml}
        </div>
        <div class="don-total">
          <div class="don-acciones-grupo">
            <button class="icon-btn" data-edit-grupo="${fecha}" data-om="${omId}" data-cong="${congId}">✏️ Editar</button>
            <button class="icon-btn del" data-del-grupo="${fecha}" data-om="${omId}" data-cong="${congId}">🗑️ Eliminar</button>
          </div>
          <div>
            <span class="don-total-label">Total </span>
            <span class="don-total-monto">${money(total)}</span>
          </div>
        </div>
      </div>`;
  }).join("");

  el.querySelectorAll("[data-edit-grupo]").forEach((b) =>
    b.addEventListener("click", () => {
      const om = state.txs.find((t) => t.id === b.dataset.om);
      const cong = state.txs.find((t) => t.id === b.dataset.cong);
      openDonacionGrupoModal(b.dataset.editGrupo, om, cong);
    })
  );

  el.querySelectorAll("[data-del-grupo]").forEach((b) =>
    b.addEventListener("click", async () => {
      if (confirm("¿Eliminar las donaciones de este día?")) {
        const ids = [b.dataset.om, b.dataset.cong].filter(Boolean);
        for (const id of ids) await DB.eliminarTransaccion(state.mesId, id);
        toast("Donaciones eliminadas", "ok");
      }
    })
  );
}

function openDonacionGrupoModal(fecha, txOM = null, txCong = null) {
  const fechaVal = txOM?.fecha || txCong?.fecha || fecha;
  const body = `
    <label>Fecha</label>
    <input type="date" id="m_fecha" value="${fechaVal}" />
    <hr class="sep" />
    <label>💛 Obra Mundial (MXN)</label>
    <input type="number" step="0.01" min="0" id="m_monto_om" value="${txOM?.monto ?? ""}" placeholder="0.00" />
    <label>Descripción OM (opcional)</label>
    <input type="text" id="m_desc_om" value="${txOM?.descripcion ?? ""}" />
    <hr class="sep" />
    <label>💚 Congregación (MXN)</label>
    <input type="number" step="0.01" min="0" id="m_monto_cong" value="${txCong?.monto ?? ""}" placeholder="0.00" />
    <label>Descripción Congregación (opcional)</label>
    <input type="text" id="m_desc_cong" value="${txCong?.descripcion ?? ""}" />`;

  openModal("Editar donaciones", body, async () => {
    const montoOM = round2($("#m_monto_om").value);
    const montoCong = round2($("#m_monto_cong").value);
    const fechaNueva = $("#m_fecha").value;

    if (!(montoOM > 0) && !(montoCong > 0))
      throw new Error("Ingresa al menos un monto válido.");

    if (montoOM > 0) {
      const data = { tipo: "donacion", fecha: fechaNueva, monto: montoOM,
                     donTipo: "OM", descripcion: $("#m_desc_om").value.trim() };
      if (txOM) await DB.actualizarTransaccion(state.mesId, txOM.id, data);
      else await DB.agregarTransaccion(state.mesId, data);
    } else if (txOM) {
      await DB.eliminarTransaccion(state.mesId, txOM.id);
    }

    if (montoCong > 0) {
      const data = { tipo: "donacion", fecha: fechaNueva, monto: montoCong,
                     donTipo: "C", descripcion: $("#m_desc_cong").value.trim() };
      if (txCong) await DB.actualizarTransaccion(state.mesId, txCong.id, data);
      else await DB.agregarTransaccion(state.mesId, data);
    } else if (txCong) {
      await DB.eliminarTransaccion(state.mesId, txCong.id);
    }

    toast("Donaciones actualizadas", "ok");
  });
}

function renderDepositos() {
  const items = state.txs.filter((t) => t.tipo === "deposito");
  const el = $("#depositosList");
  el.innerHTML = listaTabla(
    items,
    [
      { t: "Fecha", render: (t) => fechaCorta(t.fecha) },
      { t: "Descripción", render: (t) => t.descripcion || "Depósito en cuenta principal" },
      { t: "Monto", num: true, render: (t) => money(t.monto) }
    ],
    "Sin depósitos registrados este mes."
  );
  bindRowActions(el, "deposito");
}

function renderGastos() {
  const items = state.txs.filter((t) => t.tipo === "gasto");
  const el = $("#gastosList");
  el.innerHTML = listaTabla(
    items,
    [
      { t: "Fecha", render: (t) => fechaCorta(t.fecha) },
      { t: "Concepto", render: (t) => (t.concepto || "—") + (t.esSalon ? ' <span class="chip">Salón RR</span>' : "") },
      {
        t: "Notas / etiquetas",
        render: (t) =>
          (t.notas || "")
            .split(",")
            .filter(Boolean)
            .map((n) => `<span class="chip">${n.trim()}</span>`)
            .join("") || "—"
      },
      { t: "Monto", num: true, render: (t) => money(t.monto) }
    ],
    "Sin gastos registrados este mes."
  );
  bindRowActions(el, "gasto");
}

function renderCaja() {
  const items = state.txs.filter((t) => t.tipo === "cajachica");
  const el = $("#cajaList");
  el.innerHTML = listaTabla(
    items,
    [
      { t: "Fecha", render: (t) => fechaCorta(t.fecha) },
      {
        t: "Tipo",
        render: (t) =>
          t.cajaSubtipo === "entrada"
            ? '<span class="tag tag-cong">Entrada</span>'
            : '<span class="tag tag-g">Salida</span>'
      },
      { t: "Descripción", render: (t) => t.descripcion || "—" },
      { t: "Monto", num: true, render: (t) => money(t.monto) }
    ],
    "Sin movimientos de caja chica."
  );
  bindRowActions(el, "cajachica");
}

/* ----------------------------- MODAL transacciones ----------------------------- */
const modal = $("#modal");
function setupModalShell() {
  $("#modalClose").addEventListener("click", closeModal);
  $("#modalCancel").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}
function closeModal() {
  modal.classList.remove("open");
}

let currentSaveHandler = null;
function openModal(title, bodyHtml, onSave) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = bodyHtml;
  currentSaveHandler = onSave;
  const saveBtn = $("#modalSave");
  saveBtn.onclick = async () => {
    try {
      saveBtn.disabled = true;
      await currentSaveHandler();
      closeModal();
    } catch (err) {
      toast(err.message || "Error al guardar", "err");
    } finally {
      saveBtn.disabled = false;
    }
  };
  // Listener para toggle card del gasto
  setTimeout(() => {
    const cb = document.getElementById("m_esSalon");
    const card = document.getElementById("m_esSalonCard");
    if (cb && card) {
      cb.addEventListener("change", () => card.classList.toggle("active", cb.checked));
    }
  }, 0);
  modal.classList.add("open");
}

const hoy = () => new Date().toISOString().slice(0, 10);

function fechaDefaultMes() {
  if (!state.mesId) return hoy();
  const [y, m] = hoy().split("-");
  const mesActual = `${y}-${m}`;
  return state.mesId === mesActual ? hoy() : `${state.mesId}-01`;
}

function openTxModal(tipo, tx = null) {
  const editar = !!tx;
  const titulos = {
    donacion: "Donación",
    deposito: "Depósito",
    gasto: "Gasto",
    cajachica: "Movimiento de caja chica"
  };
  let body = "";
  const fecha = tx?.fecha || fechaDefaultMes();
  if (tipo === "donacion") {
    if (editar) {
      // Al editar, mostramos el tipo existente y un solo monto
      const tipoLabel = tx.donTipo === "OM" ? "Obra Mundial (OM)" : "Congregación (C)";
      body = `
        <label>Fecha</label><input type="date" id="m_fecha" value="${fecha}" />
        <label>Tipo</label><input type="text" value="${tipoLabel}" disabled />
        <label>Monto (MXN)</label><input type="number" step="0.01" min="0" id="m_monto" value="${tx?.monto ?? ""}" />
        <label>Descripción (opcional)</label><input type="text" id="m_desc" value="${tx?.descripcion ?? ""}" />`;
    } else {
      // Al registrar, mostramos los dos campos a la vez
      body = `
        <label>Fecha</label><input type="date" id="m_fecha" value="${fecha}" />
        <div class="inline-2">
          <div>
            <label>💛 Congregación — C (MXN)</label>
            <input type="number" step="0.01" min="0" id="m_monto_c" placeholder="0.00" />
          </div>
          <div>
            <label>🌍 Obra Mundial — OM (MXN)</label>
            <input type="number" step="0.01" min="0" id="m_monto_om" placeholder="0.00" />
          </div>
        </div>
        <label>Descripción (opcional)</label><input type="text" id="m_desc" value="" />`;
    }
  } else if (tipo === "deposito") {
    body = `
      <label>Fecha</label><input type="date" id="m_fecha" value="${fecha}" />
      <label>Monto (MXN)</label><input type="number" step="0.01" min="0" id="m_monto" value="${tx?.monto ?? ""}" />
      <label>Descripción (opcional)</label><input type="text" id="m_desc" value="${tx?.descripcion ?? ""}" placeholder="Depósito en cuenta principal" />`;
  } else if (tipo === "gasto") {
  body = `
    <label>Fecha</label><input type="date" id="m_fecha" value="${fecha}" />
    <label>Concepto</label><input type="text" id="m_concepto" value="${tx?.concepto ?? ""}" placeholder="Ej. Electricidad del Salón" />
    <label>Monto (MXN)</label><input type="number" step="0.01" min="0" id="m_monto" value="${tx?.monto ?? ""}" />
    <label>Notas / etiquetas (separadas por coma)</label><input type="text" id="m_notas" value="${tx?.notas ?? ""}" placeholder="mantenimiento, recibo #123" />
    <label class="toggle-card ${tx?.esSalon ? "active" : ""}" id="m_esSalonCard" for="m_esSalon">
      <div class="toggle-card-text">
        <strong>🏛️ Gasto de Salón del Reino</strong>
        <span>Se agrupa en "Gastos de funcionamiento" del S-30 y no aparece en el desglose individual.</span>
      </div>
      <div class="toggle-switch">
        <input type="checkbox" id="m_esSalon" ${tx?.esSalon ? "checked" : ""} />
        <div class="toggle-track"></div>
      </div>
    </label>
    <script>
      document.getElementById('m_esSalon').addEventListener('change', function() {
        document.getElementById('m_esSalonCard').classList.toggle('active', this.checked);
      });
    </script>
    <div class="field-help">Si se activa, el monto se agrupa en "Gastos de funcionamiento" del S-30 y no aparece en el desglose de gastos individuales.</div>`;
  } else if (tipo === "cajachica") {
    body = `
      <label>Fecha</label><input type="date" id="m_fecha" value="${fecha}" />
      <label>Tipo de movimiento</label>
      <select id="m_caja">
        <option value="entrada" ${tx?.cajaSubtipo === "entrada" ? "selected" : ""}>Entrada</option>
        <option value="salida" ${tx?.cajaSubtipo === "salida" ? "selected" : ""}>Salida</option>
      </select>
      <label>Monto (MXN)</label><input type="number" step="0.01" min="0" id="m_monto" value="${tx?.monto ?? ""}" />
      <label>Descripción (opcional)</label><input type="text" id="m_desc" value="${tx?.descripcion ?? ""}" />`;
  }

  openModal(`${editar ? "Editar" : "Registrar"} ${titulos[tipo].toLowerCase()}`, body, async () => {
    // --- Donación nueva: dos campos separados ---
    if (tipo === "donacion" && !editar) {
      const montoC  = round2(parseFloat($("#m_monto_c").value)  || 0);
      const montoOM = round2(parseFloat($("#m_monto_om").value) || 0);
      if (montoC <= 0 && montoOM <= 0) throw new Error("Ingresa al menos un monto (C u OM).");
      const fecha = $("#m_fecha").value;
      const desc  = $("#m_desc").value.trim();
      const ops = [];
      if (montoC  > 0) ops.push(DB.agregarTransaccion(state.mesId, { tipo: "donacion", fecha, monto: montoC,  donTipo: "C",  descripcion: desc }));
      if (montoOM > 0) ops.push(DB.agregarTransaccion(state.mesId, { tipo: "donacion", fecha, monto: montoOM, donTipo: "OM", descripcion: desc }));
      await Promise.all(ops);
      toast(`Donación${ops.length > 1 ? "es" : ""} registrada${ops.length > 1 ? "s" : ""}`, "ok");
      return;
    }

    // --- Resto de tipos (y edición de donación) ---
    const monto = round2($("#m_monto").value);
    if (!(monto > 0)) throw new Error("Ingresa un monto válido.");
    const base = { tipo, fecha: $("#m_fecha").value, monto };
    if (tipo === "donacion") {
      base.donTipo = tx.donTipo; // conserva el tipo original
      base.descripcion = $("#m_desc").value.trim();
    } else if (tipo === "deposito") {
      base.descripcion = $("#m_desc").value.trim();
    } else if (tipo === "gasto") {
      base.concepto = $("#m_concepto").value.trim();
      base.notas    = $("#m_notas").value.trim();
      base.esSalon  = !!$("#m_esSalon").checked;
    } else if (tipo === "cajachica") {
      base.cajaSubtipo = $("#m_caja").value;
      base.descripcion = $("#m_desc").value.trim();
    }
    if (editar) {
      await DB.actualizarTransaccion(state.mesId, tx.id, base);
      toast("Registro actualizado", "ok");
    } else {
      await DB.agregarTransaccion(state.mesId, base);
      toast("Registro agregado", "ok");
    }
  });
}

async function depositoAutomatico() {
  const d = state.derived;
  const pendiente = round2(d.recibido.entrada - d.recibido.salida);
  if (pendiente <= 0) {
    toast("No hay donaciones pendientes de depositar.", "");
    return;
  }
  await DB.agregarTransaccion(state.mesId, {
    tipo: "deposito",
    fecha: hoy(),
    monto: pendiente,
    descripcion: "Depósito a la caja de efectivo"
  });
  toast(`Depósito de ${money(pendiente)} creado`, "ok");
}

/* ----------------------------- NUEVO MES ----------------------------- */
function openNuevoMesModal() {
  const now = new Date();
  const y = now.getFullYear();
  const opcionesMes = MESES_ES.map(
    (m, i) => `<option value="${i + 1}" ${i === now.getMonth() ? "selected" : ""}>${m}</option>`
  ).join("");
  // arrastre desde el último mes cerrado/existente
  const ultimo = state.derived;
  const body = `
    <div class="inline-2">
      <div><label>Mes</label><select id="nm_mes">${opcionesMes}</select></div>
      <div><label>Año</label><input type="number" id="nm_anio" value="${y}" /></div>
    </div>
    <p class="field-help">Los saldos anteriores se toman del mes actualmente seleccionado (si existe).</p>`;
  openModal("Nuevo mes contable", body, async () => {
    const m = parseInt($("#nm_mes").value, 10);
    const yy = parseInt($("#nm_anio").value, 10);
    const id = `${yy}-${String(m).padStart(2, "0")}`;
    const saldoAnterior = ultimo
      ? {
          recibido: ultimo.recibido.final,
          principal: ultimo.principal.final,
          secundaria: ultimo.secundaria.final
        }
      : { recibido: 0, principal: 0, secundaria: 0 };
    await DB.crearMes(id, { year: yy, month: m, saldoAnterior });
    toast("Mes creado", "ok");
    selectMes(id);
  });
}

/* ----------------------------- TO-62 form ----------------------------- */
function setupTO62Form() {
  ["t_resolucion", "t_cargos", "t_fondosDepositar"].forEach((id) =>
    document.getElementById(id).addEventListener("input", updateTO62Totals)
  );
  $("#to62Form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const to62 = {
      metodo: $("#t_metodo").value,
      resolucion: round2($("#t_resolucion").value),
      cargos: round2($("#t_cargos").value),
      fondosDepositar: round2($("#t_fondosDepositar").value),
      fechaTransaccion: $("#t_fecha").value,
      referencia: $("#t_referencia").value.trim(),
      confirmacion: $("#t_confirmacion").value.trim(),
      reembolso: round2($("#t_reembolso").value),
      personaLlena: $("#t_personaLlena").value.trim(),
      personaAutoriza: $("#t_personaAutoriza").value.trim(),
      otras: []
    };
    state.mes.to62 = to62;
    await DB.actualizarMes(state.mesId, { to62 });
    recompute();
    toast("Traspaso guardado", "ok");
  });
}

function loadTO62Form() {
  const t = state.mes?.to62 || {};
  $("#t_metodo").value = t.metodo || "";
  $("#t_resolucion").value = t.resolucion ?? "";
  $("#t_cargos").value = t.cargos ?? "";
  $("#t_fondosDepositar").value = t.fondosDepositar ?? "";
  $("#t_fecha").value = t.fechaTransaccion || "";
  $("#t_referencia").value = t.referencia || "";
  $("#t_confirmacion").value = t.confirmacion || "";
  $("#t_reembolso").value = t.reembolso ?? "";
  $("#t_personaLlena").value = t.personaLlena || CONGREGACION.siervoCuentas;
  $("#t_personaAutoriza").value = t.personaAutoriza || "";
}

function updateTO62Totals() {
  if (!state.derived) return;
  const omCajas = state.derived.totalOM;
  const resol = round2($("#t_resolucion").value);
  const cargos = round2($("#t_cargos").value);
  const fondos = round2($("#t_fondosDepositar").value);
  $("#t_omCajas").value = money(omCajas);
  const totalDon = round2(omCajas + resol + cargos);
  $("#t_totalDon").textContent = money(totalDon);
  $("#t_totalFondos").textContent = money(round2(totalDon + fondos));
}

/* ----------------------------- Config ----------------------------- */
function setupConfig() {
  $("#cfgGuardar").addEventListener("click", async () => {
    const saldoAnterior = {
      recibido: round2($("#cfg_recibido").value),
      principal: round2($("#cfg_principal").value),
      secundaria: round2($("#cfg_secundaria").value)
    };
    state.mes.saldoAnterior = saldoAnterior;
    await DB.actualizarMes(state.mesId, { saldoAnterior });
    recompute();
    toast("Configuración guardada", "ok");
  });
}
function loadConfigForm() {
  const s = state.mes?.saldoAnterior || { recibido: 0, principal: 0, secundaria: 0 };
  $("#cfg_recibido").value = s.recibido ?? 0;
  $("#cfg_principal").value = s.principal ?? 0;
  $("#cfg_secundaria").value = s.secundaria ?? 0;
}

/* ----------------------------- Historial ----------------------------- */
function renderHistorial() {
  const el = $("#historialList");
  if (!state.meses.length) {
    el.innerHTML = tablaVacia("Aún no hay meses registrados.");
    return;
  }
  el.innerHTML = `<div class="grid cols-3">${state.meses
    .map(
      (m) => `<div class="card">
        <h3>${nombreMes(m.id)}</h3>
        <div class="small muted">Estado: ${m.estado || "abierto"}</div>
        <div style="display:flex; gap:8px; margin-top:12px">
          <button class="btn btn-sm" data-open="${m.id}">Abrir</button>
          <button class="btn btn-sm btn-danger" data-delmes="${m.id}">Eliminar</button>
        </div>
      </div>`
    )
    .join("")}</div>`;
  el.querySelectorAll("[data-open]").forEach((b) =>
    b.addEventListener("click", () => {
      selectMes(b.dataset.open);
      switchView("resumen");
    })
  );
  el.querySelectorAll("[data-delmes]").forEach((b) =>
    b.addEventListener("click", async () => {
      if (confirm(`¿Eliminar el mes ${nombreMes(b.dataset.delmes)} y todas sus transacciones?`)) {
        await DB.eliminarMes(b.dataset.delmes);
        if (state.mesId === b.dataset.delmes) {
          state.mesId = null;
          state.mes = null;
        }
        toast("Mes eliminado", "ok");
      }
    })
  );
}

/* ----------------------------- PDFs ----------------------------- */
function setupPdfButtons() {
  $("#pdfS26").addEventListener("click", () => safePdf(() => generarS26(state.mes, state.txs, state.derived, CONGREGACION)));
  $("#pdfS30").addEventListener("click", () => safePdf(() => generarS30(state.mes, state.txs, state.derived, CONGREGACION)));
  $("#pdfTO62").addEventListener("click", () => safePdf(() => generarTO62(state.mes, state.derived, CONGREGACION)));
}
async function safePdf(fn) {
  if (!state.derived) {
    toast("Selecciona un mes primero.", "err");
    return;
  }
  try {
    toast("Generando PDF…");
    await fn();
    toast("PDF generado", "ok");
  } catch (e) {
    console.error(e);
    toast("Error al generar el PDF: " + e.message, "err");
  }
}
