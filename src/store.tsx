// Estado de la app guardado en localStorage (sin backend).
// Kodarvia puede reemplazar este archivo por llamadas a su API manteniendo las mismas acciones.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CATEGORIAS, type Categoria } from "./config";
import { datosDeEjemplo } from "./data/ejemplo";
import { hoyISO } from "./lib/fechas";
import {
  anotacionesDe,
  buscarSemana,
  celularValido,
  cupoSemana,
  normalizarCelular,
  planificarNoches,
  planificarSemanas,
  posicion,
} from "./lib/reglas";
import type { Anotacion, Datos, EstadoEspera, Reserva } from "./lib/tipos";

export const CLAVE_DATOS = "cabanas-del-rio:datos:v1";

function leer(): Datos {
  try {
    const crudo = localStorage.getItem(CLAVE_DATOS);
    if (crudo) {
      const d = JSON.parse(crudo) as Datos;
      if (Array.isArray(d.reservas) && Array.isArray(d.anotaciones)) return d;
    }
  } catch {
    /* datos corruptos: se recargan los de ejemplo */
  }
  const d = datosDeEjemplo();
  guardar(d);
  return d;
}

function guardar(d: Datos) {
  try {
    localStorage.setItem(CLAVE_DATOS, JSON.stringify(d));
  } catch {
    /* sin almacenamiento disponible: la app sigue funcionando en memoria */
  }
}

function nuevoId() {
  return Math.random().toString(36).slice(2, 10);
}

function nuevoCodigo(existentes: Set<string>) {
  const letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  do {
    c = "CR-" + Array.from({ length: 4 }, () => letras[Math.floor(Math.random() * letras.length)]).join("");
  } while (existentes.has(c));
  return c;
}

export interface DatosContacto {
  nombre: string;
  celular: string;
  personas: number;
}

type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };

interface Store extends Datos {
  reservarSemanas(categoria: Categoria, semanas: string[], c: DatosContacto): Resultado<Reserva>;
  reservarNoches(categoria: Categoria, desde: string, hasta: string, c: DatosContacto): Resultado<Reserva>;
  cancelarReserva(id: string): void;
  anotarse(semana: string, categoria: Categoria, c: DatosContacto): Resultado<Anotacion>;
  cambiarEstado(id: string, estado: EstadoEspera): void;
  reiniciar(): void;
}

const Contexto = createContext<Store | null>(null);

