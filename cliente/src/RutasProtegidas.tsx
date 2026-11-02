import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./contexto/AuthContext";

/**
 * Guard de navegación exclusivo para la zona de Administración.
 * Verifica la existencia de sesión y que el rol del usuario sea "admin".
 */
export function RutaAdmin() {
  const { user, sesion } = useAuth();

  // 1. Si no hay sesión iniciada, redirige a la página pública de login
  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  // 2. Si hay sesión pero el rol no es "admin", lo manda a la vista principal de clientes
  if (user?.rol !== "admin") {
    return <Navigate to="/principal" replace />;
  }

  // 3. Si es admin, renderiza la ruta hija dentro del Outlet
  return <Outlet />;
}

/** Protege cualquier página que requiera sesión activa. */
export function RutaCliente() {
  const { sesion } = useAuth();

  if (!sesion) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
