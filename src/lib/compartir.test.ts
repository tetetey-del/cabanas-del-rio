import { describe, expect, it } from "vitest";
import { archivoICS, enlaceCompartirWhatsApp, textoReserva } from "./compartir";
import type { Reserva } from "./tipos";

const r: Reserva = {
  id: "x",
  codigo: "CR-TEST",
  tipo: "semanas",
  categoria: "p4",
  desde: "2027-01-02",
  hasta: "2027-01-09",
  tramos: [{ cabana: "molle", desde: "2027-01-02", hasta: "2027-01-09" }],
  nombre: "Familia Romero",
  celular: "351 444-1290",
  personas: 4,
  total: 700000,
  creada: "2026-11-09T20:00:00.000Z",
  estado: "activa",
};

describe("compartir reserva", () => {
  it("arma el texto con código, cabaña, fechas y total", () => {
    const t = textoReserva(r);
    expect(t).toContain("CR-TEST");
    expect(t).toContain("Cabaña Molle (Para 4)");
    expect(t).toContain("sábado 2 de enero, desde las 13:00");
    expect(t).toContain("sábado 9 de enero, hasta las 10:00");
    expect(t).toContain("$700.000");
  });

  it("el enlace de WhatsApp no tiene número: la persona elige el contacto", () => {
    expect(enlaceCompartirWhatsApp(r).startsWith("https://wa.me/?text=")).toBe(true);
  });

  it("el .ics tiene el evento con ingreso y salida en hora de Córdoba (UTC-3)", () => {
    const ics = archivoICS(r, new Date("2026-11-09T20:00:00Z"));
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART:20270102T160000Z");
    expect(ics).toContain("DTEND:20270109T130000Z");
    expect(ics).toContain("UID:CR-TEST@cabanas-del-rio");
    const enc = new TextEncoder();
    expect(ics.split("\r\n").every((l) => enc.encode(l).length <= 75)).toBe(true);
  });
});
