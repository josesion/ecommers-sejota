/**
 * Fila de `usuarios` tal como vuelve del listado.
 * Nunca incluye `password`: los SELECT de la capa data no lo piden.
 */
export interface UsuarioListado {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: "cliente" | "admin";
  creado_en: Date;
  actualizado_en: Date;
}

/**
 * Resultado de un alta. `id` lo inyecta el hook `iudEntidad` desde el
 * `insertId` de MySQL cuando `metodo === "CREAR"`.
 */
export interface UsuarioCreado {
  id: number;
  email: string;
}

/**
 * Fila mínima que devuelve `buscarExistenteEntidad` al detectar un duplicado.
 */
export interface UsuarioExistente {
  id_usuario: number;
  email: string;
}

/**
 * Payload que la capa data recibe para modificar un usuario.
 * `password` se excluye a proposito: el cambio de contrasena es otro flujo.
 */
export interface UsuarioActualizacionPayload {
  id_usuario: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string | null;
  rol?: "cliente" | "admin";
}

/**
 * Payload que la capa data recibe al insertar.
 * `password` llega **ya hasheado** desde el servicio.
 */
export interface UsuarioAltaPayload {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string | null;
  rol: "cliente" | "admin";
}
