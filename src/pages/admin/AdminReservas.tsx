import { useState } from "react";
import { Selector } from "../../components/ui";
import { useStore } from "../../store";
import { TarjetaReserva } from "./comunes";

type Filtro = "activa" | "cancelada";

export default function AdminReservas() {
  const { reservas } = useStore();
  const [filtro, setFiltro] = useState<Filtro>("activa");
  const [busqueda, setBusqueda] = useState("");
  const q = busqueda.trim().toLowerCase();

  const lista = reservas
    .filter((r) => r.estado === filtro)
    .filter((r) => !q || r.nombre.toLowerCase().includes(q) || r.codigo.toLowerCase().includes(q) || r.celular.includes(q))
    .sort((a, b) => a.desde.localeCompare(b.desde));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reservas</h1>
      <Selector
        etiqueta="Estado de las reservas"
        valor={filtro}
        onCambio={setFiltro}
        opciones={[
          { valor: "activa", texto: `Activas (${reservas.filter((r) => r.estado === "activa").length})` },
          { valor: "cancelada", texto: `Canceladas (${reservas.filter((r) => r.estado === "cancelada").length})` },
        ]}
      />
      <input
        className="campo"
        type="search"
        placeholder="Buscar por nombre, código o celular"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      {lista.length === 0 ? (
        <p className="text-sm text-piedra-400">No hay reservas para mostrar.</p>
      ) : (
        <ul className="space-y-2.5">
          {lista.map((r) => (
            <TarjetaReserva key={r.id} r={r} />
          ))}
        </ul>
      )}
    </div>
  );
}
