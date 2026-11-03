import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext";
import { useNotificaciones } from "../contexto/notificaciones.context";

const TIEMPO_LIMITE_INACTIVIDAD = 15 * 60 * 1000; // ojo: tenías 1 min
const INTERVALO_REVISION = 10 * 1000;
const CLAVE_TIMESTAMP = "ultimo_timestamp";

export function EscuchadorInactividad() {
  const { limpiarSesion, sesion } = useAuth();
  const { info } = useNotificaciones();
  const navigate = useNavigate();

  // Siempre apunta a las últimas versiones, sin re-disparar el efecto
  const accionesRef = useRef({ limpiarSesion, info, navigate });
  accionesRef.current = { limpiarSesion, info, navigate };

  useEffect(() => {
    if (!sesion) return;

    const haExpirado = () => {
      const ultimo = localStorage.getItem(CLAVE_TIMESTAMP);
      return (
        ultimo !== null &&
        Date.now() - Number(ultimo) > TIEMPO_LIMITE_INACTIVIDAD
      );
    };

    const cerrarPorInactividad = () => {
      const { limpiarSesion, info, navigate } = accionesRef.current;
      localStorage.removeItem(CLAVE_TIMESTAMP);
      limpiarSesion();
      info("Tu sesión ha expirado por inactividad.");
      navigate("/login", { replace: true });
    };

    // Interacción / regreso a la app: si expiró, cierra; si no, renueva
    const verificarYActualizar = () => {
      if (haExpirado()) {
        cerrarPorInactividad();
        return;
      }
      localStorage.setItem(CLAVE_TIMESTAMP, Date.now().toString());
    };

    // Solo revisa, NO renueva (no es actividad del usuario)
    const revisarSolo = () => {
      if (haExpirado()) cerrarPorInactividad();
    };

    const manejarVisibilidad = () => {
      if (document.visibilityState === "visible") verificarYActualizar();
    };

    // Al montar: si ya había un timestamp viejo, respetarlo en vez de pisarlo
    verificarYActualizar();

    const eventosWindow = [
      "click",
      "keydown",
      "touchstart",
      "focus",
      "pageshow",
    ] as const;
    eventosWindow.forEach((e) =>
      window.addEventListener(e, verificarYActualizar),
    );
    document.addEventListener("visibilitychange", manejarVisibilidad);

    // Red de seguridad: detecta expiración aunque no llegue ningún evento
    const intervalo = setInterval(revisarSolo, INTERVALO_REVISION);

    return () => {
      eventosWindow.forEach((e) =>
        window.removeEventListener(e, verificarYActualizar),
      );
      document.removeEventListener("visibilitychange", manejarVisibilidad);
      clearInterval(intervalo);
    };
  }, [sesion]);

  return null;
}
