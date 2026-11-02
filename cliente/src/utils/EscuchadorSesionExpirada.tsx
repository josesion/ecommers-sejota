import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext";
import { useNotificaciones } from "../contexto/notificaciones.context";

export function EscuchadorSesionExpirada() {
  const { limpiarSesion } = useAuth();
  const { error } = useNotificaciones(); // Tu función de toast
  const navigate = useNavigate();

  useEffect(() => {
    const handleSesionExpirada = () => {
      // 1. Limpiamos el usuario del contexto global
      limpiarSesion();

      // 2. Mostramos el toast flotante de error
      error("Tu sesión ha expirado, por favor volvé a iniciar sesión.");

      // 3. Redirigimos al login sin recargar la página entera (gracias a React Router)
      navigate("/login", { replace: true });
    };

    // Escuchamos el evento global
    window.addEventListener(
      "sesion-expirada",
      handleSesionExpirada as EventListener,
    );

    // Limpieza del listener al desmontar
    return () => {
      window.removeEventListener(
        "sesion-expirada",
        handleSesionExpirada as EventListener,
      );
    };
  }, [limpiarSesion, error, navigate]);

  return null; // Este componente no renderiza nada visual, solo "escucha"
}
