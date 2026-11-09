import { Link, useParams } from "react-router-dom";
import { CABANAS, CATEGORIAS, COMUN_A_TODAS, NEGOCIO } from "../config";
import { Aviso, Fila, Pagina } from "../components/ui";
import { descargarICS, enlaceCompartirWhatsApp } from "../lib/compartir";
import { fechaCorta, pesos, rangoCorto } from "../lib/fechas";
import { useStore } from "../store";

export default function ReservaConfirmada() {
  const { codigo } = useParams();
  const { reservas } = useStore();
  const r = reservas.find((x) => x.codigo === codigo);

  if (!r) {
    return (
      <Pagina titulo="Reserva" volver="/">
        <Aviso tipo="atencion" titulo="No encontramos esa reserva">
          Las reservas se guardan en este navegador. Si la hiciste desde otro teléfono, buscala ahí.
        </Aviso>
        <Link to="/" className="btn-principal mt-4">Volver al inicio</Link>
      </Pagina>
    );
  }

  const cancelada = r.estado === "cancelada";
  const primerNombre = r.nombre.startsWith("Familia") ? r.nombre : r.nombre.split(" ")[0];

  return (
    <Pagina
      titulo="Tu reserva"
      volver="/"
      barra={<Link to="/" className="btn-principal">Volver al inicio</Link>}
    >
      <div className="space-y-5">
        {cancelada ? (
          <Aviso tipo="atencion" titulo="Esta reserva fue cancelada">
            Si fue un error, escribinos y lo vemos.
          </Aviso>
        ) : (
          <div className="rounded-2xl bg-agua-800 p-5 text-piedra-50">
            <p className="text-sm text-agua-100">Reserva {r.codigo}</p>
            <h2 className="mt-1 text-2xl font-semibold text-piedra-50">¡Listo, {primerNombre}! Te esperamos.</h2>
            <p className="mt-2 text-sm text-agua-100">Guardá este código por cualquier consulta.</p>
          </div>
        )}

        <div className="tarjeta px-4 py-2">
          <Fila etiqueta="Categoría">{CATEGORIAS[r.categoria].nombre}</Fila>
          {r.tramos.map((t, i) => (
            <Fila key={i} etiqueta={r.tramos.length > 1 ? `Cabaña (${rangoCorto(t.desde, t.hasta)})` : "Cabaña"}>
              {CABANAS.find((c) => c.id === t.cabana)?.nombre}
            </Fila>
          ))}
          <Fila etiqueta="Llegada">{fechaCorta(r.desde)}, desde las {NEGOCIO.ingreso}</Fila>
          <Fila etiqueta="Salida">{fechaCorta(r.hasta)}, hasta las {NEGOCIO.salida}</Fila>
          <Fila etiqueta="Personas">{r.personas}</Fila>
          <Fila etiqueta="Total">{pesos(r.total)}</Fila>
        </div>

        {!cancelada ? (
          <section aria-label="Guardar y compartir la reserva" className="space-y-2.5">
            <a
              href={enlaceCompartirWhatsApp(r)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secundario w-full gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.3-.4.8-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2.1.7 2.8.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.2Z" />
              </svg>
              Compartir por WhatsApp
            </a>
            <button type="button" className="btn-secundario w-full gap-2" onClick={() => descargarICS(r)}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
              Agregar al calendario
            </button>
          </section>
        ) : null}

        <p className="text-sm">
          {CATEGORIAS[r.categoria].descripcion} {COMUN_A_TODAS} Te escribimos al {r.celular} para coordinar la llegada.
        </p>
        <p className="text-xs text-piedra-400">Esta reserva queda guardada en este navegador.</p>
      </div>
    </Pagina>
  );
}
