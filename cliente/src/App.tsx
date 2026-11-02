/**
 * Raíz de rutas del cliente.
 *
 * Envuelve las rutas en `AuthProveedor` (dueño único de la sesión).
 * Rutas absolutas `/login` y `/principal`; sin ruta `/` (B2).
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProveedor } from "./contexto/AuthContext";
import { NotificacionesProvider } from "./contexto/NotificacionesProvider";

import LoginPage from "./paginas/publicas/Login/LoginPage";
import Principal from "./paginas/privadas/Principal";

export default function App() {
  return (
    <NotificacionesProvider>
      <BrowserRouter>
        <AuthProveedor>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/principal" element={<Principal />} />
          </Routes>
        </AuthProveedor>
      </BrowserRouter>
    </NotificacionesProvider>
  );
}
