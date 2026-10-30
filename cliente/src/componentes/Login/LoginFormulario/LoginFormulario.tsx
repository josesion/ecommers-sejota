/**
 * Formulario presentacional del inicio de sesión.
 *
 * Puro: solo renderiza props y reenvía eventos. Reutiliza `Input` y `Boton`
 * generales sin modificarlos. Sin fetch, sin reducer, sin contexto y sin
 * navegación. El banner de error va antes del `form` con `role="alert"`.
 */

import type { ChangeEvent, FormEvent } from "react";
import { Input } from "../../generales/Inputs/Input";
import { Boton } from "../../generales/Boton/Boton";
import type { LoginForm, LoginInput } from "../../../tipado/login";
import "./LoginFormulario.css";

/** Props del formulario de inicio de sesión (todo entra por aquí). */
export interface LoginFormularioProps {
  /** Valores actuales de los campos. */
  valores: LoginForm;
  /** Metadatos de los campos (llegan del hook). */
  inputs: LoginInput[];
  /** Petición en curso: deshabilita campos y botón. */
  carga: boolean;
  /** Mensaje del banner, `null` si no hay error. */
  error: string | null;
  /** `id` del `h1` de la página para `aria-labelledby`. */
  idTitulo: string;
  /** `id` del subtítulo para `aria-describedby`; solo si existe. */
  idSubtitulo?: string;
  /** Cambio de campo, reenviado a cada `Input`. */
  onChange: (evento: ChangeEvent<HTMLInputElement>) => void;
  /** Envío del `form`. */
  onSubmit: (evento: FormEvent<HTMLFormElement>) => void;
}

/** `id` estable del banner de error. */
export const ID_ERROR_LOGIN = "login-form-error";

/**
 * Pinta el banner (si hay error) y el `form` con los dos `Input` y el
 * `Boton` de envío.
 *
 * @param props - Valores, metadatos, estado e identificadores de la página.
 * @returns Banner de error y formulario accesible.
 */
export function LoginFormulario({
  valores,
  inputs,
  carga,
  error,
  idTitulo,
  idSubtitulo,
  onChange,
  onSubmit,
}: LoginFormularioProps) {
  return (
    <>
      {error && (
        <p id={ID_ERROR_LOGIN} className="login-form-error" role="alert">
          {error}
        </p>
      )}

      <form
        className="login-form"
        aria-labelledby={idTitulo}
        {...(idSubtitulo ? { "aria-describedby": idSubtitulo } : {})}
        onSubmit={onSubmit}
      >
        {inputs.map((campo) => (
          <Input
            key={campo.name}
            label={campo.label}
            name={campo.name}
            type={campo.type}
            placeholder={campo.placeholder}
            autoComplete={campo.autoComplete}
            required={campo.required}
            aria-required={campo.required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? ID_ERROR_LOGIN : undefined}
            value={valores[campo.name]}
            onChange={onChange}
            disabled={carga}
          />
        ))}

        <div className="login-form-acciones">
          <Boton
            label={carga ? "Iniciando sesión…" : "Iniciar sesión"}
            variante="primario"
            icono={null}
            type="submit"
            disabled={carga}
          />
        </div>
      </form>
    </>
  );
}
