import { z } from "zod";

/** Roles admitidos por el ENUM `rol` de la tabla `usuarios`. */
const roles = ["cliente", "admin"] as const;

/**
 * ESQUEMA PARA LISTADO (GET)
 * `pagina` y `limite` se acotan a enteros positivos porque el servicio los
 * interpola en el SQL como LIMIT/OFFSET (contrato: paginacion segura).
 */
export const UsuariosListadoSchema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(10),
  busqueda: z.string().trim().min(1).max(150).optional(),
  rol: z.enum(roles).optional(),
});

/** ESQUEMA PARA CREAR (POST) */
export const UsuariosCrearSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  apellido: z.string().trim().min(1, "El apellido es obligatorio").max(100),
  email: z.string().trim().email("Email invalido").max(150),
  password: z
    .string()
    .min(6, "La contrasena debe tener al menos 6 caracteres")
    .max(255),
  telefono: z.string().trim().max(30).optional().nullable(),
  rol: z.enum(roles).default("cliente"),
});

/** ESQUEMA PARA ACTUALIZAR (PUT) */
export const UsuariosActualizarSchema = z.object({
  id_usuario: z.coerce.number().int().positive("ID de usuario invalido"),
  nombre: z.string().trim().min(1).max(100).optional(),
  apellido: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().max(150).optional(),
  telefono: z.string().trim().max(30).optional().nullable(),
  rol: z.enum(roles).optional(),
});

/** ESQUEMA PARA ELIMINAR / DAR DE BAJA (DELETE) */
export const UsuariosBajaSchema = z.object({
  id_usuario: z.coerce.number().int().positive("ID de usuario invalido"),
});

export type UsuariosListadoInputs = z.infer<typeof UsuariosListadoSchema>;
export type UsuariosCrearInputs = z.infer<typeof UsuariosCrearSchema>;
export type UsuariosActualizarInputs = z.infer<typeof UsuariosActualizarSchema>;
export type UsuariosBajaInputs = z.infer<typeof UsuariosBajaSchema>;
