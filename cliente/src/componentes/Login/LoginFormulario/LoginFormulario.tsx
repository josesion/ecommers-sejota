/**
 * Formulario presentacional del inicio de sesión.
 *
 * Puro: solo renderiza props y reenvía eventos. Reutiliza `Input` y `Boton`
 * generales sin modificarlos. Sin fetch, sin reducer, sin contexto y sin
 * navegación. El banner de error va antes del `form` con `role="alert"`.
 */

import type { ChangeEvent, FormEvent } from "react";
import { Inputs } from "../../personales/Inputs/Inputs";
import { Boton } from "../../personales/Boton/Boton";
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
  /** Mensaje del banner global, `null` si no hay error. */
  error: string | null;
  /** Errores específicos por campo devueltos por Zod (ej. { password: "..." }) */
  erroresCampos?: Partial<Record<keyof LoginForm, string>>; // 👈 Agregado aquí
  /** `id` del `h1` de la página para `aria-labelledby`. */
  idTitulo: string;
  /** `id` del subtítulo para `aria-describedby`; solo si existe. */
  idSubtitulo?: string;
  /** Cambio de campo, reenviado a cada `Input`. */
  onChange: (evento: ChangeEvent<HTMLInputElement>) => void;
  /** Envío del `form`. */
  onSubmit: (evento: FormEvent<HTMLFormElement>) => void;
}

/** `id` estable del banner de error global. */
export const ID_ERROR_LOGIN = "login-form-error";

/**
 * Pinta el banner (si hay error) y el `form` con los dos `Input` y el
 * `Boton` de envío.
 *
 * @param props Valores, metadatos, estado e identificadores de la página.
 * @returns Banner de error y formulario accesible.
 */
export function LoginFormulario({
  valores,
  inputs,
  carga,
  erroresCampos = {},
  idTitulo,
  idSubtitulo,
  onChange,
  onSubmit,
}: LoginFormularioProps) {
  return (
    <>
      <form
        className="login-form"
        aria-labelledby={idTitulo}
        {...(idSubtitulo ? { "aria-describedby": idSubtitulo } : {})}
        onSubmit={onSubmit}
      >
        {inputs.map((campo) => {
          // Verificamos si este campo específico tiene un error de Zod
          const errorDelCampo = erroresCampos[campo.name as keyof LoginForm];

          return (
            <Inputs
              key={campo.name}
              label={campo.label}
              name={campo.name}
              type={campo.type}
              placeholder={campo.placeholder}
              autoComplete={campo.autoComplete}
              required={campo.required}
              aria-required={campo.required}
              aria-invalid={errorDelCampo ? true : undefined}
              value={valores[campo.name as keyof LoginForm]}
              onChange={onChange}
              disabled={carga}
              error={errorDelCampo}
            />
          );
        })}

        <div className="login-form-acciones">
          <Boton
            texto={carga ? "Iniciando sesión…" : "Iniciar sesión"}
            clase="aceptar"
            logo="Go"
            type="submit"
            disable={carga}
            onClick={() => {}}
          />
        </div>
      </form>
    </>
  );
}
