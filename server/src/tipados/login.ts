import type { LoginInputs } from "../squemas/login";

/** Payload que se firma en el JWT de sesion. */
export interface LoginTokenPayload {
  id: number;
  rol: string;
  email: string;
}

/**
 * Respuesta del login. `token` es para la cookie; el resto es lo que se
 * devuelve legible al cliente.
 */
export interface LoginRespuesta extends LoginTokenPayload {
  token: string;
}

/**
 * Fila de `usuarios` tal como la necesita el login. Es el UNICO punto
 * donde `password` sale de la base: va directo a `bcrypt.compare`
 * y nunca se persiste ni se devuelve.
 */
export interface UsuarioLogin {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: "cliente" | "admin";
  estado: number;
  telefono?: string | null;
  id_direccion_principal?: number | null;
}

export type { LoginInputs };
