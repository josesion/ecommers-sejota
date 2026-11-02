/**
 * Tipados del módulo de inicio de sesión.
 *
 * Sin dependencias: es la base que importan `fetch`, `reducers`, el motor
 * de `hooks/`, el seteo de `hookNegocios/`, el formulario, la página y el
 * contexto de autenticación.
 *
 * La sesión vive en memoria (`AuthContext`) y en la cookie httpOnly
 * `id_usuario` que gestiona el backend. Nunca se guarda el token ni la
 * contraseña en el frontend.
 */

import type { ApiResponse } from "../utils/apiFetch";

/** Datos que el usuario escribe en el formulario de inicio de sesión. */
export interface LoginForm {
  email: string;
  password: string;
}

/** Datos públicos del usuario autenticado que consume la interfaz. */
export interface LoginUser {
  id: number;
  rol: string;
  email: string;
}

/** Respuesta cruda del backend (`data` de `POST /api/login`). */
export interface LoginData {
  id: number;
  rol: string;
  email: string;
}

/** Sobre normalizado de la capa fetch con el usuario autenticado. */
export type LoginResponse = ApiResponse<LoginUser>;

/** Error normalizado para mostrar en la interfaz. */
export interface LoginError {
  message: string;
  statusCode: number;
  code?: string;
}

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

/**
 * Metadatos de un campo del formulario (adición menor: no estaba entre los
 * 5 tipos del plan §1.1; la prop `inputs` del formulario los necesita).
 */
export interface LoginInput {
  /** Clave de `LoginForm` que edita el campo. */
  name: keyof LoginForm;
  /** Etiqueta visible del campo. */
  label: string;
  /** Tipo nativo del `input`. */
  type: TipoInput ;
  /** Texto de ayuda dentro del campo. */
  placeholder: string;
  /** Pista de autocompletado del navegador. */
  autoComplete: string;
  /** Si el campo es obligatorio. */
  required: boolean;
  /** Valor inicial del campo, desde `initialLogin()`. */
  value: string;
}
