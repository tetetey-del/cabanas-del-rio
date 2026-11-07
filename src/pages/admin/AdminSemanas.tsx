import { Link } from "react-router-dom";
import { CATEGORIAS, type Categoria } from "../../config";
import { Chip } from "../../components/ui";
import { fechaCorta, rangoCorto } from "../../lib/fechas";
import { cupoSemana, cupoTotal, enLista, semanasAlta, siguientesParaAvisar } from "../../lib/reglas";
import { useStore } from "../../store";

const CATS: Categoria[] = ["p4", "p6"];

export default function AdminSemanas() {
  const { reservas, anotaciones } = useStore();
  const semanas = semanasAlta();

  const pendientes = semanas.flatMap((s) =>
    CATS.flatMap((c) => siguientesParaAvisar(reservas, anotaciones, s, c).map((a) => ({ s, c, a }))),
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Temporada alta</h1>
        <p className="text-sm text-piedra-400">Ocho semanas de sábado a sábado, enero y febrero de 2027.</p>
      </div>

      {pendientes.length > 0 ? (
        <section className="rounded-2xl border border-arena-400 bg-arena-100 p-4">
          <h2 className="text-lg font-semibold">Para avisar</h2>
          <p className="text-sm">Se liberó lugar en semanas con familias esperando.</p>
          <ul className="mt-2 space-y-2">
            {pendientes.map(({ s, c, a }) => (
              <li key={a.id}>
                <Link to={`/admin/semana/${s.desde}`} className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-sm active:bg-agua-50">
                  <span>
                    <strong>{a.nombre}</strong>
                    <span className="block text-piedra-400">
                      {rangoCorto(s.desde, s.hasta)} · {CATEGORIAS[c].nombre}
                    </span>
                  </span>
                  <span className="font-semibold text-agua-500">Avisar →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ul className="space-y-2.5">
        {semanas.map((s) => (
          <li key={s.desde}>
            <Link to={`/admin/semana/${s.desde}`} className="tarjeta block p-4 active:bg-agua-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-piedra-400">Semana {s.numero}</p>
                  <p className="font-semibold">
                    {fechaCorta(s.desde)} → {fechaCorta(s.hasta)}
                  </p>
                </div>
                <span className="text-agua-500" aria-hidden>→</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {CATS.map((c) => {
                  const libres = cupoSemana(reservas, s, c);
                  const lista = enLista(anotaciones, s.desde, c).length;
                  const avisar = siguientesParaAvisar(reservas, anotaciones, s, c).length > 0;
                  return (
                    <div key={c} className={`rounded-xl p-2.5 ${avisar ? "bg-arena-100 ring-1 ring-arena-400" : "bg-piedra-50"}`}>
                      <p className="text-xs font-bold text-piedra-400">{CATEGORIAS[c].nombre}</p>
                      {libres === 0 ? (
                        <Chip tono="piedra">Completa</Chip>
                      ) : (
                        <p className="text-sm">
                          <strong className="text-lg text-agua-800">{libres}</strong> de {cupoTotal(c)} libres
                        </p>
                      )}
                      <p className="mt-1 text-xs text-piedra-400">
                        {lista === 0 ? "Sin lista" : `${lista} en lista`}
                        {avisar ? " · ★ avisar" : ""}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
