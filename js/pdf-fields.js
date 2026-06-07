/**
 * Mapeo de los nombres de campo de los AcroForms originales.
 * Derivado del análisis de posiciones de campo de cada PDF.
 */

/* ----------------------------- S-26 ----------------------------- */
export const S26_MAX_ROWS = 52;

export function s26RowFields(n) {
  // n = 1..52
  return {
    fecha: `900_${6 + n}_Text_C`,
    desc: `900_${58 + n}_Text`,
    ct: `900_${110 + n}_Text_C`,
    recEnt: `901_${n}_S26Value`,
    recSal: `901_${53 + n}_S26Value`,
    priEnt: `902_${n}_S26Value`,
    priSal: `902_${53 + n}_S26Value`,
    secEnt: `903_${n}_S26Value`,
    secSal: `903_${53 + n}_S26Value`
  };
}

export const S26_HEADER = {
  congregacion: "900_1_Text_C",
  ciudad: "900_2_Text_C",
  provincia: "900_3_Text_C",
  mesAno: "900_4_Text_C"
};

export const S26_TOTALS = {
  recEnt: "901_53_S26TotalValue",
  recSal: "901_106_S26TotalValue",
  priEnt: "902_53_S26TotalValue",
  priSal: "902_106_S26TotalValue",
  secEnt: "903_53_S26TotalValue",
  secSal: "903_106_S26TotalValue"
};

// Página 2 (resumen + conciliaciones)
export const S26_SUMMARY = {
  fechaTermina: "904_28_Text_C",
  fechaCompletado: "904_1_Text_C",
  // RECIBIDO
  recAnterior: "904_29_S26Amount",
  recEntrada: "904_30_S26TotalAmount",
  recSalida: "904_31_S26TotalAmount",
  recFinal: "904_32_S26TotalAmount",
  // CUENTA PRINCIPAL
  priAnterior: "904_33_S26Amount",
  priEntrada: "904_34_S26TotalAmount",
  priSalida: "904_35_S26TotalAmount",
  priFinal: "904_36_S26TotalAmount",
  // CUENTA SECUNDARIA
  secAnterior: "904_38_S26Amount",
  secEntrada: "904_39_S26TotalAmount",
  secSalida: "904_40_S26TotalAmount",
  secFinal: "904_41_S26TotalAmount",
  // Total de fondos al final del mes
  totalFondos: "904_42_S26TotalAmount"
};

// Conciliación de la cuenta principal — CAJA DE EFECTIVO
export const S26_CONCIL_CAJA = {
  dineroCaja: "904_24_S26Amount",
  pagosSinRegistrar: "904_25_S26Amount",
  adelantos: "904_26_S26Amount",
  saldoConciliado: "904_27_S26TotalAmount"
};

// Conciliación de la cuenta principal — CUENTA BANCARIA
export const S26_CONCIL_BANCO = {
  saldoExtracto: "904_2_S26Amount",
  depositosNoExtracto: "904_3_S26Amount",
  comisiones: "904_4_S26Amount",
  totalLineas123: "904_5_S26TotalAmount",
  totalCheques: "904_20_S26TotalAmount",
  intereses: "904_21_S26Amount",
  donacionesElectronicas: "904_22_S26Amount",
  saldoConciliado: "904_23_S26TotalAmount"
};

/* ----------------------------- S-30 ----------------------------- */
export const S30 = {
  congregacion: "900_1_Text",
  mesAno: "900_2_Text",
  a: "901_1_S30_Value", // Fondos al comienzo del mes
  // Recibido para la congregación
  donCongCajas: "901_2_S30_Value",
  donCongElectronicas: "901_3_S30_Value",
  congOtro1Desc: "900_3_Text",
  congOtro1: "901_4_S30_Value",
  congOtro2Desc: "900_4_Text",
  congOtro2: "901_5_S30_Value",
  b: "901_6_S30_Total",
  // Otros ingresos
  donOMCajas: "901_7_S30_Value",
  otroIng1Desc: "900_5_Text",
  otroIng1: "901_8_S30_Value",
  otroIng2Desc: "900_6_Text",
  otroIng2: "901_9_S30_Value",
  c: "901_10_S30_Total",
  d: "901_11_S30_Total",
  // Gastos de la congregación
  gastoFuncionamiento: "901_12_S30_Value",
  resolucionOM: "901_13_S30_Value",
  gastoOtro1Desc: "900_7_Text",
  gastoOtro1: "901_14_S30_Value",
  gastoOtro2Desc: "900_8_Text",
  gastoOtro2: "901_15_S30_Value",
  gastoOtro3Desc: "900_9_Text",
  gastoOtro3: "901_16_S30_Value",
  gastoOtro4Desc: "900_10_Text",
  gastoOtro4: "901_17_S30_Value",
  gastoOtro5Desc: "900_11_Text",
  gastoOtro5: "901_18_S30_Value",
  e: "901_19_S30_Total",
  // Otros desembolsos
  donOMEnviadas: "901_20_S30_Value",
  otroDes1Desc: "900_12_Text",
  otroDes1: "901_21_S30_Value",
  otroDes2Desc: "900_13_Text",
  otroDes2: "901_22_S30_Value",
  f: "901_23_S30_Total",
  g: "901_24_S30_Total",
  h: "901_25_S30_Total",
  i: "901_26_S30_Total",
  // Previsión grandes gastos
  prev1Desc: "900_14_Text",
  prev1: "901_27_S30_Value",
  prev2Desc: "900_15_Text",
  prev2: "901_28_S30_Value",
  j: "901_29_S30_Total",
  k: "901_30_S30_Total",
  // Página 2 (anuncio)
  anuncioMes: "900_16_Text_C",
  anuncioB: "901_31_S30_Total",
  anuncioE: "901_32_S30_Total",
  anuncioI: "901_33_S30_Total"
};

/* ----------------------------- TO-62 ----------------------------- */
export const TO62 = {
  nombreCong: "900_1_Text",
  numeroCong: "900_2_Text",
  // Checkboxes método (valor "Yes")
  cbAutomatica: "900_3_CheckBox",
  cbElectronica: "900_4_CheckBox",
  cbCheque: "900_5_CheckBox",
  // Donaciones y pagos
  omCajas: "901_1_TO62Donate",
  resolucion: "901_2_TO62Donate",
  cargos: "901_3_TO62Donate",
  otra1Desc: "900_6_Text",
  otra1: "901_4_TO62Donate",
  otra2Desc: "900_7_Text",
  otra2: "901_5_TO62Donate",
  otra3Desc: "900_8_Text",
  otra3: "901_6_TO62Donate",
  otra4Desc: "900_9_Text",
  otra4: "901_7_TO62Donate",
  otra5Desc: "900_10_Text",
  otra5: "901_8_TO62Donate",
  totalDonaciones: "901_9_TO62TotalDonate",
  fondosDepositar: "901_10_TO62Funds",
  totalFondos: "901_11_TO62TotalFunds",
  referencia: "900_11_Text",
  reembolso: "901_12_TO62Funds",
  fechaTransaccion: "900_12_Text",
  confirmacion1: "900_13_Text_C",
  confirmacion2: "900_14_Text_C",
  personaLlena: "900_15_Text_C",
  personaAutoriza: "900_16_Text_C"
};
