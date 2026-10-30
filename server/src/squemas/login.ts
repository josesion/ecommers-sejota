import { z } from "zod";

/**
 * ESQUEMA PARA LOGIN (POST)
 * `email` valida formato real y `password` se corta a la cola larga para
 * evitar hashes/reintentos absurdos; el minimo lo controla el servicio
 * contra el hash guardado, no el schema.
 */
export const LoginSchema = z.object({
  email: z.string().trim().email("Email invalido").max(150),
  password: z
    .string()
    .min(6, "La contrasena debe tener al menos 6 caracteres")
    .max(255, "La contrasena es demasiado larga"),
});

/** Datos de entrada del login, ya inferidos del schema. */
export type LoginInputs = z.infer<typeof LoginSchema>;
