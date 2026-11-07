import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { NEGOCIO } from "../config";

export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label={`${NEGOCIO.nombre}, inicio`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="8" fill={claro ? "#F5F3EE" : "#1F4E4A"} />
        <path d="M8 15l8-6 8 6v9H8z" fill={claro ? "#1F4E4A" : "#F5F3EE"} />
        <path d="M6 25c3-2 5 2 8 0s5 2 8 0 4 1 4 1" stroke="#D9B77E" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      <span className={`font-titulo text-lg font-semibold ${claro ? "text-piedra-50" : "text-agua-800"}`}>
        {NEGOCIO.nombre}
      </span>
    </Link>
  );
}

/** Página pública con encabezado simple y botón para volver. */
export function Pagina({
  titulo,
  volver,
  children,
  barra,
}: {
  titulo?: string;
  volver?: string;
  children: ReactNode;
  barra?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-xl flex-col">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-piedra-200 bg-piedra-50/95 px-4 backdrop-blur">
        {volver ? (
          <Link to={volver} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-agua-800 active:bg-agua-50" aria-label="Volver">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </Link>
        ) : null}
        {titulo ? <h1 className="truncate text-lg font-semibold">{titulo}</h1> : <Logo />}
      </header>
      <main className="flex-1 px-4 pb-6 pt-4">{children}</main>
      {barra ? <BarraInferior>{barra}</BarraInferior> : null}
    </div>
  );
}

/** Barra fija abajo: el botón principal siempre se ve sin hacer scroll. */
export function BarraInferior({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-piedra-200 bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
      {children}
    </div>
  );
}

export function Aviso({ tipo = "info", titulo, children }: { tipo?: "info" | "atencion" | "ok"; titulo?: string; children?: ReactNode }) {
  const estilos = {
    info: "border-agua-100 bg-agua-50 text-agua-800",
    atencion: "border-arena-400 bg-arena-100 text-tinta",
    ok: "border-agua-500/30 bg-agua-100 text-agua-800",
  }[tipo];
  return (
    <div role={tipo === "atencion" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${estilos}`}>
      {titulo ? <p className="font-bold">{titulo}</p> : null}
      {children ? <div className={titulo ? "mt-1" : ""}>{children}</div> : null}
    </div>
  );
}

export function Selector<T extends string>({
  opciones,
  valor,
  onCambio,
  etiqueta,
}: {
  opciones: { valor: T; texto: string }[];
  valor: T;
  onCambio: (v: T) => void;
  etiqueta: string;
}) {
  return (
    <div role="tablist" aria-label={etiqueta} className="flex rounded-xl bg-piedra-200/70 p-1">
      {opciones.map((o) => (
        <button
          key={o.valor}
          role="tab"
          aria-selected={valor === o.valor}
          onClick={() => onCambio(o.valor)}
          className={`min-h-[40px] flex-1 rounded-lg px-2 text-sm font-bold transition ${
            valor === o.valor ? "bg-white text-agua-800 shadow-sm" : "text-piedra-400"
          }`}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

export function Contador({
  valor,
  min,
  max,
  onCambio,
  id,
}: {
  valor: number;
  min: number;
  max: number;
  onCambio: (n: number) => void;
  id?: string;
}) {
  return (
    <div className="flex items-center gap-3" id={id}>
      <button type="button" className="btn-secundario h-11 w-11 px-0 text-xl" onClick={() => onCambio(Math.max(min, valor - 1))} disabled={valor <= min} aria-label="Menos personas">
        −
      </button>
      <span className="w-10 text-center text-xl font-bold" aria-live="polite">{valor}</span>
      <button type="button" className="btn-secundario h-11 w-11 px-0 text-xl" onClick={() => onCambio(Math.min(max, valor + 1))} disabled={valor >= max} aria-label="Más personas">
        +
      </button>
      <span className="text-sm text-piedra-400">hasta {max}</span>
    </div>
  );
}

export function Modal({ abierto, onCerrar, titulo, children }: { abierto: boolean; onCerrar: () => void; titulo: string; children: ReactNode }) {
  useEffect(() => {
    if (!abierto) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierto, onCerrar]);
  if (!abierto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-tinta/40 sm:items-center" onClick={onCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 pb-[max(20px,env(safe-area-inset-bottom))] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-xl font-semibold">{titulo}</h2>
        {children}
      </div>
    </div>
  );
}

export function Chip({ children, tono = "agua" }: { children: ReactNode; tono?: "agua" | "piedra" | "arena" }) {
  const t = {
    agua: "bg-agua-100 text-agua-800",
    piedra: "bg-piedra-200 text-tinta",
    arena: "bg-arena-100 text-tinta",
  }[tono];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${t}`}>{children}</span>;
}

export function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-piedra-400">{etiqueta}</span>
      <span className="text-right font-semibold text-tinta">{children}</span>
    </div>
  );
}
