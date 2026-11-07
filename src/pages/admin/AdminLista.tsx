import { Link } from "react-router-dom";
import { CATEGORIAS, type Categoria } from "../../config";
import { fechaCorta } from "../../lib/fechas";
import { anotacionesDe, enLista, semanasAlta } from "../../lib/reglas";
import { useStore } from "../../store";
import { ListaEspera } from "./comunes";

const CATS: Categoria[] = ["p4", "p6"];

export default function AdminLista() {
  const { anotaciones } = useStore();
  const grupos = semanasAlta().flatMap((s) =>
    CATS.filter((c) => anotacionesDe(anotaciones, s.desde, c).length > 0).map((c) => ({ s, c })),
  );
  const esperando = anotaciones.filter((a) => a.estado === "Esperando").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Lista de espera</h1>
        <p className="text-sm text-piedra-400">
          {esperando} {esperando === 1 ? "familia esperando" : "familias esperando"}. El número es el orden de anotación.
        </p>
      </div>
      {grupos.length === 0 ? (
        <p className="text-sm text-piedra-400">Nadie se anotó todavía.</p>
      ) : (
        grupos.map(({ s, c }) => (
          <section key={`${s.desde}-${c}`} className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">
                {fechaCorta(s.desde)} → {fechaCorta(s.hasta)}
              </h2>
              <span className="text-sm text-piedra-400">
                {CATEGORIAS[c].nombre} · {enLista(anotaciones, s.desde, c).length} en lista
              </span>
            </div>
            <ListaEspera semana={s.desde} categoria={c} />
            <Link to={`/admin/semana/${s.desde}`} className="btn-suave -ml-3">Ver la semana completa →</Link>
          </section>
        ))
      )}
    </div>
  );
}
