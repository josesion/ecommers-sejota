import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext";
import { useNotificaciones } from "../contexto/notificaciones.context";

// Tiempo máximo de inactividad en milisegundos (ejemplo: 15 minutos)
const TIEMPO_LIMITE_INACTIVIDAD = 15 * 60 * 1000;

export function EscuchadorInactividad() {
  const { limpiarSesion, sesion } = useAuth();
  const { error } = useNotificaciones();
  const navigate = useNavigate();

  useEffect(() => {
    // Si no hay sesión activa, no hacemos nada
    if (!sesion) return;

    const actualizarUltimaActividad = () => {
      localStorage.setItem("ultimo_timestamp", Date.now().toString());
    };

    // Actualizamos la actividad cuando el usuario hace cosas en la página
    window.addEventListener("mousemove", actualizarUltimaActividad);
    window.addEventListener("keydown", actualizarUltimaActividad);
    window.addEventListener("click", actualizarUltimaActividad);

    // El evento clave: cuando el usuario vuelve a la pestaña o abre la app en el celu
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const ultimoTimestamp = localStorage.getItem("ultimo_timestamp");

        if (ultimoTimestamp) {
          const tiempoTranscurrido = Date.now() - Number(ultimoTimestamp);

          // Si el usuario estuvo ausente más del tiempo límite:
          if (tiempoTranscurrido > TIEMPO_LIMITE_INACTIVIDAD) {
            limpiarSesion();
            localStorage.removeItem("ultimo_timestamp");
            error("Tu sesión ha expirado por inactividad.");
            navigate("/login", { replace: true });
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Inicializamos la marca de tiempo al montar
    actualizarUltimaActividad();

    return () => {
      window.removeEventListener("mousemove", actualizarUltimaActividad);
      window.removeEventListener("keydown", actualizarUltimaActividad);
      window.removeEventListener("click", actualizarUltimaActividad);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sesion, limpiarSesion, error, navigate]);

  return null;
}
