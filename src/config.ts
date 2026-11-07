// Configuración del negocio. Todos los valores son DE EJEMPLO y se cambian acá.

export const NEGOCIO = {
  nombre: "Cabañas del Río",
  bajada: "Cabañas familiares sobre el río, en las sierras",
  ingreso: "13:00",
  salida: "10:00",
};

/**
 * Clave del panel /admin.
 * Se puede cambiar de dos formas:
 *  1) Variable de entorno VITE_CLAVE_PANEL (archivo .env o variables del hosting).
 *  2) Editando el valor por defecto de abajo.
 * Es una clave de demostración: no protege datos reales (todo vive en el navegador).
 */
export const CLAVE_PANEL: string =
  (import.meta.env.VITE_CLAVE_PANEL as string | undefined) || "rio2027";

export type Categoria = "p4" | "p6";

export const CATEGORIAS: Record<
  Categoria,
  { nombre: string; capacidad: number; descripcion: string }
> = {
  p4: {
    nombre: "Para 4",
    capacidad: 4,
    descripcion: "Dormitorio matrimonial y dos camas en el comedor.",
  },
  p6: {
    nombre: "Para 6",
    capacidad: 6,
    descripcion: "Dos dormitorios y dos camas en el comedor.",
  },
};

export const COMUN_A_TODAS = "Un baño y cocina equipada.";

// El orden define cuál es "la primera cabaña libre".
export const CABANAS: { id: string; nombre: string; categoria: Categoria }[] = [
  { id: "sauce", nombre: "Sauce", categoria: "p4" },
  { id: "molle", nombre: "Molle", categoria: "p4" },
  { id: "tala", nombre: "Tala", categoria: "p4" },
  { id: "algarrobo", nombre: "Algarrobo", categoria: "p6" },
  { id: "chanar", nombre: "Chañar", categoria: "p6" },
];

/** Temporada alta: semanas cerradas de sábado a sábado. */
export const TEMPORADA_ALTA = {
  inicio: "2027-01-02", // sábado
  semanas: 8, // última semana: 20 al 27 de febrero
  precioSemana: { p4: 700000, p6: 980000 } as Record<Categoria, number>,
};

/** Temporada media (por noche). Rangos de noches inclusive, formato MM-DD. */
export const TEMPORADA_MEDIA = {
  rangos: [
    { desde: "12-15", hasta: "01-01" },
    { desde: "07-01", hasta: "07-31" },
  ],
  precioNoche: { p4: 85000, p6: 115000 } as Record<Categoria, number>,
  minimoNoches: 3,
};

/** Temporada baja: el resto del año (por noche). */
export const TEMPORADA_BAJA = {
  precioNoche: { p4: 60000, p6: 85000 } as Record<Categoria, number>,
  minimoNoches: 2,
};

/** Tope de noches para una estadía fuera de temporada alta (evita errores de carga). */
export const MAXIMO_NOCHES = 30;
