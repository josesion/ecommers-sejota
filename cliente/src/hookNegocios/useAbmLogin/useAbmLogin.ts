/**
 * Seteo del módulo de inicio de sesión (C6).
 *
 * Carpeta propia: es lo que importa la página. Solo las secciones de
 * tipado, servicios y datos estáticos, la construcción de `config` y la
 * llamada al motor de `hooks/`. Aquí NO hay `useReducer` ni handlers.
 */

import { useAbmLogin as useAbmLoginLogic } from "../../hooks/useAbmLogin";
import type { ConfigLogin } from "../../hooks/useAbmLogin";
import { postLogin } from "../../fetch/login.fetch";
import { initialLogin } from "../../reducers/loginReducers";
import type { LoginForm, LoginInput } from "../../tipado/login";

/** Valores iniciales únicos, desde `initialLogin()` (nunca duplicados). */
const valoresIniciales: LoginForm = initialLogin().form;

/** Metadatos de los campos del formulario para repartir por props. */
export const inputsFormulario: LoginInput[] = [
  {
    name: "email",
    label: "Correo electrónico",
    type: "email",
    placeholder: "correo@ejemplo.com",
    autoComplete: "email",
    required: true,
    value: valoresIniciales.email,
  },
  {
    name: "password",
    label: "Contraseña",
    type: "password",
    placeholder: "Escribe tu contraseña",
    autoComplete: "current-password",
    required: true,
    value: valoresIniciales.password,
  },
];

/**
 * Adapta el formulario antes de enviarlo (hoy lo pasa tal cual).
 *
 * @param form Valores actuales del formulario.
 * @returns Cuerpo `{ email, password }` para `postLogin`.
 */
export function mapDeFormulario(form: LoginForm): LoginForm {
  return { email: form.email, password: form.password };
}

/**
 * Normaliza el mensaje de error para la interfaz.
 *
 * @param mensaje Mensaje crudo de la capa fetch.
 * @returns Texto visible en castellano, nunca vacío.
 */
export function mapTextoError(mensaje: string): string {
  return mensaje || "No se pudo iniciar sesión";
}

/**
 * Mapea la lista de errores detallados del backend (Zod) a un objeto plano por campo.
 */
export function mapErroresCampos(details?: any[]): Partial<Record<keyof LoginForm, string>> {
  if (!details || !Array.isArray(details)) return {};

  return details.reduce((acc, curr) => {
    if (curr && curr.campo && curr.message) {
      acc[curr.campo as keyof LoginForm] = curr.message;
    }
    return acc;
  }, {} as Partial<Record<keyof LoginForm, string>>);
}

/** Configuración del módulo: sin filtros ni paginación (solo formulario). */
const config: ConfigLogin = {
  recursoSingular: "login",
  servicios: { registro: postLogin },
  inputsFormulario,
  inicialFormData: initialLogin().form,
  maps: { 
    mapDeFormulario, 
    mapTextoError, 
    mapErroresCampos 
  },
};

/**
 * Seteo público del login: arma `config` y delega en el motor.
 *
 * @returns Estado actual y manejadores `{ onChange, onSubmit, onReset }`.
 */
export function useAbmLogin() {
  return useAbmLoginLogic(config);
}