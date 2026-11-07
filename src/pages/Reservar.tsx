import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CATEGORIAS, TEMPORADA_ALTA, type Categoria } from "../config";
import { Aviso, Chip, Pagina, Selector } from "../components/ui";
import { fechaCorta, hoyISO, pesos, rangoCorto, sumarDias } from "../lib/fechas";
import {
  cupoSemana,
  cupoTotal,
  enLista,
  planificarNoches,
  semanasAlta,
  type DetalleNoche,
} from "../lib/reglas";
import type { Semana } from "../lib/tipos";
import { useStore } from "../store";

type Modo = "semanas" | "noches";

export default function Reservar() {
  const [params, setParams] = useSearchParams();
  const categoria: Categoria = params.get("categoria") === "p6" ? "p6" : "p4";
  const modo: Modo = params.get("modo") === "noches" ? "noches" : "semanas";

  const cambiar = (clave: string, valor: string) => {
    const p = new URLSearchParams(params);
    p.set(clave, valor);
    setParams(p, { replace: true });
  };

  return (
    <ReservarContenido
      key={`${categoria}-${modo}`}
      categoria={categoria}
      modo={modo}
      onCategoria={(c) => cambiar("categoria", c)}
      onModo={(m) => cambiar("modo", m)}
    />
  );
}

