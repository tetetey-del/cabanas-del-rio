import type { Categoria } from "../config";

export type Temporada = "alta" | "media" | "baja";

/** Una cabaña ocupada entre dos fechas (salida exclusiva). */
export interface Tramo {
  cabana: string;
  desde: string;
  hasta: string;
}

export interface Reserva {
  id: string;
  codigo: string;
  tipo: "semanas" | "noches";
  categoria: Categoria;
  desde: string; // llegada
  hasta: string; // salida
  tramos: Tramo[];
  nombre: string;
  celular: string;
  personas: number;
  total: number;
  creada: string; // marca de tiempo ISO
  estado: "activa" | "cancelada";
  cancelada?: string;
}

export type EstadoEspera = "Esperando" | "Avisada" | "Reservó" | "Descartada";

export interface Anotacion {
  id: string;
  semana: string; // sábado de inicio de la semana
  categoria: Categoria;
  nombre: string;
  celular: string;
  personas: number;
  creada: string; // fecha y hora de anotación
  estado: EstadoEspera;
  actualizada?: string;
}

export interface Datos {
  reservas: Reserva[];
  anotaciones: Anotacion[];
}

export interface Semana {
  numero: number;
  desde: string;
  hasta: string;
}
