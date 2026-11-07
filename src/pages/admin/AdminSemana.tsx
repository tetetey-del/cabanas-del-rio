import { Link, useParams } from "react-router-dom";
import { CATEGORIAS, type Categoria } from "../../config";
import { Aviso, Chip } from "../../components/ui";
import { rangoSemana, seSuperponen } from "../../lib/fechas";
import { buscarSemana, cupoSemana, cupoTotal } from "../../lib/reglas";
import { useStore } from "../../store";
import { ListaEspera, TarjetaReserva } from "./comunes";

const CATS: Categoria[] = ["p4", "p6"];

export default function AdminSemana() {
  const { desde } = useParams();
  const { reservas } = useStore();
  const s = buscarSemana(desde || "");

  if (!s) {
    return (
      <div className="space-y-4">
        <Aviso tipo="atencion">Esa semana no es de temporada alta.</Aviso>
        <Link to="/admin" className="btn-secundario w-full">Ver todas las semanas</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin" className="btn-suave -ml-3">← Todas las semanas</Link>
        <p className="text-xs font-bold uppercase tracking-wide text-piedra-400">Semana {s.numero}</p>
        <h1 className="text-xl font-semibold first-letter:uppercase">{rangoSemana(s.desde, s.hasta).replace(/^del /, "")}</h1>
      </div>

      {CATS.map((c) => {
        const libres = cupoSemana(reservas, s, c);
        const deLaSemana = reservas.filter(
          (r) => r.estado === "activa" && r.categoria === c && seSuperponen(r.desde, r.hasta, s.desde, s.hasta),
        );
        return (
          <section key={c} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{CATEGORIAS[c].nombre}</h2>
              {libres === 0 ? (
                <Chip tono="piedra">Completa</Chip>
              ) : (
                <span className="text-sm">
                  <strong className="text-agua-800">{libres}</strong> de {cupoTotal(c)} libres
                </span>
              )}
            </div>

            <div>
              <h3 className="mb-2 font-sans text-sm font-bold text-piedra-400">Reservas</h3>
              {deLaSemana.length === 0 ? (
                <p className="text-sm text-piedra-400">Todavía no hay reservas.</p>
              ) : (
                <ul className="space-y-2.5">
                  {deLaSemana.map((r) => (
                    <TarjetaReserva key={r.id} r={r} mostrarCategoria={false} />
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="mb-2 font-sans text-sm font-bold text-piedra-400">Lista de espera</h3>
              <ListaEspera semana={s.desde} categoria={c} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
