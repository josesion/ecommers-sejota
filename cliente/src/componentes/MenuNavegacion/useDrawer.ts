import { useCallback, useEffect, useRef, useState } from "react";

const ENFOCABLES = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const BREAKPOINT_DESKTOP = "(min-width: 768px)";

/**
 * Estado y comportamiento de un menú lateral modal:
 * - bloquea el scroll del body mientras está abierto
 * - cierra con Escape
 * - atrapa el foco dentro del panel y lo devuelve al botón al cerrar
 * - se cierra solo si la pantalla pasa a tamaño desktop
 */
export function useDrawer() {
  const [abierto, setAbierto] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const disparadorRef = useRef<HTMLButtonElement>(null);

  const cerrar = useCallback(() => setAbierto(false), []);
  const alternar = useCallback(() => setAbierto((a) => !a), []);

  // 1. Bloqueo de scroll del fondo
  useEffect(() => {
    if (!abierto) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, [abierto]);

  // 2. Escape + 3. Focus trap
  useEffect(() => {
    if (!abierto) return;

    const panel = panelRef.current;
    const disparador = disparadorRef.current;
    const enfocables = () =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>(ENFOCABLES)) : [];

    // El panel pasa a visible en este mismo commit; esperamos un frame para poder enfocar.
    const frame = requestAnimationFrame(() => enfocables()[0]?.focus());

    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setAbierto(false);
        return;
      }
      if (e.key !== "Tab") return;

      const items = enfocables();
      if (items.length === 0) return;
      const primero = items[0];
      const ultimo = items[items.length - 1];
      const activo = document.activeElement;
      const fuera = !panel?.contains(activo);

      if (e.shiftKey && (activo === primero || fuera)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && (activo === ultimo || fuera)) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", alPresionar);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", alPresionar);
      disparador?.focus(); // devuelve el foco al botón que abrió el menú
    };
  }, [abierto]);

  // Si se agranda la ventana, el drawer ya no existe: soltar el scroll lock
  useEffect(() => {
    const mq = window.matchMedia(BREAKPOINT_DESKTOP);
    const alCambiar = (e: MediaQueryListEvent) => {
      if (e.matches) setAbierto(false);
    };
    mq.addEventListener("change", alCambiar);
    return () => mq.removeEventListener("change", alCambiar);
  }, []);

  return { abierto, cerrar, alternar, panelRef, disparadorRef };
}