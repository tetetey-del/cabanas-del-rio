// Reglas del negocio: temporadas, semanas cerradas, cupo y lista de espera.
// Son funciones puras (sin React ni localStorage) para poder probarlas.

import {
  CABANAS,
  CATEGORIAS,
  MAXIMO_NOCHES,
  NEGOCIO,
  TEMPORADA_ALTA,
  TEMPORADA_BAJA,
  TEMPORADA_MEDIA,
  type Categoria,
} from "../config";
import {
  diaSemana,
  diferenciaDias,
  fechaLarga,
  noches,
  pesos,
  rangoSemana,
  seSuperponen,
  sumarDias,
} from "./fechas";
import type { Anotacion, Reserva, Semana, Temporada, Tramo } from "./tipos";

export const MENSAJE_SEMANAS_CERRADAS = "En enero y febrero alquilamos de sábado a sábado";

// ---------- Temporadas ----------

export function inicioAlta() {
  return TEMPORADA_ALTA.inicio;
}

export function finAlta() {
  return sumarDias(TEMPORADA_ALTA.inicio, TEMPORADA_ALTA.semanas * 7);
}

/** Las semanas de la temporada alta, generadas a partir del sábado inicial. */
export function semanasAlta(): Semana[] {
  return Array.from({ length: TEMPORADA_ALTA.semanas }, (_, i) => ({
    numero: i + 1,
    desde: sumarDias(TEMPORADA_ALTA.inicio, i * 7),
    hasta: sumarDias(TEMPORADA_ALTA.inicio, (i + 1) * 7),
  }));
}

export function buscarSemana(desde: string): Semana | undefined {
  return semanasAlta().find((s) => s.desde === desde);
}

function enRangoMMDD(mmdd: string, desde: string, hasta: string) {
  // Rango que cruza el año (ej. 12-15 al 01-01)
  if (desde > hasta) return mmdd >= desde || mmdd <= hasta;
  return mmdd >= desde && mmdd <= hasta;
}

/** Temporada a la que pertenece una noche (la fecha de la noche = día de llegada). */
export function temporadaDeNoche(noche: string): Temporada {
  if (noche >= inicioAlta() && noche < finAlta()) return "alta";
  const mmdd = noche.slice(5);
  if (TEMPORADA_MEDIA.rangos.some((r) => enRangoMMDD(mmdd, r.desde, r.hasta))) return "media";
  return "baja";
}

export function precioNoche(noche: string, categoria: Categoria): number {
  const t = temporadaDeNoche(noche);
  if (t === "media") return TEMPORADA_MEDIA.precioNoche[categoria];
  if (t === "baja") return TEMPORADA_BAJA.precioNoche[categoria];
  return TEMPORADA_ALTA.precioSemana[categoria] / 7;
}

export function minimoNoches(llegada: string): number {
  return temporadaDeNoche(llegada) === "media"
    ? TEMPORADA_MEDIA.minimoNoches
    : TEMPORADA_BAJA.minimoNoches;
}

// ---------- Ocupación y cupo ----------

function activas(reservas: Reserva[]) {
  return reservas.filter((r) => r.estado === "activa");
}

export function cabanaLibre(reservas: Reserva[], cabana: string, desde: string, hasta: string) {
  return !activas(reservas).some((r) =>
    r.tramos.some((t) => t.cabana === cabana && seSuperponen(t.desde, t.hasta, desde, hasta)),
  );
}

export function cabanasDeCategoria(categoria: Categoria) {
  return CABANAS.filter((c) => c.categoria === categoria);
}

/** Cabañas de la categoría libres durante todo el rango, en orden de catálogo. */
export function cabanasLibres(reservas: Reserva[], categoria: Categoria, desde: string, hasta: string) {
  return cabanasDeCategoria(categoria).filter((c) => cabanaLibre(reservas, c.id, desde, hasta));
}

/** Lugares que quedan en una semana de temporada alta para una categoría. */
export function cupoSemana(reservas: Reserva[], semana: Semana, categoria: Categoria): number {
  return cabanasLibres(reservas, categoria, semana.desde, semana.hasta).length;
}

export function cupoTotal(categoria: Categoria) {
  return cabanasDeCategoria(categoria).length;
}

// ---------- Semanas (temporada alta) ----------

