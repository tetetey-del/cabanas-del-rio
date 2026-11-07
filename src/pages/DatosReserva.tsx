import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CABANAS, CATEGORIAS, NEGOCIO, type Categoria } from "../config";
import { Aviso, Contador, Fila, Pagina } from "../components/ui";
import { fechaCorta, hoyISO, pesos } from "../lib/fechas";
import { planificarNoches, planificarSemanas } from "../lib/reglas";
import { useStore } from "../store";

export default function DatosReserva() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const store = useStore();
  const categoria: Categoria = params.get("categoria") === "p6" ? "p6" : "p4";
  const semanas = (params.get("semanas") || "").split(",").filter(Boolean);
  const desde = params.get("desde") || "";
  const hasta = params.get("hasta") || "";
  const porSemanas = semanas.length > 0;
  const cat = CATEGORIAS[categoria];

  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [personas, setPersonas] = useState(Math.min(4, cat.capacidad));
  const [error, setError] = useState<string | null>(null);

  const plan = porSemanas
    ? planificarSemanas(store.reservas, categoria, semanas)
    : planificarNoches(store.reservas, categoria, desde, hasta, hoyISO());

  const volver = `/reservar?categoria=${categoria}&modo=${porSemanas ? "semanas" : "noches"}`;

  if (!plan.ok) {
    const semanaCompleta = "semanaCompleta" in plan ? plan.semanaCompleta : undefined;
    return (
      <Pagina titulo="Tus datos" volver={volver}>
        <Aviso tipo="atencion" titulo="Esas fechas ya no están disponibles">
          <p>{plan.error}</p>
        </Aviso>
        <div className="mt-4 space-y-3">
          {semanaCompleta ? (
            <Link to={`/lista?semana=${semanaCompleta.desde}&categoria=${categoria}`} className="btn-principal">
              Anotarme en la lista de espera
            </Link>
          ) : null}
          <Link to={volver} className="btn-secundario w-full">
            Elegir otras fechas
          </Link>
        </div>
      </Pagina>
    );
  }

  const cabanas = Array.from(new Set(("tramos" in plan ? plan.tramos.map((t) => t.cabana) : [plan.cabana])));
  const nombresCabanas = cabanas.map((id) => CABANAS.find((c) => c.id === id)?.nombre).join(" y ");

  function enviar(e: FormEvent) {
    e.preventDefault();
    const datos = { nombre, celular, personas };
    const r = porSemanas
      ? store.reservarSemanas(categoria, semanas, datos)
      : store.reservarNoches(categoria, desde, hasta, datos);
    if (!r.ok) return setError(r.error);
    navigate(`/reserva/${r.valor.codigo}`, { replace: true });
  }

  return (
    <Pagina
      titulo="Tus datos"
      volver={volver}
      barra={
        <button type="submit" form="form-reserva" className="btn-principal">
          Confirmar reserva · {pesos(plan.total)}
        </button>
      }
    >
      <form id="form-reserva" onSubmit={enviar} className="space-y-5" noValidate>
        <div className="tarjeta px-4 py-2">
          <Fila etiqueta="Cabaña">{cat.nombre} · {nombresCabanas}</Fila>
          <Fila etiqueta="Llegada">{fechaCorta(plan.desde)}, desde las {NEGOCIO.ingreso}</Fila>
          <Fila etiqueta="Salida">{fechaCorta(plan.hasta)}, hasta las {NEGOCIO.salida}</Fila>
          <Fila etiqueta="Estadía">
            {"semanas" in plan
              ? `${plan.semanas.length} ${plan.semanas.length === 1 ? "semana" : "semanas"}`
              : `${plan.detalle.length} noches`}
          </Fila>
          <Fila etiqueta="Total">{pesos(plan.total)}</Fila>
        </div>

        {error ? <Aviso tipo="atencion">{error}</Aviso> : null}

        <label className="block">
          <span className="etiqueta">Nombre o familia</span>
          <input className="campo" autoComplete="name" placeholder="Ej.: Familia Romero" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </label>
        <label className="block">
          <span className="etiqueta">Celular con WhatsApp</span>
          <input className="campo" type="tel" inputMode="tel" autoComplete="tel" placeholder="Ej.: 351 555-1234" value={celular} onChange={(e) => setCelular(e.target.value)} />
        </label>
        <div>
          <span className="etiqueta">¿Cuántas personas vienen?</span>
          <Contador valor={personas} min={1} max={cat.capacidad} onCambio={setPersonas} />
        </div>
        <p className="text-sm text-piedra-400">
          No se cobra nada desde acá. Te escribimos por WhatsApp para coordinar la llegada.
        </p>
      </form>
    </Pagina>
  );
}
