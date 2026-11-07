// Fechas como texto ISO "AAAA-MM-DD" (sin horas) para evitar problemas de zona horaria.

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const DIAS_LARGOS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MESES_LARGOS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function aUTC(iso: string): Date {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

function aISO(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

export function sumarDias(iso: string, dias: number): string {
  const f = aUTC(iso);
  f.setUTCDate(f.getUTCDate() + dias);
  return aISO(f);
}

/** Cantidad de días entre a y b (b - a). */
export function diferenciaDias(a: string, b: string): number {
  return Math.round((aUTC(b).getTime() - aUTC(a).getTime()) / 86400000);
}

export function diaSemana(iso: string): number {
  return aUTC(iso).getUTCDay();
}

export function hoyISO(): string {
  const h = new Date();
  const m = String(h.getMonth() + 1).padStart(2, "0");
  const d = String(h.getDate()).padStart(2, "0");
  return `${h.getFullYear()}-${m}-${d}`;
}

/** Noches de una estadía: desde la llegada hasta el día anterior a la salida. */
export function noches(desde: string, hasta: string): string[] {
  const n = diferenciaDias(desde, hasta);
  return Array.from({ length: Math.max(n, 0) }, (_, i) => sumarDias(desde, i));
}

export function seSuperponen(aDesde: string, aHasta: string, bDesde: string, bHasta: string) {
  return aDesde < bHasta && bDesde < aHasta;
}

/** "sáb 2 ene" */
export function fechaCorta(iso: string): string {
  const f = aUTC(iso);
  return `${DIAS[f.getUTCDay()]} ${f.getUTCDate()} ${MESES[f.getUTCMonth()]}`;
}

/** "sábado 2 de enero" */
export function fechaLarga(iso: string): string {
  const f = aUTC(iso);
  return `${DIAS_LARGOS[f.getUTCDay()]} ${f.getUTCDate()} de ${MESES_LARGOS[f.getUTCMonth()]}`;
}

/** "2 de enero de 2027" */
export function fechaConAnio(iso: string): string {
  const f = aUTC(iso);
  return `${f.getUTCDate()} de ${MESES_LARGOS[f.getUTCMonth()]} de ${f.getUTCFullYear()}`;
}

/** "del sábado 9 al sábado 16 de enero" */
export function rangoSemana(desde: string, hasta: string): string {
  const a = aUTC(desde);
  const b = aUTC(hasta);
  const mismoMes = a.getUTCMonth() === b.getUTCMonth();
  const inicio = mismoMes
    ? `${DIAS_LARGOS[a.getUTCDay()]} ${a.getUTCDate()}`
    : fechaLarga(desde);
  return `del ${inicio} al ${fechaLarga(hasta)}`;
}

/** "2 al 9 ene" / "30 ene al 6 feb" */
export function rangoCorto(desde: string, hasta: string): string {
  const a = aUTC(desde);
  const b = aUTC(hasta);
  if (a.getUTCMonth() === b.getUTCMonth()) {
    return `${a.getUTCDate()} al ${b.getUTCDate()} ${MESES[b.getUTCMonth()]}`;
  }
  return `${a.getUTCDate()} ${MESES[a.getUTCMonth()]} al ${b.getUTCDate()} ${MESES[b.getUTCMonth()]}`;
}

/** Fecha y hora de una marca de tiempo ISO completa: "5 nov, 18:42" */
export function fechaHora(marca: string): string {
  const f = new Date(marca);
  const hh = String(f.getHours()).padStart(2, "0");
  const mm = String(f.getMinutes()).padStart(2, "0");
  return `${f.getDate()} ${MESES[f.getMonth()]}, ${hh}:${mm}`;
}

export function pesos(monto: number): string {
  const texto = String(Math.round(Math.abs(monto))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (monto < 0 ? "-$" : "$") + texto;
}
