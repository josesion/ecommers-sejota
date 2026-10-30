import type { MouseEvent, PointerEvent } from "react";
import { MdCancel } from "react-icons/md";
import { FaList, FaEdit } from "react-icons/fa";
import { AiFillCheckCircle, AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiAddToQueue } from "react-icons/bi";
import { RiDeleteBin6Line } from "react-icons/ri";
import { SlActionRedo, SlActionUndo } from "react-icons/sl";
import "./boton.css";

type Logo =
  | "Cancel"
  | "Check"
  | "List"
  | "Add"
  | "Delete"
  | "Go"
  | "Back"
  | "Edit";

interface BotonBase {
  logo?: Logo | null;
  size?: number;
  clase?:
    | "aceptar"
    | "cancelar"
    | "agregar"
    | "eliminar"
    | "listar"
    | "flechas"
    | "editar";
  /** Foco automático al renderizar (`autoFocus`). */
  focus?: boolean;
  /** Bloquea el botón (atributo `disabled`: sale del orden de tab). */
  disable?: boolean;
  /**
   * Muestra spinner y barra de progreso. El botón conserva el foco
   * (`aria-disabled`) pero ignora clicks y envíos.
   */
  cargando?: boolean;
  textoCargando?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Un botón necesita nombre accesible: o lleva `texto`, o (si es solo icono)
 * `ariaLabel` es obligatorio.
 */
type BotonProps = BotonBase &
  (
    | { texto: string; ariaLabel?: string }
    | { texto?: undefined; ariaLabel: string }
  );

const logoMap = {
  Cancel: MdCancel,
  Check: AiFillCheckCircle,
  List: FaList,
  Add: BiAddToQueue,
  Delete: RiDeleteBin6Line,
  Go: SlActionRedo,
  Back: SlActionUndo,
  Edit: FaEdit,
};

// La luz sigue al cursor: solo actualiza CSS variables, no re-renderiza.
const moverLuz = (e: PointerEvent<HTMLButtonElement>) => {
  const caja = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - caja.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - caja.top}px`);
};

export const Boton = ({
  texto,
  logo,
  size = 20,
  clase,
  focus,
  disable = false,
  cargando = false,
  textoCargando = "Procesando...",
  ariaLabel,
  type = "button",
  onClick,
}: BotonProps) => {
  const IconComponent = logo ? logoMap[logo] : null;
  const textoVisible = cargando ? textoCargando : texto;

  const clases = [
    "boton_personalizado",
    clase,
    disable && "boton_deshabilitado",
    cargando && "boton_cargando",
  ]
    .filter(Boolean)
    .join(" ");

  // Con aria-disabled el botón sigue recibiendo eventos: hay que frenarlos a mano
  // (también cancela el envío del formulario si es type="submit").
  const manejarClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (cargando) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      className={clases}
      data-logo={logo ?? undefined}
      onClick={manejarClick}
      onPointerMove={moverLuz}
      autoFocus={focus}
      disabled={disable}
      type={type}
      aria-label={ariaLabel}
      aria-busy={cargando || undefined}
      aria-disabled={cargando || undefined}
    >
      {cargando ? (
        <AiOutlineLoading3Quarters
          className="spinner_girando"
          size={size}
          aria-hidden="true"
        />
      ) : (
        IconComponent && (
          <span className="boton_icono">
            <IconComponent size={size} aria-hidden="true" />
          </span>
        )
      )}

      {textoVisible && <span className="boton_texto">{textoVisible}</span>}
    </button>
  );
};