/** Verifica que las semanas sean seguidas y devuelve el rango completo. */
export function rangoDeSemanas(desdes: string[]): { desde: string; hasta: string; semanas: Semana[] } | null {
  const todas = semanasAlta();
  const elegidas = [...desdes]
    .sort()
    .map((d) => todas.find((s) => s.desde === d))
    .filter((s): s is Semana => Boolean(s));
  if (elegidas.length === 0 || elegidas.length !== desdes.length) return null;
  for (let i = 1; i < elegidas.length; i++) {
    if (elegidas[i].desde !== elegidas[i - 1].hasta) return null;
  }
  return {
    desde: elegidas[0].desde,
    hasta: elegidas[elegidas.length - 1].hasta,
    semanas: elegidas,
  };
}

export type ResultadoSemanas =
  | { ok: true; desde: string; hasta: string; tramos: Tramo[]; total: number; semanas: Semana[] }
  | { ok: false; error: string; semanaCompleta?: Semana };

/**
 * Arma una reserva de una o varias semanas seguidas.
 * Asigna la primera cabaña libre en todas las semanas; si ninguna está libre en
 * todas, asigna la primera libre de cada semana.
 */
export function planificarSemanas(
  reservas: Reserva[],
  categoria: Categoria,
  desdes: string[],
): ResultadoSemanas {
  for (const d of desdes) {
    if (diaSemana(d) !== 6 || !buscarSemana(d)) {
      return { ok: false, error: MENSAJE_SEMANAS_CERRADAS + "." };
    }
  }
  const rango = rangoDeSemanas(desdes);
  if (!rango) {
    return { ok: false, error: "Elegí semanas seguidas, una detrás de otra." };
  }
  for (const s of rango.semanas) {
    if (cupoSemana(reservas, s, categoria) === 0) {
      return {
        ok: false,
        error: `La semana ${rangoSemana(s.desde, s.hasta)} está completa. Anotate y te avisamos.`,
        semanaCompleta: s,
      };
    }
  }
  const unaParaTodas = cabanasLibres(reservas, categoria, rango.desde, rango.hasta)[0];
  const tramos: Tramo[] = unaParaTodas
    ? [{ cabana: unaParaTodas.id, desde: rango.desde, hasta: rango.hasta }]
    : rango.semanas.map((s) => ({
        cabana: cabanasLibres(reservas, categoria, s.desde, s.hasta)[0].id,
        desde: s.desde,
        hasta: s.hasta,
      }));
  return {
    ok: true,
    desde: rango.desde,
    hasta: rango.hasta,
    tramos,
    semanas: rango.semanas,
    total: TEMPORADA_ALTA.precioSemana[categoria] * rango.semanas.length,
  };
}

// ---------- Noches (temporada media y baja) ----------

export interface DetalleNoche {
  noche: string;
  temporada: Temporada;
  precio: number;
}

export type ResultadoNoches =
  | {
      ok: true;
      desde: string;
      hasta: string;
      detalle: DetalleNoche[];
      total: number;
      cabana: string;
    }
  | { ok: false; error: string; ayuda?: string };

/** Valida fechas (sin mirar disponibilidad). */
export function validarFechas(desde: string, hasta: string, hoy: string): { ok: true } | { ok: false; error: string; ayuda?: string } {
  if (!desde || !hasta) return { ok: false, error: "Elegí la fecha de llegada y la de salida." };
  if (desde < hoy) return { ok: false, error: "La llegada tiene que ser desde hoy en adelante." };
  if (hasta <= desde) return { ok: false, error: "La salida tiene que ser después de la llegada." };
  const lista = noches(desde, hasta);
  if (lista.some((n) => temporadaDeNoche(n) === "alta")) {
    return {
      ok: false,
      error: MENSAJE_SEMANAS_CERRADAS,
      ayuda: `Del ${fechaLarga(inicioAlta())} al ${fechaLarga(finAlta())} reservamos semanas completas. Una estadía puede terminar justo el ${fechaLarga(inicioAlta())} o empezar el ${fechaLarga(finAlta())}. Para esas semanas, elegí «Enero y febrero».`,
    };
  }
  const minimo = minimoNoches(desde);
  if (lista.length < minimo) {
    const t = temporadaDeNoche(desde) === "media" ? "temporada media" : "temporada baja";
    return {
      ok: false,
      error: `Llegando el ${fechaLarga(desde)} la estadía mínima es de ${minimo} noches (${t}).`,
    };
  }
  if (lista.length > MAXIMO_NOCHES) {
    return { ok: false, error: `Para estadías de más de ${MAXIMO_NOCHES} noches escribinos y lo vemos juntos.` };
  }
  return { ok: true };
}

