import type { IconType } from "react-icons";
import { FaHome, FaFemale, FaMale, FaShoePrints, FaGem } from "react-icons/fa";

export interface RutaNav {
  href: string;
  label: string;
  /** Se muestra solo en el drawer móvil. */
  icono?: IconType;
}

/**
 * Única fuente de verdad de la navegación.
 * Navbar (desktop y móvil) y Footer la consumen: para sumar una
 * sección (p. ej. "Trajes de Hombre") alcanza con agregar un objeto.
 */
export const RUTAS_PRINCIPALES: RutaNav[] = [
  { href: "/", label: "Inicio", icono: FaHome },
  { href: "/mujer", label: "Mujer", icono: FaFemale },
  { href: "/hombre", label: "Hombre", icono: FaMale },
  { href: "/calzado", label: "Calzado", icono: FaShoePrints },
  { href: "/accesorios", label: "Accesorios", icono: FaGem },
];