function ReservarContenido({
  categoria,
  modo,
  onCategoria,
  onModo,
}: {
  categoria: Categoria;
  modo: Modo;
  onCategoria: (c: Categoria) => void;
  onModo: (m: Modo) => void;
}) {
  const navigate = useNavigate();
  const { reservas, anotaciones } = useStore();
  const semanas = semanasAlta();
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [pista, setPista] = useState<string | null>(null);
  const hoy = hoyISO();
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const plan = useMemo(
    () => (desde && hasta ? planificarNoches(reservas, categoria, desde, hasta, hoy) : null),
    [reservas, categoria, desde, hasta, hoy],
  );

  // Selección de semanas: solo se pueden sumar semanas pegadas al rango elegido.
  function tocarSemana(s: Semana) {
    setPista(null);
    const orden = [...elegidas].sort();
    if (orden.length === 0) return setElegidas([s.desde]);
    const primera = orden[0];
    const ultima = orden[orden.length - 1];
    if (elegidas.includes(s.desde)) {
      if (s.desde === primera || s.desde === ultima) return setElegidas(orden.filter((d) => d !== s.desde));
      return setElegidas([s.desde]);
    }
    if (s.hasta === primera || s.desde === sumarDias(ultima, 7)) return setElegidas([...orden, s.desde].sort());
    setElegidas([s.desde]);
    setPista("Las semanas tienen que ser seguidas, así que empezamos de nuevo desde esta.");
  }

  const ordenadas = [...elegidas].sort();
  const totalSemanas = TEMPORADA_ALTA.precioSemana[categoria] * ordenadas.length;
  const rango =
    ordenadas.length > 0
      ? rangoCorto(ordenadas[0], sumarDias(ordenadas[ordenadas.length - 1], 7))
      : null;

  const continuar = () => {
    const p = new URLSearchParams({ categoria });
    if (modo === "semanas") p.set("semanas", ordenadas.join(","));
    else {
      p.set("desde", desde);
      p.set("hasta", hasta);
    }
    navigate(`/reservar/datos?${p.toString()}`);
  };

  const barra =
    modo === "semanas" ? (
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 text-sm">
          {rango ? (
            <>
              <p className="truncate font-bold">{pesos(totalSemanas)}</p>
              <p className="truncate text-piedra-400">
                {ordenadas.length} {ordenadas.length === 1 ? "semana" : "semanas"} · {rango}
              </p>
            </>
          ) : (
            <p className="text-piedra-400">Elegí una o varias semanas seguidas</p>
          )}
        </div>
        <button className="btn-principal w-auto shrink-0" disabled={!rango} onClick={continuar}>
          Continuar
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 text-sm">
          {plan?.ok ? (
            <>
              <p className="truncate font-bold">{pesos(plan.total)}</p>
              <p className="truncate text-piedra-400">
                {plan.detalle.length} noches · {rangoCorto(desde, hasta)}
              </p>
            </>
          ) : (
            <p className="text-piedra-400">Elegí llegada y salida</p>
          )}
        </div>
        <button className="btn-principal w-auto shrink-0" disabled={!plan?.ok} onClick={continuar}>
          Continuar
        </button>
      </div>
    );

  return (
    <Pagina titulo="Elegí tus fechas" volver="/" barra={barra}>
      <div className="space-y-4">
        <div>
          <p className="etiqueta">Cabaña</p>
          <Selector
            etiqueta="Categoría de cabaña"
            valor={categoria}
            onCambio={onCategoria}
            opciones={[
              { valor: "p4", texto: "Para 4" },
              { valor: "p6", texto: "Para 6" },
            ]}
          />
          <p className="mt-2 text-sm text-piedra-400">{CATEGORIAS[categoria].descripcion}</p>
        </div>

        <div>
          <p className="etiqueta">Temporada</p>
          <Selector
            etiqueta="Temporada"
            valor={modo}
            onCambio={onModo}
            opciones={[
              { valor: "semanas", texto: "Enero y febrero" },
              { valor: "noches", texto: "Otras fechas" },
            ]}
          />
        </div>

        {modo === "semanas" ? (
          <section aria-label="Semanas de temporada alta" className="space-y-3">
            <p className="text-sm">
              En temporada alta alquilamos semanas completas, de sábado a sábado.{" "}
              <strong>{pesos(TEMPORADA_ALTA.precioSemana[categoria])} la semana.</strong>
            </p>
            {pista ? <Aviso>{pista}</Aviso> : null}
            <ul className="space-y-2.5">
              {semanas.map((s) => {
                const libres = cupoSemana(reservas, s, categoria);
                const anotadas = enLista(anotaciones, s.desde, categoria).length;
                const elegida = elegidas.includes(s.desde);
                if (libres === 0) {
                  return (
                    <li key={s.desde} className="tarjeta bg-piedra-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-piedra-400">Semana {s.numero}</p>
                          <p className="font-semibold">
                            {fechaCorta(s.desde)} → {fechaCorta(s.hasta)}
                          </p>
                        </div>
                        <Chip tono="piedra">Completa</Chip>
                      </div>
                      <p className="mt-2 text-sm">
                        Esta semana está completa. Anotate y te avisamos.
                        {anotadas > 0 ? ` Hay ${anotadas} ${anotadas === 1 ? "familia" : "familias"} en la lista.` : ""}
                      </p>
                      <Link
                        to={`/lista?semana=${s.desde}&categoria=${categoria}`}
                        className="btn-secundario mt-3 w-full"
                      >
                        Anotarme en la lista de espera
                      </Link>
                    </li>
                  );
                }
                return (
                  <li key={s.desde}>
                    <button
                      type="button"
                      aria-pressed={elegida}
                      onClick={() => tocarSemana(s)}
                      className={`tarjeta flex w-full items-center gap-3 p-4 text-left transition ${
                        elegida ? "border-agua-500 bg-agua-50 ring-1 ring-agua-500" : "active:bg-agua-50"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          elegida ? "border-agua-500 bg-agua-500 text-white" : "border-piedra-400"
                        }`}
                        aria-hidden
                      >
                        {elegida ? (
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5 9-10" /></svg>
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold uppercase tracking-wide text-piedra-400">Semana {s.numero}</span>
                        <span className="block font-semibold">
                          {fechaCorta(s.desde)} → {fechaCorta(s.hasta)}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-lg font-bold text-agua-800">{libres}</span>
                        <span className="block text-xs text-piedra-400">
                          {libres === 1 ? "lugar" : "lugares"} de {cupoTotal(categoria)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <section aria-label="Otras fechas" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="etiqueta">Llegada</span>
                <input type="date" className="campo px-3" min={hoy} value={desde} onChange={(e) => setDesde(e.target.value)} />
              </label>
              <label className="block">
                <span className="etiqueta">Salida</span>
                <input type="date" className="campo px-3" min={desde || hoy} value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </label>
            </div>
            {plan && !plan.ok ? (
              <Aviso tipo="atencion" titulo={plan.error}>
                {plan.ayuda ? <p>{plan.ayuda}</p> : null}
                {plan.error.startsWith("En enero y febrero") ? (
                  <button className="btn-suave -ml-3 mt-1" onClick={() => onModo("semanas")}>
                    Ver semanas de enero y febrero →
                  </button>
                ) : null}
              </Aviso>
            ) : null}
            {plan?.ok ? <Detalle detalle={plan.detalle} total={plan.total} /> : null}
            {!plan ? (
              <Aviso>
                Fuera de enero y febrero cobramos por noche. Mínimo 3 noches del 15 de diciembre al 1 de enero y en
                julio; el resto del año, mínimo 2.
              </Aviso>
            ) : null}
          </section>
        )}
      </div>
    </Pagina>
  );
}

function Detalle({ detalle, total }: { detalle: DetalleNoche[]; total: number }) {
  const grupos = detalle.reduce<Record<string, { cant: number; precio: number }>>((acc, d) => {
    const k = `${d.temporada}-${d.precio}`;
    acc[k] = acc[k] ? { ...acc[k], cant: acc[k].cant + 1 } : { cant: 1, precio: d.precio };
    return acc;
  }, {});
  return (
    <div className="tarjeta p-4 text-sm">
      <p className="font-bold text-agua-800">¡Hay lugar en esas fechas!</p>
      <ul className="mt-2 space-y-1">
        {Object.entries(grupos).map(([k, g]) => (
          <li key={k} className="flex justify-between">
            <span>
              {g.cant} {g.cant === 1 ? "noche" : "noches"} de temporada {k.split("-")[0]} × {pesos(g.precio)}
            </span>
            <span className="font-semibold">{pesos(g.cant * g.precio)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex justify-between border-t border-piedra-200 pt-2 font-bold">
        <span>Total</span>
        <span>{pesos(total)}</span>
      </div>
    </div>
  );
}