export function planificarNoches(
  reservas: Reserva[],
  categoria: Categoria,
  desde: string,
  hasta: string,
  hoy: string,
): ResultadoNoches {
  const v = validarFechas(desde, hasta, hoy);
  if (!v.ok) return v;
  const detalle = noches(desde, hasta).map((n) => ({
    noche: n,
    temporada: temporadaDeNoche(n),
    precio: precioNoche(n, categoria),
  }));
  const libre = cabanasLibres(reservas, categoria, desde, hasta)[0];
  if (!libre) {
    const otra: Categoria = categoria === "p4" ? "p6" : "p4";
    return {
      ok: false,
      error: `No nos quedan cabañas ${CATEGORIAS[categoria].nombre} libres en esas fechas.`,
      ayuda: `Probá con otras fechas o con la categoría ${CATEGORIAS[otra].nombre}.`,
    };
  }
  return {
    ok: true,
    desde,
    hasta,
    detalle,
    total: detalle.reduce((s, d) => s + d.precio, 0),
    cabana: libre.id,
  };
}

// ---------- Lista de espera ----------

/** Deja solo dígitos y se queda con los últimos 10 (código de área + número). */
export function normalizarCelular(cel: string): string {
  return cel.replace(/\D/g, "").slice(-10);
}

export function celularValido(cel: string): boolean {
  return cel.replace(/\D/g, "").length >= 10;
}

export function anotacionesDe(anotaciones: Anotacion[], semana: string, categoria: Categoria) {
  return anotaciones
    .filter((a) => a.semana === semana && a.categoria === categoria)
    .sort((a, b) => a.creada.localeCompare(b.creada));
}

/** Familias que siguen en la lista (Esperando o Avisada), en orden de anotación. */
export function enLista(anotaciones: Anotacion[], semana: string, categoria: Categoria) {
  return anotacionesDe(anotaciones, semana, categoria).filter(
    (a) => a.estado === "Esperando" || a.estado === "Avisada",
  );
}

/** Posición (1, 2, 3…) de una anotación entre las que siguen en la lista. */
export function posicion(anotaciones: Anotacion[], a: Anotacion): number | null {
  const i = enLista(anotaciones, a.semana, a.categoria).findIndex((x) => x.id === a.id);
  return i === -1 ? null : i + 1;
}

/**
 * Familias a resaltar como "siguiente para avisar" en una semana y categoría.
 * Por cada lugar libre que no tenga ya una familia avisada, se resalta la
 * siguiente familia «Esperando» por orden de anotación.
 */
export function siguientesParaAvisar(
  reservas: Reserva[],
  anotaciones: Anotacion[],
  semana: Semana,
  categoria: Categoria,
): Anotacion[] {
  const libres = cupoSemana(reservas, semana, categoria);
  const lista = enLista(anotaciones, semana.desde, categoria);
  const avisadas = lista.filter((a) => a.estado === "Avisada").length;
  const cuantas = Math.max(libres - avisadas, 0);
  return lista.filter((a) => a.estado === "Esperando").slice(0, cuantas);
}

export function textoAviso(a: Anotacion): string {
  const s = buscarSemana(a.semana);
  const cat = CATEGORIAS[a.categoria];
  const total = TEMPORADA_ALTA.precioSemana[a.categoria];
  const semana = s ? rangoSemana(s.desde, s.hasta) : a.semana;
  return (
    `¡Hola, ${a.nombre}! Te escribimos de ${NEGOCIO.nombre}. ` +
    `Se liberó un lugar en la semana ${semana}, categoría ${cat.nombre} (hasta ${cat.capacidad} personas). ` +
    `El total de la semana es ${pesos(total)}. ` +
    `Si la quieren, respondenos este mensaje y la reservamos. ` +
    `Ingreso desde las ${NEGOCIO.ingreso} y salida hasta las ${NEGOCIO.salida}.`
  );
}

/** Enlace de WhatsApp con el texto armado. Lo abre una persona: la app no envía nada. */
export function enlaceWhatsApp(celular: string, texto: string): string {
  const numero = "549" + normalizarCelular(celular);
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function nochesTotales(desde: string, hasta: string) {
  return diferenciaDias(desde, hasta);
}
