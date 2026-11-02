/**
 * Raíz de rutas del cliente.
 *
 * Envuelve las rutas en `AuthProveedor` (dueño único de la sesión).
 * Rutas absolutas `/login` y `/principal`; sin ruta `/` (B2).
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProveedor } from "./contexto/AuthContext";
import { NotificacionesProvider } from "./contexto/NotificacionesProvider";
import { EscuchadorSesionExpirada } from "./utils/EscuchadorSesionExpirada";
import { EscuchadorInactividad } from "./utils/EscuchadorInactividad";
import { RutaAdmin, RutaCliente } from "./RutasProtegidas";

import Principal from "./paginas/privadas/Principal";
import LoginPage from "./paginas/publicas/Login/LoginPage";

export default function App() {
  return (
    <NotificacionesProvider>
      <BrowserRouter>
        <AuthProveedor>
          {/* ponemos el escuchador global */}
          <EscuchadorSesionExpirada />
          <EscuchadorInactividad />

          <Routes>
            {/* 1. Ruta pública de acceso */}
            <Route path="/login" element={<LoginPage />} />

            {/* 2. Zona protegida de CLIENTES (requiere estar logueado) */}
            <Route element={<RutaCliente />}>
              <Route path="/principal" element={<Principal />} />
            </Route>

            {/* 3. Zona protegida de ADMINISTRACIÓN (requiere logueado Y rol "admin") */}
            <Route element={<RutaAdmin />}>
              {/* Ejemplo de rutas hijas para el panel admin: */}
              {/* <Route path="/admin" element={<DashboardAdmin />} /> */}
            </Route>

            {/* Redirección por defecto si la URL no coincide */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProveedor>
      </BrowserRouter>
    </NotificacionesProvider>
  );
}
