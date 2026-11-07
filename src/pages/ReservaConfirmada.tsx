import { Link, useParams } from "react-router-dom";
import { CABANAS, CATEGORIAS, COMUN_A_TODAS, NEGOCIO } from "../config";
import { Aviso, Fila, Pagina } from "../components/ui";
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

        <p className="text-sm">
          {CATEGORIAS[r.categoria].descripcion} {COMUN_A_TODAS} Te escribimos al {r.celular} para coordinar la llegada.
        </p>
        <p className="text-xs text-piedra-400">Esta reserva queda guardada en este navegador.</p>
      </div>
    </Pagina>
  );
}
