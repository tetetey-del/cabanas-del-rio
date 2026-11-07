import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CATEGORIAS, TEMPORADA_ALTA, type Categoria } from "../config";
import { Aviso, Contador, Fila, Pagina } from "../components/ui";
import { pesos, rangoSemana } from "../lib/fechas";
import { buscarSemana, cupoSemana, enLista } from "../lib/reglas";
import { useStore } from "../store";

export default function Anotarse() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const store = useStore();
  const categoria: Categoria = params.get("categoria") === "p6" ? "p6" : "p4";
  const semana = buscarSemana(params.get("semana") || "");
  const cat = CATEGORIAS[categoria];
  const volver = `/reservar?categoria=${categoria}`;

  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [personas, setPersonas] = useState(Math.min(4, cat.capacidad));
  const [error, setError] = useState<string | null>(null);

  if (!semana) {
    return (
      <Pagina titulo="Lista de espera" volver={volver}>
        <Aviso tipo="atencion" titulo="Esa semana no existe">La lista de espera es para las semanas de enero y febrero.</Aviso>
        <Link to={volver} className="btn-principal mt-4">Ver semanas</Link>
      </Pagina>
    );
  }

  const libres = cupoSemana(store.reservas, semana, categoria);
  const antes = enLista(store.anotaciones, semana.desde, categoria).length;

  if (libres > 0) {
    return (
      <Pagina titulo="Lista de espera" volver={volver}>
        <Aviso tipo="ok" titulo="¡Esta semana tiene lugar!">
          Quedan {libres} {libres === 1 ? "lugar" : "lugares"} en {cat.nombre}. No hace falta anotarse: podés reservarla ahora.
        </Aviso>
        <Link to={`/reservar/datos?categoria=${categoria}&semanas=${semana.desde}`} className="btn-principal mt-4">
          Reservar esta semana
        </Link>
      </Pagina>
    );
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    const r = store.anotarse(semana!.desde, categoria, { nombre, celular, personas });
    if (!r.ok) return setError(r.error);
    navigate(`/lista/${r.valor.id}`, { replace: true });
  }

  return (
    <Pagina
      titulo="Lista de espera"
      volver={volver}
      barra={
        <button type="submit" form="form-lista" className="btn-principal">
          Anotarme en la lista
        </button>
      }
    >
      <form id="form-lista" onSubmit={enviar} className="space-y-5" noValidate>
        <div>
          <h2 className="text-xl font-semibold">Esta semana está completa. Anotate y te avisamos.</h2>
          <p className="mt-2 text-sm">
            Si una familia cancela, les escribimos por WhatsApp en el orden en que se anotaron.
            {antes > 0
              ? ` Hoy hay ${antes} ${antes === 1 ? "familia" : "familias"} antes que vos.`
              : " Todavía no hay nadie anotado: serías la primera familia."}
          </p>
        </div>

        <div className="tarjeta px-4 py-2">
          <Fila etiqueta="Semana">{rangoSemana(semana.desde, semana.hasta)}</Fila>
          <Fila etiqueta="Categoría">{cat.nombre}</Fila>
          <Fila etiqueta="Total si se libera">{pesos(TEMPORADA_ALTA.precioSemana[categoria])}</Fila>
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
          <span className="etiqueta">¿Cuántas personas vendrían?</span>
          <Contador valor={personas} min={1} max={cat.capacidad} onCambio={setPersonas} />
        </div>
        <p className="text-sm text-piedra-400">Anotarte no reserva el lugar ni tiene costo.</p>
      </form>
    </Pagina>
  );
}
