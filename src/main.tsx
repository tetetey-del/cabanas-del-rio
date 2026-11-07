import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import "./index.css";
import { StoreProvider } from "./store";
import { Pagina } from "./components/ui";
import Inicio from "./pages/Inicio";
import Reservar from "./pages/Reservar";
import DatosReserva from "./pages/DatosReserva";
import ReservaConfirmada from "./pages/ReservaConfirmada";
import Anotarse from "./pages/Anotarse";
import Anotada from "./pages/Anotada";
import Admin from "./pages/admin/Admin";
import AdminSemanas from "./pages/admin/AdminSemanas";
import AdminSemana from "./pages/admin/AdminSemana";
import AdminLista from "./pages/admin/AdminLista";
import AdminReservas from "./pages/admin/AdminReservas";
import AdminDatos from "./pages/admin/AdminDatos";

function NoEncontrada() {
  return (
    <Pagina titulo="Página no encontrada" volver="/">
      <p>Esta página no existe.</p>
      <Link to="/" className="btn-principal mt-4">Volver al inicio</Link>
    </Pagina>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/reservar" element={<Reservar />} />
          <Route path="/reservar/datos" element={<DatosReserva />} />
          <Route path="/reserva/:codigo" element={<ReservaConfirmada />} />
          <Route path="/lista" element={<Anotarse />} />
          <Route path="/lista/:id" element={<Anotada />} />
          <Route path="/admin" element={<Admin />}>
            <Route index element={<AdminSemanas />} />
            <Route path="semana/:desde" element={<AdminSemana />} />
            <Route path="lista" element={<AdminLista />} />
            <Route path="reservas" element={<AdminReservas />} />
            <Route path="datos" element={<AdminDatos />} />
          </Route>
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </StrictMode>,
);
