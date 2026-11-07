// DATOS DE EJEMPLO. Todas las familias, celulares y reservas son inventados.
// Se cargan la primera vez que se abre la app y al tocar «Reiniciar datos de ejemplo».

import { TEMPORADA_ALTA, type Categoria } from "../config";
import { noches } from "../lib/fechas";
import { precioNoche, semanasAlta } from "../lib/reglas";
import type { Anotacion, Datos, EstadoEspera, Reserva } from "../lib/tipos";

const S = semanasAlta(); // S[0] = 2 al 9 ene … S[7] = 20 al 27 feb

let n = 0;
function reservaSemanas(
  codigo: string,
  categoria: Categoria,
  cabana: string,
  desde: number,
  hasta: number,
  nombre: string,
  celular: string,
  personas: number,
  creada: string,
  estado: Reserva["estado"] = "activa",
): Reserva {
  const semanas = hasta - desde + 1;
  return {
    id: `r${++n}`,
    codigo,
    tipo: "semanas",
    categoria,
    desde: S[desde].desde,
    hasta: S[hasta].hasta,
    tramos: [{ cabana, desde: S[desde].desde, hasta: S[hasta].hasta }],
    nombre,
    celular,
    personas,
    total: TEMPORADA_ALTA.precioSemana[categoria] * semanas,
    creada,
    estado,
    ...(estado === "cancelada" ? { cancelada: "2026-11-04T19:20:00.000Z" } : {}),
  };
}

function reservaNoches(
  codigo: string,
  categoria: Categoria,
  cabana: string,
  desde: string,
  hasta: string,
  nombre: string,
  celular: string,
  personas: number,
  creada: string,
): Reserva {
  return {
    id: `r${++n}`,
    codigo,
    tipo: "noches",
    categoria,
    desde,
    hasta,
    tramos: [{ cabana, desde, hasta }],
    nombre,
    celular,
    personas,
    total: noches(desde, hasta).reduce((s, x) => s + precioNoche(x, categoria), 0),
    creada,
    estado: "activa",
  };
}

let m = 0;
function anotacion(
  semana: number,
  categoria: Categoria,
  nombre: string,
  celular: string,
  personas: number,
  creada: string,
  estado: EstadoEspera = "Esperando",
): Anotacion {
  return {
    id: `a${++m}`,
    semana: S[semana].desde,
    categoria,
    nombre,
    celular,
    personas,
    creada,
    estado,
  };
}

