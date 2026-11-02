/**
 * Reducer puro del formulario de inicio de sesión.
 *
 * Única fuente de verdad del estado inicial mediante `initialLogin()`.
 * Un solo bloque (`formulario`), porque el módulo tiene una sola operación.
 * No hace fetch ni tiene efectos: solo calcula el siguiente estado.
 *
 * La sesión NO vive aquí (C7): el dueño único es `AuthContext`. El `user`
 * guardado es solo el último usuario autenticado como dato de interfaz.
 */

import type { LoginForm, LoginUser } from "../tipado/login";

/** Bloques de estado del módulo. Uno solo: el login no tiene listado. */
export type BloqueLogin = "formulario";

/** Mensaje visible del bloque, de error o de éxito. */
export interface BannerLogin {
  tipo: "error" | "exito";
  mensaje: string;
}

/** Estado completo del módulo de inicio de sesión. */
export interface LoginEstado {
  /** Valores actuales del formulario. */
  form: LoginForm;
  /** Último usuario autenticado, `null` si aún no hay éxito. */
  user: LoginUser | null;
  /** Petición en curso por bloque. */
  carga: Record<BloqueLogin, boolean>;
  /** Error visible por bloque, `null` si no hay error. */
  error: Record<BloqueLogin, string | null>;
  /** Banner visible por bloque, `null` si no hay banner. */
  banner: Record<BloqueLogin, BannerLogin | null>;
  /** Errores específicos por campo devueltos por Zod (ej. { password: "..." }) */
  erroresCampos: Partial<Record<keyof LoginForm, string>>;
}

/**
 * Crea el estado inicial del login. Única fuente de verdad.
 *
 * @returns Estado inicial sin usuario, sin carga y sin error.
 */
export function initialLogin(): LoginEstado {
  return {
    form: { email: "", password: "" },
    user: null,
    carga: { formulario: false },
    error: { formulario: null },
    banner: { formulario: null },
    erroresCampos: {}, // 👈 Inicializado vacío
  };
}

/** Acciones aceptadas por `loginReducer`. */
export type LoginAccion =
  | { tipo: "SET_CAMPO"; campo: keyof LoginForm; valor: string }
  | { tipo: "SET_CARGA"; bloque: BloqueLogin; carga: boolean }
  | { tipo: "SET_ERROR"; bloque: BloqueLogin; error: string | null }
  | { tipo: "SET_USUARIO"; user: LoginUser | null }
  | { tipo: "SET_ERRORES_CAMPOS"; errores: Partial<Record<keyof LoginForm, string>> } 
  | { tipo: "RESET_FORM" };



/**
 * Calcula el siguiente estado del login de forma pura e inmutable.
 *
 * `SET_CAMPO` limpia el error del bloque y el error específico del campo que se está modificando.
 * `SET_ERROR`, `SET_USUARIO` y `RESET_FORM` bajan la carga del bloque.
 *
 * @param estado Estado actual.
 * @param accion Acción a aplicar.
 * @returns Nuevo estado sin mutar el anterior.
 */
export function loginReducer(
  estado: LoginEstado,
  accion: LoginAccion,
): LoginEstado {
  switch (accion.tipo) {
    case "SET_CAMPO": {
      // Copiamos los errores de campos y limpiamos el del campo que el usuario está editando
      const nuevosErroresCampos = { ...estado.erroresCampos };
      delete nuevosErroresCampos[accion.campo];

      return {
        ...estado,
        form: { ...estado.form, [accion.campo]: accion.valor },
        error: { ...estado.error, formulario: null },
        erroresCampos: nuevosErroresCampos,
      };
    }
    case "SET_CARGA":
      return {
        ...estado,
        carga: { ...estado.carga, [accion.bloque]: accion.carga },
      };
    case "SET_ERROR":
      return {
        ...estado,
        error: { ...estado.error, [accion.bloque]: accion.error },
        carga: { ...estado.carga, [accion.bloque]: false },
      };

    case "SET_USUARIO":
      return {
        ...estado,
        user: accion.user,
        carga: { ...estado.carga, formulario: false },
        error: { ...estado.error, formulario: null },
        erroresCampos: {},
      };
    case "SET_ERRORES_CAMPOS":
      return {
        ...estado,
        carga: { ...estado.carga, formulario: false }, // Bajamos carga si hubo error de validación
        erroresCampos: accion.errores,
      };
    case "RESET_FORM":
      return initialLogin();
    default:
      return estado;
  }
}