import { Link, useParams } from "react-router-dom";
import { CATEGORIAS } from "../config";
import { Aviso, Fila, Pagina } from "../components/ui";
import { fechaHora, rangoSemana } from "../lib/fechas";
import { buscarSemana, posicion } from "../lib/reglas";
import { useStore } from "../store";

export default function Anotada() {
  const { id } = useParams();
  const { anotaciones } = useStore();
  const a = anotaciones.find((x) => x.id === id);

  if (!a) {
    return (
      <Pagina titulo="Lista de espera" volver="/">
        <Aviso tipo="atencion" titulo="No encontramos esa anotación">
          La lista se guarda en este navegador. Si te anotaste desde otro teléfono, buscala ahí.
        </Aviso>
        <Link to="/" className="btn-principal mt-4">Volver al inicio</Link>
      </Pagina>
    );
  }

  const s = buscarSemana(a.semana);
  const pos = posicion(anotaciones, a);
  const primerNombre = a.nombre.startsWith("Familia") ? a.nombre : a.nombre.split(" ")[0];

  return (
    <Pagina titulo="Lista de espera" volver="/" barra={<Link to="/" className="btn-principal">Volver al inicio</Link>}>
      <div className="space-y-5">
        <div className="rounded-2xl bg-agua-800 p-5 text-center text-piedra-50">
          {pos ? (
            <>
              <p className="text-sm text-agua-100">Gracias, {primerNombre}. Ya estás en la lista.</p>
              <p className="mt-3 font-titulo text-6xl font-semibold text-arena-400">{pos}</p>
              <p className="mt-2 font-titulo text-xl text-piedra-50">Sos la familia número {pos} en la lista</p>
            </>
          ) : (
            <p className="font-titulo text-xl text-piedra-50">
              {a.estado === "Reservó" ? "¡Ya reservaron esta semana!" : "Esta anotación ya no está en la lista."}
            </p>
          )}
        </div>

        <div className="tarjeta px-4 py-2">
          <Fila etiqueta="Semana">{s ? rangoSemana(s.desde, s.hasta) : a.semana}</Fila>
          <Fila etiqueta="Categoría">{CATEGORIAS[a.categoria].nombre}</Fila>
          <Fila etiqueta="Personas">{a.personas}</Fila>
          <Fila etiqueta="Anotada el">{fechaHora(a.creada)}</Fila>
        </div>

        <p className="text-sm">
          Si se libera un lugar, te escribimos al {a.celular} por orden de llegada. Anotarte no reserva el lugar:
          si ves que la semana vuelve a tener lugar, podés reservarla directamente.
        </p>
      </div>
    </Pagina>
  );
}
