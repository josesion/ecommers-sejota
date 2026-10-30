import { forwardRef, useId, useState } from "react";
import type { ChangeEvent, PointerEvent } from "react";
import "./inputs.css";

type TipoInput =
  | "text"
  | "password"
  | "email"
  | "number"
  | "date"
  | "checkbox"
  | "radio"
  | "file"
  | "tel";

interface InputsProps {
  label?: string;
  type?: TipoInput;
  placeholder?: string;
  value?: string | number;
  /** Solo checkbox y radio (modo controlado). */
  checked?: boolean;
  name?: string;
  /**
   * Id del input. Pasalo en radios de un mismo grupo: comparten `name`
   * y cada uno necesita un id distinto para que su label funcione.
   */
  id?: string;
  readonly?: boolean;
  required?: boolean;
  disabled?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  autoComplete?: string;
  /** Solo aplica si type="password". */
  showPasswordToggle?: boolean;
  onPasswordToggle?: (visible: boolean) => void;
  /** Filtro del diálogo de archivos (solo type="file"). El server igual debe validar. */
  accept?: string;
}

// Tipos de campo de texto donde un placeholder por defecto tiene sentido.
const TIPOS_CON_PLACEHOLDER: TipoInput[] = [
  "text",
  "password",
  "email",
  "number",
  "tel",
];

// La luz sigue al cursor: solo actualiza CSS variables, no re-renderiza.
const moverLuz = (e: PointerEvent<HTMLDivElement>) => {
  const caja = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--x", `${e.clientX - caja.left}px`);
  e.currentTarget.style.setProperty("--y", `${e.clientY - caja.top}px`);
};

export const Inputs = forwardRef<HTMLInputElement, InputsProps>(
  (parametros, ref) => {
    const idUnico = useId();

    const inputId =
      parametros.id ||
      parametros.name ||
      (parametros.label &&
        parametros.label.toLowerCase().replace(/\s/g, "-")) ||
      idUnico;

    const idError = `${inputId}_error`;
    const idCampo = `${inputId}_campo`;
    const tieneError = Boolean(parametros.error);

    const inputType = parametros.type || "text";
    const esCasilla = inputType === "checkbox" || inputType === "radio";
    const placeholder =
      parametros.placeholder ||
      (TIPOS_CON_PLACEHOLDER.includes(inputType)
        ? "Ingrese un valor"
        : undefined);
    const esRequerido = Boolean(parametros.required);

    const esPassword =
      inputType === "password" && parametros.showPasswordToggle === true;
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const tipoEfectivo = esPassword && mostrarPassword ? "text" : inputType;

    const togglePassword = () => {
      const nuevoEstado = !mostrarPassword;
      setMostrarPassword(nuevoEstado);
      parametros.onPasswordToggle?.(nuevoEstado);
    };

    return (
      <div
        className={`inputs_contenedor${esCasilla ? " inputs_contenedor--casilla" : ""}`}
        data-error={tieneError || undefined}
        data-disabled={parametros.disabled || undefined}
      >
        <label htmlFor={inputId}>
          {parametros.label}
          {esRequerido && (
            <span className="inputs_requerido" aria-hidden="true">
              *
            </span>
          )}
        </label>

        <div
          className="inputs_wrapper"
          data-tipo={inputType}
          data-readonly={parametros.readonly || undefined}
          data-disabled={parametros.disabled || undefined}
          onPointerMove={moverLuz}
        >
          <input
            ref={ref}
            type={tipoEfectivo}
            placeholder={placeholder}
            id={inputId}
            value={parametros.value}
            checked={parametros.checked}
            name={parametros.name}
            onChange={parametros.onChange}
            className="inputs"
            readOnly={parametros.readonly}
            required={parametros.required}
            disabled={parametros.disabled}
            autoComplete={parametros.autoComplete}
            accept={parametros.accept}
            aria-invalid={tieneError ? true : undefined}
            aria-describedby={tieneError ? idError : undefined}
          />

          {esPassword && (
            <button
              type="button"
              className="inputs_toggle_password"
              onClick={togglePassword}
              aria-label={
                mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              aria-pressed={mostrarPassword}
              aria-controls={inputId}
            >
              {/* key distinto = el span se remonta y se repite la animación "pop" */}
              <span
                key={String(mostrarPassword)}
                className="inputs_toggle_icono"
              >
                {mostrarPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </span>
            </button>
          )}
        </div>

        {/* Reserva el alto para que el formulario no "salte" cuando aparece el error. */}
        <div className="error_espacio" id={idCampo}>
          {parametros.error && (
            <p className="mensaje_error" id={idError} role="alert">
              {parametros.error}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Inputs.displayName = "Inputs";
