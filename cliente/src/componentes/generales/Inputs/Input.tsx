import { forwardRef, useId } from "react";
import type { InputHTMLAttributes } from "react";

import "./Input.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Texto visible. Es también el nombre accesible del campo. */
  label: string;
  /** Texto de ayuda bajo el campo. Se oculta si hay `error`. */
  ayuda?: string;
  /** Mensaje de error. Si existe, marca el campo como inválido. */
  error?: string;
}

/**
 * Campo de texto con label obligatorio, ayuda y error accesibles.
 *
 * El `<label>` visible es el nombre accesible: no se usa `aria-label`. El `id`
 * se genera con `useId` para evitar colisiones. Acepta cualquier atributo
 * nativo de `<input>` (`value`, `onChange`, `name`, `required`, `disabled`...)
 * y un `ref`.
 *
 * @param label - Texto visible del campo.
 * @param ayuda - Texto de ayuda bajo el campo.
 * @param error - Mensaje de error; marca el campo como inválido.
 * @param type - Tipo nativo del input. Por defecto `text`.
 * @param className - Clases extra para el contenedor.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      ayuda,
      error,
      id,
      type = "text",
      required,
      className,
      "aria-describedby": describedByExterno,
      ...resto
    },
    ref,
  ) => {
    const idAuto = useId();
    const idInput = id ?? idAuto;
    const idAyuda = `${idInput}-ayuda`;
    const idError = `${idInput}-error`;

    const describedBy =
      [error ? idError : ayuda ? idAyuda : undefined, describedByExterno]
        .filter(Boolean)
        .join(" ") || undefined;

    const clases = [
      "input_contenedor",
      error && "input_contenedor--error",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={clases}>
        <label htmlFor={idInput} className="input_label">
          {label}
          {required && (
            <span className="input_requerido" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>

        <input
          ref={ref}
          id={idInput}
          type={type}
          required={required}
          className="input_campo"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...resto}
        />

        {error ? (
          <p
            id={idError}
            className="input_mensaje input_mensaje--error"
            role="alert"
          >
            {error}
          </p>
        ) : ayuda ? (
          <p id={idAyuda} className="input_mensaje">
            {ayuda}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

/** Export por defecto temporal, para migrar los imports de a poco. */
export default Input;