export function datosDeEjemplo(): Datos {
  n = 0;
  m = 0;
  const reservas: Reserva[] = [
    // Temporada baja y media (por noche)
    reservaNoches("CR-4K2P", "p4", "molle", "2026-11-20", "2026-11-23", "Lucía Bergese", "351 642-7781", 3, "2026-10-30T14:05:00.000Z"),
    reservaNoches("CR-7HQ3", "p4", "sauce", "2026-12-20", "2026-12-24", "Martín Olmedo", "11 4823-5590", 4, "2026-10-21T22:41:00.000Z"),
    reservaNoches("CR-2MV8", "p6", "chanar", "2026-12-26", "2027-01-02", "Familia Cáceres", "341 515-2236", 6, "2026-10-12T13:12:00.000Z"),
    reservaNoches("CR-9TR5", "p6", "algarrobo", "2027-03-05", "2027-03-08", "Gabriela Ponce", "3541 47-8812", 5, "2026-11-03T10:30:00.000Z"),

    // Temporada alta (semanas de sábado a sábado)
    reservaSemanas("CR-5AB1", "p6", "algarrobo", 0, 1, "Familia Ferreyra", "351 678-1123", 6, "2026-10-02T21:15:00.000Z"),
    reservaSemanas("CR-8CD4", "p4", "sauce", 0, 0, "Familia Altamirano", "351 233-9087", 4, "2026-10-09T18:02:00.000Z"),
    reservaSemanas("CR-3EF6", "p6", "chanar", 1, 2, "Familia Quiroga", "11 5961-4470", 5, "2026-10-04T12:47:00.000Z"),
    reservaSemanas("CR-6GH2", "p4", "sauce", 1, 1, "Paula y Diego Roldán", "351 590-3364", 3, "2026-10-15T20:33:00.000Z"),
    reservaSemanas("CR-1JK7", "p4", "molle", 1, 1, "Familia Villalba", "2964 41-2275", 4, "2026-10-19T09:58:00.000Z"),
    reservaSemanas("CR-4LM9", "p6", "algarrobo", 2, 2, "Familia Bustos", "351 704-6618", 6, "2026-10-08T23:10:00.000Z"),
    reservaSemanas("CR-7NP3", "p4", "tala", 2, 2, "Carolina Ledesma", "11 6238-1947", 2, "2026-10-26T16:20:00.000Z"),
    reservaSemanas("CR-2QR5", "p4", "sauce", 3, 3, "Familia Peralta", "3543 52-0381", 4, "2026-10-11T15:44:00.000Z"),
    reservaSemanas("CR-8ST1", "p4", "molle", 3, 3, "Familia Aguirre", "351 318-7726", 4, "2026-10-16T11:09:00.000Z"),
    reservaSemanas("CR-5UV8", "p4", "tala", 3, 3, "Romina Ibarra", "11 3170-8853", 3, "2026-10-22T19:36:00.000Z"),
    reservaSemanas("CR-3WX2", "p6", "algarrobo", 3, 3, "Familia Domínguez", "351 455-2019", 6, "2026-10-18T17:28:00.000Z"),
    reservaSemanas("CR-9YZ4", "p6", "chanar", 4, 4, "Familia Godoy", "341 607-3392", 5, "2026-10-14T14:51:00.000Z"),
    // Cancelada: liberó un lugar Para 6 en la semana del 30 ene
    reservaSemanas("CR-6BC7", "p6", "algarrobo", 4, 4, "Familia Funes", "351 286-4410", 6, "2026-10-05T10:12:00.000Z", "cancelada"),
    reservaSemanas("CR-1DE3", "p4", "sauce", 5, 5, "Familia Moyano", "351 721-5583", 4, "2026-10-28T21:03:00.000Z"),
    reservaSemanas("CR-4FG6", "p4", "molle", 5, 5, "Familia Carrizo", "11 4402-6618", 3, "2026-11-01T13:37:00.000Z"),
    reservaSemanas("CR-7HJ9", "p6", "algarrobo", 6, 6, "Familia Acosta", "351 512-9940", 6, "2026-11-02T18:25:00.000Z"),
    reservaSemanas("CR-2KL1", "p4", "tala", 7, 7, "Familia Navarro", "3547 43-1108", 4, "2026-10-24T12:14:00.000Z"),
  ];

  const anotaciones: Anotacion[] = [
    // 9 al 16 ene, Para 6: completa con tres familias esperando
    anotacion(1, "p6", "Familia Sosa", "351 609-2284", 6, "2026-10-28T20:14:00.000Z"),
    anotacion(1, "p6", "Familia Medina", "11 5520-3317", 5, "2026-11-02T09:41:00.000Z"),
    anotacion(1, "p6", "Familia Paz", "351 377-0952", 6, "2026-11-05T22:03:00.000Z"),
    // 16 al 23 ene, Para 6
    anotacion(2, "p6", "Familia Luna", "343 418-6625", 6, "2026-11-01T17:55:00.000Z"),
    // 23 al 30 ene, Para 4: completa
    anotacion(3, "p4", "Familia Herrera", "351 650-4471", 4, "2026-10-30T11:26:00.000Z"),
    anotacion(3, "p4", "Mariana Díaz", "11 3894-2206", 3, "2026-11-04T15:08:00.000Z"),
    // 30 ene al 6 feb, Para 6: se liberó un lugar (reserva cancelada).
    // Molina fue avisada y no respondió (Descartada): ahora sigue Ríos.
    { ...anotacion(4, "p6", "Familia Molina", "351 266-8130", 6, "2026-10-20T13:30:00.000Z", "Descartada"), actualizada: "2026-11-06T12:00:00.000Z" },
    anotacion(4, "p6", "Familia Ríos", "3541 56-2097", 5, "2026-10-25T19:47:00.000Z"),
    anotacion(4, "p6", "Familia Vega", "351 593-7714", 6, "2026-11-03T08:52:00.000Z"),
    // 6 al 13 feb, Para 4: familia avisada, esperando respuesta
    { ...anotacion(5, "p4", "Familia Gutiérrez", "11 6713-0049", 4, "2026-10-27T21:19:00.000Z", "Avisada"), actualizada: "2026-11-06T18:40:00.000Z" },
    // 13 al 20 feb, Para 6: estaba en la lista y reservó
    { ...anotacion(6, "p6", "Familia Acosta", "351 512-9940", 6, "2026-10-17T10:05:00.000Z", "Reservó"), actualizada: "2026-11-02T18:25:00.000Z" },
  ];

  return { reservas, anotaciones };
}
