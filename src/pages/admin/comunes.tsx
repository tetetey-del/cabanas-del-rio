import { createContext, useContext, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CABANAS, CATEGORIAS, type Categoria } from "../../config";
import { Chip, Modal } from "../../components/ui";
import { fechaCorta, fechaHora, pesos, rangoCorto } from "../../lib/fechas";
import {
  anotacionesDe,
  buscarSemana,
  enLista,
  enlaceWhatsApp,
  posicion,
  semanasAlta,
  siguientesParaAvisar,
  textoAviso,
} from "../../lib/reglas";
import type { Anotacion, EstadoEspera, Reserva } from "../../lib/tipos";
import { useStore } from "../../store";

export function nombreCabana(id: string) {
  return CABANAS.find((c) => c.id === id)?.nombre ?? id;
}

const TONO_ESTADO: Record<EstadoEspera, "agua" | "piedra" | "arena"> = {
  Esperando: "agua",
  Avisada: "arena",
  Reservó: "agua",
  Descartada: "piedra",
};

/** Lista de espera de una semana y categoría, con las acciones del anfitrión. */
export function ListaEspera({ semana, categoria }: { semana: string; categoria: Categoria }) {
  const { reservas, anotaciones, cambiarEstado } = useStore();
  const [mensaje, setMensaje] = useState<Anotacion | null>(null);
  const [copiado, setCopiado] = useState(false);
  const s = buscarSemana(semana);
  const todas = anotacionesDe(anotaciones, semana, categoria);
  const siguientes = s ? siguientesParaAvisar(reservas, anotaciones, s, categoria).map((a) => a.id) : [];

  if (todas.length === 0) {
    return <p className="text-sm text-piedra-400">Nadie anotado en la lista de espera.</p>;
  }

  function avisar(a: Anotacion) {
    // La app solo arma el mensaje y abre WhatsApp: el envío lo hace una persona.
    window.open(enlaceWhatsApp(a.celular, textoAviso(a)), "_blank", "noopener");
    cambiarEstado(a.id, "Avisada");
    setCopiado(false);
    setMensaje({ ...a, estado: "Avisada" });
  }

  async function copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <>
      <ol className="space-y-2.5">
        {todas.map((a) => {
          const pos = posicion(anotaciones, a);
          const resaltada = siguientes.includes(a.id);
          return (
            <li
              key={a.id}
              className={`rounded-xl border p-3 ${
                resaltada ? "border-arena-400 bg-arena-100 ring-1 ring-arena-400" : "border-piedra-200 bg-white"
              } ${a.estado === "Descartada" || a.estado === "Reservó" ? "opacity-70" : ""}`}
            >
              {resaltada ? (
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-tinta">★ Siguiente para avisar</p>
              ) : null}
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-titulo text-lg font-semibold ${
                    pos ? "bg-agua-800 text-piedra-50" : "bg-piedra-200 text-piedra-400"
                  }`}
                  aria-label={pos ? `Posición ${pos}` : "Fuera de la lista"}
                >
                  {pos ?? "–"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold">{a.nombre}</p>
                    <Chip tono={TONO_ESTADO[a.estado]}>{a.estado}</Chip>
                  </div>
                  <p className="text-sm text-piedra-400">
                    {a.personas} personas · {a.celular}
                  </p>
                  <p className="text-xs text-piedra-400">Anotada el {fechaHora(a.creada)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {a.estado === "Esperando" ? (
                  <button className={resaltada ? "btn-principal" : "btn-secundario w-full"} onClick={() => avisar(a)}>
                    Avisar por WhatsApp
                  </button>
                ) : null}
                {a.estado === "Avisada" ? (
                  <>
                    <button className="btn-secundario flex-1" onClick={() => cambiarEstado(a.id, "Reservó")}>Reservó</button>
                    <button className="btn-secundario flex-1" onClick={() => cambiarEstado(a.id, "Descartada")}>
                      No respondió · Descartar
                    </button>
                    <button className="btn-suave w-full" onClick={() => { setCopiado(false); setMensaje(a); }}>Ver mensaje</button>
                  </>
                ) : null}
                {a.estado === "Descartada" || a.estado === "Reservó" ? (
                  <button className="btn-suave" onClick={() => cambiarEstado(a.id, "Esperando")}>Volver a «Esperando»</button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <Modal abierto={Boolean(mensaje)} onCerrar={() => setMensaje(null)} titulo="Mensaje para WhatsApp">
        {mensaje ? (
          <div className="space-y-4">
            <p className="text-sm text-piedra-400">
              {mensaje.nombre} quedó como «Avisada». Si WhatsApp no se abrió, copiá el texto y mandalo vos.
            </p>
            <p className="whitespace-pre-line rounded-xl bg-agua-50 p-3 text-sm">{textoAviso(mensaje)}</p>
            <a className="btn-principal" href={enlaceWhatsApp(mensaje.celular, textoAviso(mensaje))} target="_blank" rel="noopener noreferrer">
              Abrir WhatsApp
            </a>
            <div className="flex gap-2">
              <button className="btn-secundario flex-1" onClick={() => copiar(textoAviso(mensaje))}>
                {copiado ? "¡Copiado!" : "Copiar texto"}
              </button>
              <button className="btn-secundario flex-1" onClick={() => setMensaje(null)}>Listo</button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

/** Tarjeta de reserva con botón para cancelar. */
export function TarjetaReserva({ r, mostrarCategoria = true }: { r: Reserva; mostrarCategoria?: boolean }) {
  const { reservas, anotaciones, cancelarReserva } = useStore();
  const [confirmar, setConfirmar] = useState(false);
  const mostrarResultado = useContext(ContextoCancelacion);

  function cancelar() {
    const despues = reservas.map((x) => (x.id === r.id ? { ...x, estado: "cancelada" as const } : x));
    const afectadas = semanasAlta().filter((s) => s.desde >= r.desde && s.desde < r.hasta);
    const info = afectadas
      .filter((s) => anotacionesDe(anotaciones, s.desde, r.categoria).length > 0)
      .map((s) => ({
        semana: s.desde,
        categoria: r.categoria,
        nombre: siguientesParaAvisar(despues, anotaciones, s, r.categoria)[0]?.nombre ?? null,
        avisada: enLista(anotaciones, s.desde, r.categoria).some((a) => a.estado === "Avisada"),
      }));
    cancelarReserva(r.id);
    setConfirmar(false);
    mostrarResultado({ nombre: r.nombre, semanas: info });
  }

  const cabanas = Array.from(new Set(r.tramos.map((t) => nombreCabana(t.cabana)))).join(" y ");

  return (
    <li className={`tarjeta p-4 ${r.estado === "cancelada" ? "bg-piedra-50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold">{r.nombre}</p>
          <p className="text-sm text-piedra-400">
            {mostrarCategoria ? `${CATEGORIAS[r.categoria].nombre} · ` : ""}
            {cabanas}
          </p>
        </div>
        {r.estado === "cancelada" ? <Chip tono="piedra">Cancelada</Chip> : <Chip>{r.codigo}</Chip>}
      </div>
      <p className="mt-2 text-sm">
        {fechaCorta(r.desde)} → {fechaCorta(r.hasta)} · {r.personas} personas · {pesos(r.total)}
      </p>
      <p className="text-sm text-piedra-400">{r.celular}</p>
      {r.estado === "activa" ? (
        <button className="btn-suave -ml-3 mt-1 text-sm" onClick={() => setConfirmar(true)}>
          Cancelar reserva
        </button>
      ) : null}

      <Modal abierto={confirmar} onCerrar={() => setConfirmar(false)} titulo="¿Cancelar esta reserva?">
        <p className="text-sm">
          {r.nombre} · {CATEGORIAS[r.categoria].nombre} · {rangoCorto(r.desde, r.hasta)}. El lugar vuelve a quedar libre.
        </p>
        <div className="mt-4 flex gap-2">
          <button className="btn-secundario flex-1" onClick={() => setConfirmar(false)}>No, volver</button>
          <button className="btn-principal flex-1" onClick={cancelar}>Sí, cancelar</button>
        </div>
      </Modal>

    </li>
  );
}

// ---------- Aviso después de cancelar (vive en el layout del panel) ----------

interface InfoCancelacion {
  nombre: string;
  semanas: { semana: string; categoria: Categoria; nombre: string | null; avisada: boolean }[];
}

const ContextoCancelacion = createContext<(i: InfoCancelacion) => void>(() => {});

export function ProveedorCancelacion({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<InfoCancelacion | null>(null);
  const cerrar = () => setInfo(null);
  return (
    <ContextoCancelacion.Provider value={setInfo}>
      {children}
      <Modal abierto={Boolean(info)} onCerrar={cerrar} titulo="Reserva cancelada">
        <div className="space-y-3 text-sm">
          <p>El lugar de {info?.nombre} quedó libre.</p>
          {info?.semanas.map((x) => {
            const s = buscarSemana(x.semana)!;
            return (
              <div key={x.semana} className="rounded-xl border border-arena-400 bg-arena-100 p-3">
                <p className="font-bold">
                  Semana {rangoCorto(s.desde, s.hasta)} · {CATEGORIAS[x.categoria].nombre}
                </p>
                <p className="mt-1">
                  {x.nombre ? (
                    <>
                      Siguiente para avisar: <strong>{x.nombre}</strong>
                    </>
                  ) : x.avisada ? (
                    "Hay una familia avisada esperando respuesta."
                  ) : (
                    "No queda ninguna familia esperando en la lista."
                  )}
                </p>
                <Link to={`/admin/semana/${x.semana}`} className="btn-suave -ml-3 mt-1" onClick={cerrar}>
                  Ir a la lista de esa semana →
                </Link>
              </div>
            );
          })}
          <button className="btn-principal" onClick={cerrar}>
            Listo
          </button>
        </div>
      </Modal>
    </ContextoCancelacion.Provider>
  );
}
