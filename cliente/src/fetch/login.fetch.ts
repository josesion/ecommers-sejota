/**
 * Llamadas fetch del módulo de inicio de sesión.
 *
 * Único fichero del módulo que llama a `apiFetch`. Lee el endpoint público
 * `POST /api/login` del backend (caja negra): recibe `{ email, password }`
 * y devuelve los datos públicos del usuario. El JWT viaja en la cookie
 * httpOnly `id_usuario`, por eso se usa `credentials: "include"`.
 *
 * El sobre `{ error, message, data, code }` ya coincide con el backend:
 * no se normaliza nada.
 */

import { apiFetch } from "../utils/apiFetch";
import type { LoginForm, LoginResponse, LoginUser } from "../tipado/login";

/** Ruta pública del backend que autentica al usuario. */
const RUTA_LOGIN = "/api/login";

/**
 * Inicia sesión contra el backend.
 *
 * @param form - Credenciales `{ email, password }` del formulario.
 * @returns Respuesta tipada con el usuario autenticado o el error.
 */
export async function postLogin(form: LoginForm): Promise<LoginResponse> {
  return apiFetch<LoginUser>(RUTA_LOGIN, {
    method: "POST",
    body: { email: form.email, password: form.password },
    credentials: "include",
  });
}
