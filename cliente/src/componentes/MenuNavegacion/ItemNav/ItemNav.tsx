import type { MouseEvent, PointerEvent, ReactNode } from "react";
import "./itemnav.css";

export interface NavItem {
  href: string;
  label: string;
  icono?: ReactNode;
}

interface ItemnavProps {
  /** Los datos de un solo enlace */
  item: NavItem;
  /** Marca este enlace como la página actual (aria-current="page"). */
  activo?: boolean;
  /** Función opcional al hacer clic */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** Clase CSS adicional opcional para el <li> */
  className?: string;
}

// La luz sigue al cursor: solo actualiza CSS variables, no re-renderiza.
const moverLuz = (e: PointerEvent<HTMLAnchorElement>) => {
  const caja = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - caja.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - caja.top}px`);
};

export const Itemnav = ({
  item,
  activo = false,
  onClick,
  className,
}: ItemnavProps) => {
  const clases = ["item_nav", className].filter(Boolean).join(" ");

  return (
    <li className={clases}>
      <a
        href={item.href}
        onClick={onClick}
        onPointerMove={moverLuz}
        aria-current={activo ? "page" : undefined}
        data-activo={activo || undefined}
      >
        {item.icono && (
          <span className="item_nav_icono" aria-hidden="true">
            {item.icono}
          </span>
        )}
        <span className="item_nav_texto">{item.label}</span>
      </a>
    </li>
  );
};
