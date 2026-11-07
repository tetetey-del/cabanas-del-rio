import { describe, expect, it } from "vitest";
import { datosDeEjemplo } from "../data/ejemplo";
import {
  MENSAJE_SEMANAS_CERRADAS,
  cupoSemana,
  enLista,
  planificarNoches,
  planificarSemanas,
  posicion,
  semanasAlta,
  siguientesParaAvisar,
  temporadaDeNoche,
  textoAviso,
  validarFechas,
} from "./reglas";
import type { Reserva } from "./tipos";

const HOY = "2026-11-07";

describe("semanas de temporada alta", () => {
  it("genera ocho semanas de sábado a sábado", () => {
    const s = semanasAlta();
    expect(s).toHaveLength(8);
    expect(s[0]).toMatchObject({ desde: "2027-01-02", hasta: "2027-01-09" });
    expect(s[7]).toMatchObject({ desde: "2027-02-20", hasta: "2027-02-27" });
  });

  it("no acepta un día suelto ni semanas salteadas", () => {
    const vacio: Reserva[] = [];
    expect(planificarSemanas(vacio, "p4", ["2027-01-03"]).ok).toBe(false);
    expect(planificarSemanas(vacio, "p4", ["2027-01-02", "2027-01-16"]).ok).toBe(false);
    const ok = planificarSemanas(vacio, "p4", ["2027-01-02", "2027-01-09"]);
    expect(ok.ok && ok.total).toBe(1400000);
  });
});

describe("temporadas fuera de alta", () => {
  it("rechaza una estadía de temporada media que termina el 4 de enero", () => {
    const r = validarFechas("2026-12-28", "2027-01-04", HOY);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toBe(MENSAJE_SEMANAS_CERRADAS);
  });

  it("permite terminar justo el 2 de enero o empezar el 27 de febrero", () => {
    expect(validarFechas("2026-12-28", "2027-01-02", HOY).ok).toBe(true);
    expect(validarFechas("2027-02-27", "2027-03-01", HOY).ok).toBe(true);
  });

  it("aplica el mínimo según la noche de llegada", () => {
    expect(validarFechas("2026-12-20", "2026-12-22", HOY).ok).toBe(false); // media: 3
    expect(validarFechas("2026-12-13", "2026-12-15", HOY).ok).toBe(true); // baja: 2
  });

  it("cobra cada noche según su fecha", () => {
    expect(temporadaDeNoche("2026-12-14")).toBe("baja");
    expect(temporadaDeNoche("2026-12-15")).toBe("media");
    expect(temporadaDeNoche("2027-01-01")).toBe("media");
    const r = planificarNoches([], "p4", "2026-12-13", "2026-12-16", HOY);
    expect(r.ok && r.total).toBe(60000 * 2 + 85000);
  });
});

describe("cupo y lista de espera", () => {
  const d = datosDeEjemplo();
  const s = semanasAlta();

  it("una semana completa no se puede reservar", () => {
    expect(cupoSemana(d.reservas, s[1], "p6")).toBe(0);
    const r = planificarSemanas(d.reservas, "p6", [s[1].desde]);
    expect(r.ok).toBe(false);
  });

  it("la lista respeta el orden de anotación", () => {
    const lista = enLista(d.anotaciones, s[1].desde, "p6");
    expect(lista.map((a) => a.nombre)).toEqual(["Familia Sosa", "Familia Medina", "Familia Paz"]);
    expect(posicion(d.anotaciones, lista[2])).toBe(3);
  });

  it("al cancelar, resalta a la primera familia en espera de esa categoría", () => {
    expect(siguientesParaAvisar(d.reservas, d.anotaciones, s[1], "p6")).toHaveLength(0);
    const canceladas = d.reservas.map((r) =>
      r.codigo === "CR-3EF6" ? { ...r, estado: "cancelada" as const } : r,
    );
    const sig = siguientesParaAvisar(canceladas, d.anotaciones, s[1], "p6");
    expect(sig.map((a) => a.nombre)).toEqual(["Familia Sosa"]);
  });

  it("con una familia avisada no resalta a la siguiente hasta descartarla", () => {
    const avisada = d.anotaciones.map((a) => (a.nombre === "Familia Ríos" ? { ...a, estado: "Avisada" as const } : a));
    expect(siguientesParaAvisar(d.reservas, avisada, s[4], "p6")).toHaveLength(0);
    const descartada = avisada.map((a) => (a.nombre === "Familia Ríos" ? { ...a, estado: "Descartada" as const } : a));
    expect(siguientesParaAvisar(d.reservas, descartada, s[4], "p6").map((a) => a.nombre)).toEqual(["Familia Vega"]);
  });

  it("el aviso incluye semana, categoría y total", () => {
    const t = textoAviso(enLista(d.anotaciones, s[1].desde, "p6")[0]);
    expect(t).toContain("sábado 9 al sábado 16 de enero");
    expect(t).toContain("Para 6");
    expect(t).toContain("$980.000");
  });
});
