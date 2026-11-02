/**
 * Lógica del módulo de inicio de sesión (el motor, C6).
 *
 * Recibe `config` del seteo de `hookNegocios/` y hace el trabajo:
 * `useReducer` con `initialLogin()` y los handlers `onChange`, `onSubmit`
 * y `onReset`. Los servicios llegan dentro de `config`: este fichero NO
 * importa el fetch.
 *
 * La sesión se delega (C7): ante un éxito llama a `establecerSesion(user)`
 * del contexto, dueño único de "¿hay sesión?". Sin JSX.
 */

import { useReducer } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { initialLogin, loginReducer } from "../reducers/loginReducers";
import type { LoginEstado } from "../reducers/loginReducers";
import { useAuth } from "../contexto/AuthContext";
import { useNotificaciones } from "../contexto/notificaciones.context";
import { mapErroresCampos } from "../utils/mapErroresCampos";

import type {
  LoginForm,
  LoginInput,
  LoginResponse,
  LoginUser,
} from "../tipado/login";

/** Configuración que el seteo arma y el motor consume. */
export interface ConfigLogin {
  /** Nombre singular del recurso, para mensajes. */
  recursoSingular: string;
  /** Servicios inyectados por el seteo (fetch directo). */
  servicios: {
    registro: (form: LoginForm) => Promise<LoginResponse>;
  };
  /** Metadatos de los campos del formulario. */
  inputsFormulario: LoginInput[];
  /** Valores iniciales del formulario, desde `initialLogin()`. */
  inicialFormData: LoginForm;
  /** Mapeadores del módulo. */
  maps: {
    mapDeFormulario: (form: LoginForm) => LoginForm;
    mapTextoError: (mensaje: string) => string;
    mapErroresCampos: (details?: any[]) => Partial<Record<keyof LoginForm, string>>;
  };
}

/** Manejadores que el motor expone a la página. */
export interface LoginHandlers {
  /** Actualiza un campo del formulario y limpia el error visible. */
  onChange: (evento: ChangeEvent<HTMLInputElement>) => void;
  /** Envía las credenciales y delega la sesión al contexto. */
  onSubmit: (evento: FormEvent<HTMLFormElement>) => Promise<void>;
  /** Reinicia el formulario a `initialLogin()`. */
  onReset: () => void;
}

/**
 * Motor del login: estado del reducer y handlers del formulario.
 *
 * @param config - Configuración armada por el seteo de `hookNegocios/`.
 * @returns Estado actual y manejadores `onChange`, `onSubmit` y `onReset`.
 */
export function useAbmLogin(config: ConfigLogin): {
  state: LoginEstado;
  handlers: LoginHandlers;
} {
 
  // Extraemos las funciones del provider de notificaciones
  const { exito, error } = useNotificaciones();
  const [state, dispatch] = useReducer(loginReducer, undefined, initialLogin);
  const { establecerSesion } = useAuth();

  /**
   * Actualiza un campo del formulario y limpia el error visible.
   *
   * @param evento - Cambio del `input` (`name` es `keyof LoginForm`).
   */
  function onChange(evento: ChangeEvent<HTMLInputElement>): void {
    const campo = evento.target.name as keyof LoginForm;
    dispatch({ tipo: "SET_CAMPO", campo, valor: evento.target.value });
  }

  /**
   * Envía las credenciales al backend y delega la sesión al contexto.
   * Ramifica por `respuesta.code` (`LOGIN_OK`, `CREDENCIALES_INVALIDAS`,
   * `USUARIO_INACTIVO`, `ERROR_SERVIDOR`): solo `LOGIN_OK` sin error
   * establece la sesión; el resto muestra el mensaje mapeado.
   * Guarda anti doble envío con el bloque `carga`; la carga se cierra
   * siempre en `finally`. El error conserva lo escrito para corregirlo.
   *
   * @param evento - Envío del `form`.
   */
async function onSubmit(evento: FormEvent<HTMLFormElement>): Promise<void> {
  evento.preventDefault();
  
  if (state.carga.formulario) return;

  // 1. Activamos carga y limpiamos errores anteriores
  dispatch({ tipo: "SET_CARGA", bloque: "formulario", carga: true });
  dispatch({ tipo: "SET_ERRORES_CAMPOS", errores: {} });
  dispatch({ tipo: "SET_ERROR", bloque: "formulario", error: null });

  try {
    const respuesta = await config.servicios.registro(
      config.maps.mapDeFormulario(state.form),
    );

    // 2. Evaluamos si es un Error de Validación de Zod
    if (respuesta.error && respuesta.code === "VALIDATION_ERROR") {
      // Mapeamos el array errorsDetails al objeto { [campo]: mensaje }
      const detallesCrudos = Array.isArray(respuesta.errorsDetails) ? respuesta.errorsDetails : [];
      const erroresCampos = config.maps.mapErroresCampos(detallesCrudos);

      // Inyectamos los errores específicos por campo en el reducer
      dispatch({ tipo: "SET_ERRORES_CAMPOS", errores: erroresCampos });

      const textoGlobal = config.maps.mapTextoError(respuesta.message);
      dispatch({ tipo: "SET_ERROR", bloque: "formulario", error: textoGlobal });
      error(textoGlobal);
      return;
    }

    // 3. Caso Éxito
    switch (respuesta.code) {
      case "LOGIN_OK": {
        if (!respuesta.error) {
          const user: LoginUser = respuesta.data;
          dispatch({ tipo: "SET_USUARIO", user });
          exito("¡Login correcto!");
          establecerSesion(user);
          return;
        }
        break;
      }
      case "CREDENCIALES_INVALIDAS":
      case "USUARIO_INACTIVO":
      case "ERROR_SERVIDOR":
      default:
        break;
    }

    // 4. Caso Error Genérico (Credenciales inválidas, usuario inactivo, etc.)
    const texto = config.maps.mapTextoError(respuesta.message);
    dispatch({ tipo: "SET_ERROR", bloque: "formulario", error: texto });
    error(texto);
  } catch {
    const texto = config.maps.mapTextoError(
      `No se pudo iniciar sesión con ${config.recursoSingular}`,
    );
    error(texto);

  } finally {
    dispatch({ tipo: "SET_CARGA", bloque: "formulario", carga: false });
  }
}

  /** Reinicia el formulario a su estado inicial. */
  function onReset(): void {
    dispatch({ tipo: "RESET_FORM" });
  }

  return { state, handlers: { onChange, onSubmit, onReset } };
}
