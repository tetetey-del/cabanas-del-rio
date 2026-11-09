// Compartir una reserva: texto para WhatsApp y archivo de calendario (.ics).
// Todo se arma en el navegador: no se conecta ningún servicio externo.

import { CABANAS, CATEGORIAS, NEGOCIO } from "../config";
import { fechaLarga, pesos, sumarDias } from "./fechas";
import type { Reserva } from "./tipos";

/** Zona horaria del complejo (Córdoba, UTC-3 todo el año, sin horario de verano). */
const DESFASE_UTC_HORAS = 3;

function nombresCabanas(r: Reserva) {
  return Array.from(new Set(r.tramos.map((t) => CABANAS.find((c) => c.id === t.cabana)?.nombre ?? t.cabana))).join(" y ");
}

export function textoReserva(r: Reserva): string {
  const cat = CATEGORIAS[r.categoria];
  return [
    `Reserva en ${NEGOCIO.nombre} · código ${r.codigo}`,
    `Cabaña ${nombresCabanas(r)} (${cat.nombre})`,
    `Llegada: ${fechaLarga(r.desde)}, desde las ${NEGOCIO.ingreso}`,
    `Salida: ${fechaLarga(r.hasta)}, hasta las ${NEGOCIO.salida}`,
    `${r.personas} ${r.personas === 1 ? "persona" : "personas"} · Total ${pesos(r.total)}`,
  ].join("\n");
}

/** Abre WhatsApp con el texto armado; la persona elige a quién mandarlo. */
export function enlaceCompartirWhatsApp(r: Reserva): string {
  return `https://wa.me/?text=${encodeURIComponent(textoReserva(r))}`;
}

/** Fecha AAAA-MM-DD + hora local "HH:MM" del complejo → formato UTC de iCalendar (AAAAMMDDTHHMMSSZ). */
function aUTCics(fecha: string, hora: string): string {
  const [h, m] = hora.split(":").map(Number);
  let dia = fecha;
  let horaUTC = h + DESFASE_UTC_HORAS;
  if (horaUTC >= 24) {
    horaUTC -= 24;
    dia = sumarDias(fecha, 1);
  }
  return `${dia.replace(/-/g, "")}T${String(horaUTC).padStart(2, "0")}${String(m).padStart(2, "0")}00Z`;
}

function escaparICS(texto: string) {
  return texto.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Corta las líneas largas a 75 bytes, como pide el estándar iCalendar (RFC 5545). */
function plegar(linea: string): string {
  const partes: string[] = [];
  let actual = "";
  let bytes = 0;
  for (const car of linea) {
    const largo = new TextEncoder().encode(car).length;
    const limite = partes.length === 0 ? 75 : 74; // las continuaciones empiezan con un espacio
    if (bytes + largo > limite) {
      partes.push(actual);
      actual = "";
      bytes = 0;
    }
    actual += car;
    bytes += largo;
  }
  partes.push(actual);
  return partes.join("\r\n ");
}

/** Contenido del archivo .ics con la estadía como un evento. */
export function archivoICS(r: Reserva, ahora = new Date()): string {
  const sello = ahora.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${NEGOCIO.nombre}//Reservas//ES`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${r.codigo}@cabanas-del-rio`,
    `DTSTAMP:${sello}`,
    `DTSTART:${aUTCics(r.desde, NEGOCIO.ingreso)}`,
    `DTEND:${aUTCics(r.hasta, NEGOCIO.salida)}`,
    `SUMMARY:${escaparICS(`Estadía en ${NEGOCIO.nombre} · Cabaña ${nombresCabanas(r)}`)}`,
    `DESCRIPTION:${escaparICS(textoReserva(r))}`,
    `LOCATION:${escaparICS(NEGOCIO.nombre)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lineas.map(plegar).join("\r\n") + "\r\n";
}

export function nombreArchivoICS(r: Reserva) {
  return `reserva-${r.codigo}.ics`;
}

/** Descarga el .ics desde el navegador. */
export function descargarICS(r: Reserva) {
  const blob = new Blob([archivoICS(r)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivoICS(r);
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
