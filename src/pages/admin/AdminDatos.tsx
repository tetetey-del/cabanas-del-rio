import { useState } from "react";
import { Aviso, Modal } from "../../components/ui";
import { useStore } from "../../store";

export default function AdminDatos() {
  const { reservas, anotaciones, reiniciar } = useStore();
  const [confirmar, setConfirmar] = useState(false);
  const [listo, setListo] = useState(false);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">Datos</h1>
      <div className="tarjeta space-y-1 p-4 text-sm">
        <p><strong>{reservas.filter((r) => r.estado === "activa").length}</strong> reservas activas</p>
        <p><strong>{anotaciones.length}</strong> anotaciones en listas de espera</p>
      </div>
      <Aviso>
        Esta demo guarda todo en este navegador. Otra persona u otro teléfono ve sus propios datos. No se envían
        mensajes ni se cobran pagos desde la app.
      </Aviso>
      {listo ? <Aviso tipo="ok">Listo: volvieron los datos de ejemplo.</Aviso> : null}
      <button className="btn-secundario w-full" onClick={() => setConfirmar(true)}>
        Reiniciar datos de ejemplo
      </button>

      <Modal abierto={confirmar} onCerrar={() => setConfirmar(false)} titulo="¿Reiniciar los datos?">
        <p className="text-sm">Se borran las reservas y anotaciones de este navegador y vuelven las de ejemplo.</p>
        <div className="mt-4 flex gap-2">
          <button className="btn-secundario flex-1" onClick={() => setConfirmar(false)}>No, volver</button>
          <button
            className="btn-principal flex-1"
            onClick={() => {
              reiniciar();
              setConfirmar(false);
              setListo(true);
            }}
          >
            Sí, reiniciar
          </button>
        </div>
      </Modal>
    </div>
  );
}
