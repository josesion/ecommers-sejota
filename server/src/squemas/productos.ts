import { z } from "zod";

/**
 * Formato slug: minusculas, numeros y guiones simples, sin guiones en los
 * extremos. Se normaliza a minusculas para no depender del cliente.
 */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * ESQUEMA PARA LISTADO (GET)
 * `pagina` y `limite` se acotan antes de construir el OFFSET.
 * `activo` filtra por baja logica: 1 (default) solo activos, 0 solo dados de baja.
 * `id_categoria` es opcional: filtra los productos de una categoria.
 */
export const ProductoListadoSchema = z.object({
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
  id_categoria: z.coerce.number().int().positive().optional(),
});

/** ESQUEMA PARA CREAR (POST) */
export const ProductoCrearSchema = z.object({
  id_categoria: z.coerce.number().int().positive("La categoria es obligatoria"),
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(150),
  slug: z
    .string()
    .trim()
    .min(1, "El slug es obligatorio")
    .max(170)
    .regex(
      SLUG_REGEX,
      "Slug invalido: solo minusculas, numeros y guiones entre palabras",
    )
    .toLowerCase(),
  precio_base: z.coerce.number().positive("El precio base es obligatorio"),
  precio_oferta: z.coerce.number().positive().optional().nullable(),
  descripcion: z.string().trim().max(5000).optional().nullable(),
  guia_talles: z.string().trim().max(5000).optional().nullable(),
});

/** ESQUEMA PARA ACTUALIZAR (PUT) */
export const ProductoActualizarSchema = z.object({
  id_producto: z.coerce.number().int().positive("ID de producto invalido"),
  nombre: z.string().trim().min(1).max(150).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(170)
    .regex(
      SLUG_REGEX,
      "Slug invalido: solo minusculas, numeros y guiones entre palabras",
    )
    .toLowerCase()
    .optional(),
  precio_base: z.coerce.number().positive().optional(),
  precio_oferta: z.coerce.number().positive().optional().nullable(),
  descripcion: z.string().trim().max(5000).optional().nullable(),
  guia_talles: z.string().trim().max(5000).optional().nullable(),
  activo: z.coerce
    .number()
    .int()
    .refine((valor) => valor === 0 || valor === 1, {
      message: "El campo activo solo admite 0 o 1",
    })
    .optional(),
});

/** ESQUEMA PARA DAR DE BAJA (DELETE) */
export const ProductoBajaSchema = z.object({
  id_producto: z.coerce.number().int().positive("ID de producto invalido"),
});

export type ProductoListadoInputs = z.infer<typeof ProductoListadoSchema>;
export type ProductoCrearInputs = z.infer<typeof ProductoCrearSchema>;
export type ProductoActualizarInputs = z.infer<
  typeof ProductoActualizarSchema
>;
export type ProductoBajaInputs = z.infer<typeof ProductoBajaSchema>;
