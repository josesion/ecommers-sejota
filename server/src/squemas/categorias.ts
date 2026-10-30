import { z } from "zod";

/**
 * Formato slug: minusculas, numeros y guiones simples, sin guiones en los
 * extremos. Se normaliza a minusculas para no depender del cliente.
 */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * ESQUEMA PARA LISTADO (GET)
 * `pagina` y `limite` se acotan antes de construir el OFFSET.
 * `activo` filtra por baja logica: 1 (default) solo activas, 0 solo dadas de baja.
 */
export const CategoriaListadoSchema = z.object({
  pagina: z.coerce.number().int().positive().default(1),
  limite: z.coerce.number().int().positive().max(100).default(10),
  busqueda: z.string().trim().min(1).max(150).optional(),
  activo: z.coerce
    .number()
    .int()
    .refine((valor) => valor === 0 || valor === 1, {
      message: "El filtro activo solo admite 0 o 1",
    })
    .default(1),
});

/** ESQUEMA PARA CREAR (POST) */
export const CategoriaCrearSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio")
    .max(120)
    .regex(
      SLUG_REGEX,
      "Slug invalido: solo minusculas, numeros y guiones entre palabras",
    )
    .toLowerCase(),
  descripcion: z.string().trim().max(1000).optional().nullable(),
});

/** ESQUEMA PARA ACTUALIZAR (PUT) */
export const CategoriaActualizarSchema = z.object({
  id_categoria: z.coerce.number().int().positive("ID de categoria invalido"),
  nombre: z.string().trim().min(1).max(100).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(
      SLUG_REGEX,
      "Slug invalido: solo minusculas, numeros y guiones entre palabras",
    )
    .toLowerCase()
    .optional(),
  descripcion: z.string().trim().max(1000).optional().nullable(),
  activo: z.coerce
    .number()
    .int()
    .refine((valor) => valor === 0 || valor === 1, {
      message: "El campo activo solo admite 0 o 1",
    })
    .optional(),
});

/** ESQUEMA PARA DAR DE BAJA (DELETE) */
export const CategoriaBajaSchema = z.object({
  id_categoria: z.coerce.number().int().positive("ID de categoria invalido"),
});

export type CategoriaListadoInputs = z.infer<typeof CategoriaListadoSchema>;
export type CategoriaCrearInputs = z.infer<typeof CategoriaCrearSchema>;
export type CategoriaActualizarInputs = z.infer<
  typeof CategoriaActualizarSchema
>;
export type CategoriaBajaInputs = z.infer<typeof CategoriaBajaSchema>;