export function validarContacto(c: DatosContacto, capacidad: number): string | null {
  if (c.nombre.trim().length < 2) return "Contanos tu nombre o el de la familia.";
  if (!celularValido(c.celular)) return "Escribí el celular con código de área (ej. 351 555-1234).";
  if (!Number.isInteger(c.personas) || c.personas < 1) return "Indicá cuántas personas vienen.";
  if (c.personas > capacidad) return `Esta categoría es para hasta ${capacidad} personas.`;
  return null;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [datos, setDatos] = useState<Datos>(leer);

  // Mantiene sincronizadas varias pestañas del mismo navegador
  useEffect(() => {
    const escuchar = (e: StorageEvent) => {
      if (e.key === CLAVE_DATOS) setDatos(leer());
    };
    window.addEventListener("storage", escuchar);
    return () => window.removeEventListener("storage", escuchar);
  }, []);

  const actualizar = useCallback((nuevo: Datos) => {
    guardar(nuevo);
    setDatos(nuevo);
  }, []);

  const store = useMemo<Store>(() => {
    const capacidad = (cat: Categoria) => CATEGORIAS[cat].capacidad;
    const codigos = () => new Set(datos.reservas.map((r) => r.codigo));

    /** Si la familia estaba en la lista de esas semanas, pasa a «Reservó». */
    const marcarReservo = (anot: Anotacion[], r: Reserva) => {
      const cel = normalizarCelular(r.celular);
      const ahora = new Date().toISOString();
      return anot.map((a) =>
        a.categoria === r.categoria &&
        a.semana >= r.desde &&
        a.semana < r.hasta &&
        normalizarCelular(a.celular) === cel &&
        (a.estado === "Esperando" || a.estado === "Avisada")
          ? { ...a, estado: "Reservó" as const, actualizada: ahora }
          : a,
      );
    };

    return {
      ...datos,

      reservarSemanas(categoria, semanas, c) {
        const err = validarContacto(c, capacidad(categoria));
        if (err) return { ok: false, error: err };
        const plan = planificarSemanas(datos.reservas, categoria, semanas);
        if (!plan.ok) return { ok: false, error: plan.error };
        const r: Reserva = {
          id: nuevoId(),
          codigo: nuevoCodigo(codigos()),
          tipo: "semanas",
          categoria,
          desde: plan.desde,
          hasta: plan.hasta,
          tramos: plan.tramos,
          nombre: c.nombre.trim(),
          celular: c.celular.trim(),
          personas: c.personas,
          total: plan.total,
          creada: new Date().toISOString(),
          estado: "activa",
        };
        actualizar({ reservas: [...datos.reservas, r], anotaciones: marcarReservo(datos.anotaciones, r) });
        return { ok: true, valor: r };
      },

      reservarNoches(categoria, desde, hasta, c) {
        const err = validarContacto(c, capacidad(categoria));
        if (err) return { ok: false, error: err };
        const plan = planificarNoches(datos.reservas, categoria, desde, hasta, hoyISO());
        if (!plan.ok) return { ok: false, error: plan.ayuda ? `${plan.error}. ${plan.ayuda}` : plan.error };
        const r: Reserva = {
          id: nuevoId(),
          codigo: nuevoCodigo(codigos()),
          tipo: "noches",
          categoria,
          desde,
          hasta,
          tramos: [{ cabana: plan.cabana, desde, hasta }],
          nombre: c.nombre.trim(),
          celular: c.celular.trim(),
          personas: c.personas,
          total: plan.total,
          creada: new Date().toISOString(),
          estado: "activa",
        };
        actualizar({ ...datos, reservas: [...datos.reservas, r] });
        return { ok: true, valor: r };
      },

      cancelarReserva(id) {
        const ahora = new Date().toISOString();
        actualizar({
          ...datos,
          reservas: datos.reservas.map((r) =>
            r.id === id && r.estado === "activa" ? { ...r, estado: "cancelada", cancelada: ahora } : r,
          ),
        });
      },

      anotarse(semana, categoria, c) {
        const err = validarContacto(c, capacidad(categoria));
        if (err) return { ok: false, error: err };
        const s = buscarSemana(semana);
        if (!s) return { ok: false, error: "Esa semana no es de temporada alta." };
        if (cupoSemana(datos.reservas, s, categoria) > 0) {
          return { ok: false, error: "Esta semana tiene lugar: podés reservarla directamente." };
        }
        const cel = normalizarCelular(c.celular);
        const previa = anotacionesDe(datos.anotaciones, semana, categoria).find(
          (a) => normalizarCelular(a.celular) === cel,
        );
        if (previa) {
          const pos = posicion(datos.anotaciones, previa);
          return {
            ok: false,
            error: pos
              ? `Este celular ya está anotado para esta semana. Sos la familia número ${pos} en la lista.`
              : "Este celular ya se anotó para esta semana y categoría.",
          };
        }
        const a: Anotacion = {
          id: nuevoId(),
          semana,
          categoria,
          nombre: c.nombre.trim(),
          celular: c.celular.trim(),
          personas: c.personas,
          creada: new Date().toISOString(),
          estado: "Esperando",
        };
        actualizar({ ...datos, anotaciones: [...datos.anotaciones, a] });
        return { ok: true, valor: a };
      },

      cambiarEstado(id, estado) {
        const ahora = new Date().toISOString();
        actualizar({
          ...datos,
          anotaciones: datos.anotaciones.map((a) => (a.id === id ? { ...a, estado, actualizada: ahora } : a)),
        });
      },

      reiniciar() {
        actualizar(datosDeEjemplo());
      },
    };
  }, [datos, actualizar]);

  return <Contexto.Provider value={store}>{children}</Contexto.Provider>;
}

export function useStore() {
  const s = useContext(Contexto);
  if (!s) throw new Error("useStore fuera de StoreProvider");
  return s;
}
