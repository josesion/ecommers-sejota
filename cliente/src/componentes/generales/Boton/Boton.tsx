import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Plus, X, Pencil } from "lucide-react";

import "./Boton.css";

export type VarianteBoton = "primario" | "secundario" | "elegante";
export type TipoBoton = "agregar" | "cancelar" | "modificar";

export interface BotonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /** Texto visible. Es también el nombre accesible del botón. */
  label: string;
  /** Estilo visual. Por defecto `primario`. */
  variante?: VarianteBoton;
  /** Acción que representa; define el ícono por defecto. Sin `tipo` no hay ícono. */
  tipo?: TipoBoton;
  /** Ícono propio. Con `null` se oculta el ícono del `tipo`. */
  icono?: ReactNode;
}

/** Ícono por defecto de cada tipo de acción. */
const ICONOS: Record<TipoBoton, ReactNode> = {
  agregar: <Plus size={16} strokeWidth={1.5} />,
  cancelar: <X size={16} strokeWidth={1.5} />,
  modificar: <Pencil size={16} strokeWidth={1.5} />,
};

/**
 * Botón configurable, accesible y con animación controlada.
 *
 * El texto visible es el nombre accesible: no se agrega `aria-label`. El ícono
 * es decorativo (`aria-hidden`). Acepta cualquier atributo nativo de `<button>`
 * (`disabled`, `type`, `onClick`, `className`, etc.).
 *
 * @param label - Texto visible del botón.
 * @param variante - Estilo visual (`primario`, `secundario` o `elegante`).
 * @param tipo - Acción que representa; define el ícono por defecto.
 * @param icono - Ícono propio; `null` para no mostrar ninguno.
 * @param type - Tipo nativo del botón. Por defecto `button`.
 * @param className - Clases extra, se suman a las del componente.
 */
export const Boton = ({
  label,
  variante = "primario",
  tipo,
  icono,
  type = "button",
  className,
  ...resto
}: BotonProps) => {
  const iconoFinal = icono !== undefined ? icono : tipo ? ICONOS[tipo] : null;

  const clases = [
    "boton",
    `boton--${variante}`,
    tipo && `boton--tipo-${tipo}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={clases} {...resto}>
      {iconoFinal && (
        <span className="boton_icono" aria-hidden="true">
          {iconoFinal}
        </span>
      )}
      <span>{label}</span>
    </button>
  );
};

/** Export por defecto temporal, para migrar los imports de a poco. */
export default Boton;
