import { useState, type FormEvent } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CLAVE_PANEL, NEGOCIO } from "../../config";
import { Aviso, Logo } from "../../components/ui";
import { ProveedorCancelacion } from "./comunes";

const CLAVE_SESION = "cabanas-del-rio:panel";

function sesionActiva() {
  try {
    return sessionStorage.getItem(CLAVE_SESION) === "ok";
  } catch {
    return false;
  }
}

export default function Admin() {
  const [dentro, setDentro] = useState(sesionActiva);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  if (!dentro) return <Ingreso onIngresar={() => setDentro(true)} />;

  const salir = () => {
    try {
      sessionStorage.removeItem(CLAVE_SESION);
    } catch {
      /* nada */
    }
    setDentro(false);
    navigate("/admin");
  };

  const pestana = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-[44px] flex-1 items-center justify-center rounded-lg px-2 text-sm font-bold transition ${
      isActive ? "bg-white text-agua-800 shadow-sm" : "text-agua-100"
    }`;

  return (
    <ProveedorCancelacion>
      <div className="mx-auto min-h-[100dvh] max-w-xl">
        <header className="sticky top-0 z-20 bg-agua-800 px-4 pb-3 pt-3">
          <div className="flex items-center justify-between">
            <Logo claro />
            <button onClick={salir} className="rounded-lg px-3 py-2 text-sm font-semibold text-agua-100 active:bg-agua-500">
              Salir
            </button>
          </div>
          <nav className="mt-3 flex gap-1 rounded-xl bg-agua-500/40 p-1" aria-label="Secciones del panel">
            <NavLink to="/admin" end className={({ isActive }) => pestana({ isActive: isActive || pathname.startsWith("/admin/semana") })}>Semanas</NavLink>
            <NavLink to="/admin/lista" className={pestana}>Lista</NavLink>
            <NavLink to="/admin/reservas" className={pestana}>Reservas</NavLink>
            <NavLink to="/admin/datos" className={pestana}>Datos</NavLink>
          </nav>
        </header>
        <main className="px-4 pb-10 pt-4">
          <Outlet />
        </main>
      </div>
    </ProveedorCancelacion>
  );
}

function Ingreso({ onIngresar }: { onIngresar: () => void }) {
  const [clave, setClave] = useState("");
  const [error, setError] = useState(false);

  function entrar(e: FormEvent) {
    e.preventDefault();
    if (clave.trim() === CLAVE_PANEL) {
      try {
        sessionStorage.setItem(CLAVE_SESION, "ok");
      } catch {
        /* nada */
      }
      onIngresar();
    } else setError(true);
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center px-5 py-8">
      <Logo />
      <h1 className="mt-8 text-2xl font-semibold">Panel de anfitriones</h1>
      <p className="mt-1 text-sm text-piedra-400">Semanas, reservas y lista de espera de {NEGOCIO.nombre}.</p>
      <form onSubmit={entrar} className="mt-6 space-y-4">
        <label className="block">
          <span className="etiqueta">Clave del panel</span>
          <input
            type="password"
            className="campo"
            autoComplete="current-password"
            value={clave}
            onChange={(e) => {
              setClave(e.target.value);
              setError(false);
            }}
          />
        </label>
        {error ? <Aviso tipo="atencion">Esa clave no es correcta. Probá de nuevo.</Aviso> : null}
        <button type="submit" className="btn-principal">Entrar al panel</button>
      </form>
      <p className="mt-6 text-xs text-piedra-400">Demo: la clave de ejemplo está en el README.</p>
    </div>
  );
}
