import { useId } from "react";
import type { ChangeEvent, PointerEvent } from "react";
import "./selectorOBT.css";

interface SelectorBase<T> {
  categorias: T[];
  // Le decimos qué llaves del objeto usar
  itemKey: keyof T;
  itemLabel: keyof T;
  onChangeSelector: (e: ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  /**
   * Valor seleccionado (spec 039).
   *
   * **Es obligatoria en la práctica**: el select es controlado (`value={value ?? ""}`),
   * así que si se omite, React restaura el placeholder después de cada `change` y la
   * opción elegida NUNCA queda visible (aunque el `onChange` haya guardado el dato).
   * Pasar siempre el valor real del estado (`null` → `""`).
   */
  value?: string | number;
  labelDefault?: string;
  /** Solo lectura: pinta el select grisado y fuera de tab (spec 008) */
  disabled?: boolean;
  required?: boolean;
  /** Mensaje de error para anunciar con aria-describedby */
  error?: string | null;
}

/**
 * El select necesita nombre accesible: o lleva `label` visible, o
 * `ariaLabel` es obligatorio.
 */
type CompoIEProps<T> = SelectorBase<T> &
  (
    | { label: string; ariaLabel?: string }
    | { label?: undefined; ariaLabel: string }
  );

// La luz sigue al cursor: solo actualiza CSS variables, no re-renderiza.
const moverLuz = (e: PointerEvent<HTMLDivElement>) => {
  const caja = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - caja.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - caja.top}px`);
};

// Usamos <T,> para que el compilador sepa que es un Generic
export const SelectorOpt = <T,>({
  categorias,
  itemKey,
  itemLabel,
  onChangeSelector,
  name,
  value,
  labelDefault = "Seleccionar",
  disabled,
  required,
  label,
  ariaLabel,
  error,
}: CompoIEProps<T>) => {
  const idUnico = useId();
  const selectId = name || `selector-${idUnico}`;
  const idError = `${selectId}_error`;
  const tieneError = Boolean(error);
  const sinSeleccion = (value ?? "") === "";

  return (
    <div
      className="grupo_input_caja"
      data-error={tieneError || undefined}
      data-disabled={disabled || undefined}
    >
      {label && (
        <label className="input_caja_label" htmlFor={selectId}>
          {label}
          {required && (
            <span className="input_caja_requerido" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div
        className="input_caja_wrapper"
        data-vacio={sinSeleccion || undefined}
        data-disabled={disabled || undefined}
        onPointerMove={moverLuz}
      >
        <select
          className="input_caja"
          id={selectId}
          name={name}
          value={value ?? ""}
          onChange={onChangeSelector}
          disabled={disabled}
          required={required}
          // Con label visible no se pasa aria-label: pisaría al label.
          aria-label={label ? undefined : ariaLabel}
          aria-invalid={tieneError ? true : undefined}
          aria-describedby={tieneError ? idError : undefined}
        >
          <option value="">{labelDefault}</option>
          {categorias.map((item, index) => (
            <option
              key={String(item[itemKey]) || index}
              value={String(item[itemKey])}
            >
              {String(item[itemLabel])}
            </option>
          ))}
        </select>

        <svg
          className="input_caja_flecha"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {error && (
        <p className="mensaje_error" id={idError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
