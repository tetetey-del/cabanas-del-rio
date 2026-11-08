import { Link } from "react-router-dom";
import { CATEGORIAS, COMUN_A_TODAS, NEGOCIO, TEMPORADA_ALTA, TEMPORADA_BAJA, TEMPORADA_MEDIA, type Categoria } from "../config";
import { fechaLarga, pesos } from "../lib/fechas";
import { finAlta, inicioAlta } from "../lib/reglas";

export default function Inicio() {
  const cats = Object.keys(CATEGORIAS) as Categoria[];
  return (
    <div className="mx-auto min-h-[100dvh] max-w-xl">
      {/* Portada: el botón principal entra en la primera pantalla */}
      <section className="relative overflow-hidden bg-agua-800 px-5 pb-10 pt-8 text-piedra-50">
        <svg viewBox="0 0 400 120" className="pointer-events-none absolute -bottom-2 left-0 w-full opacity-30" aria-hidden preserveAspectRatio="none">
          <path d="M0 70c40-20 80 20 120 0s80 20 120 0 80 20 160-5v55H0z" fill="#3F7F78" />
          <path d="M0 95c50-15 90 15 140 0s90 15 140 0 70 10 120-5v30H0z" fill="#DCEBE7" opacity=".5" />
        </svg>
        <div className="relative text-center">
          <svg viewBox="0 0 32 32" className="mx-auto h-11 w-11" aria-hidden>
            <rect width="32" height="32" rx="8" fill="#F5F3EE" />
            <path d="M8 15l8-6 8 6v9H8z" fill="#1F4E4A" />
            <path d="M6 25c3-2 5 2 8 0s5 2 8 0 4 1 4 1" stroke="#D9B77E" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          <h1 className="mt-6 text-[2.5rem] font-semibold leading-none text-piedra-50">{NEGOCIO.nombre}</h1>
          <p className="mt-3 font-titulo text-lg italic text-arena-400">Tu lugar en las sierras cordobesas</p>
          <Link to="/reservar" className="btn-principal mt-8">
            Ver fechas y reservar
          </Link>
        </div>
      </section>

      <main className="space-y-8 px-5 py-8">
        <section>
          <h2 className="text-xl font-semibold">Nuestras cabañas</h2>
          <p className="mt-1 text-sm text-piedra-400">En enero y febrero alquilamos por semana <span className="whitespace-nowrap">(de sábado a sábado).</span></p>
          <div className="mt-3 space-y-3">
            {cats.map((c) => (
              <Link key={c} to={`/reservar?categoria=${c}`} className="tarjeta block p-4 active:bg-agua-50">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold">{CATEGORIAS[c].nombre}</h3>
                  <span className="text-sm text-piedra-400">hasta {CATEGORIAS[c].capacidad} personas</span>
                </div>
                <p className="mt-1 text-sm">{CATEGORIAS[c].descripcion} {COMUN_A_TODAS}</p>
                <p className="mt-2 text-sm font-semibold text-agua-500">Ver disponibilidad →</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Temporadas y precios</h2>
          <div className="tarjeta mt-3 divide-y divide-piedra-200 text-sm">
            <div className="p-4">
              <p className="font-bold text-agua-800">Alta · por semana</p>
              <p className="mt-0.5 text-piedra-400">
                {fechaLarga(inicioAlta())} al {fechaLarga(finAlta())} de 2027
              </p>
              <p className="mt-1">
                Para 4: {pesos(TEMPORADA_ALTA.precioSemana.p4)} · Para 6: {pesos(TEMPORADA_ALTA.precioSemana.p6)}
              </p>
            </div>
            <div className="p-4">
              <p className="font-bold text-agua-800">Media · por noche</p>
              <p className="mt-0.5 text-piedra-400">15 de diciembre al 1 de enero, y julio · mínimo {TEMPORADA_MEDIA.minimoNoches} noches</p>
              <p className="mt-1">
                Para 4: {pesos(TEMPORADA_MEDIA.precioNoche.p4)} · Para 6: {pesos(TEMPORADA_MEDIA.precioNoche.p6)}
              </p>
            </div>
            <div className="p-4">
              <p className="font-bold text-agua-800">Baja · por noche</p>
              <p className="mt-0.5 text-piedra-400">El resto del año · mínimo {TEMPORADA_BAJA.minimoNoches} noches</p>
              <p className="mt-1">
                Para 4: {pesos(TEMPORADA_BAJA.precioNoche.p4)} · Para 6: {pesos(TEMPORADA_BAJA.precioNoche.p6)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-piedra-400">
            Ingreso desde las {NEGOCIO.ingreso} y salida hasta las {NEGOCIO.salida}.
          </p>
        </section>

        <section className="tarjeta p-4 text-sm">
          <h2 className="text-lg font-semibold">¿Tu semana está ocupada?</h2>
          <p className="mt-1">Anotate en la lista de espera: si alguien cancela, ¡te avisamos!</p>
        </section>
      </main>

      <footer className="border-t border-piedra-200 px-5 py-6 text-center text-xs text-piedra-400">
        {NEGOCIO.nombre} · <Link to="/admin" className="underline">Panel de anfitriones</Link>
      </footer>
    </div>
  );
}
