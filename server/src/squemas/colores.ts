import { z } from "zod";

const hexRegex = /^#[0-9A-Fa-f]{6}$/;

const codigoHexSchema = z.preprocess(
  (val) => {
    if (val === undefined) return undefined;
    if (val === null) return null;
    if (typeof val === "string") {
      const t = val.trim();
      if (t === "") return null;
      return t.toUpperCase();
    }
    return val;
  },
  z
    .string()
    .regex(hexRegex, "codigo_hex debe tener formato #RRGGBB")
    .nullable()
    .optional(),
);

const codigoHexAltaSchema = z.preprocess(
  (val) => {
    if (val === undefined || val === null) return null;
    if (typeof val === "string") {
      const t = val.trim();
      if (t === "") return null;
      return t.toUpperCase();
    }
    return val;
  },
  z.string().regex(hexRegex, "codigo_hex debe tener formato #RRGGBB").nullable(),
);

/** Schema de alta de color. */
export const ColorCrearSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre del color es requerido." })
    .trim()
    .min(1, "El nombre del color es requerido.")
    .max(50, "El nombre no puede superar los 50 caracteres"),
  codigo_hex: codigoHexAltaSchema.optional(),
});

/** Schema de modificación de color (nombre y/o codigo_hex). */
export const ColorActualizarSchema = z
  .object({
    id_color: z.coerce
      .number({ required_error: "El ID del color es obligatorio." })
      .int("El ID del color debe ser un número entero.")
      .positive("El ID del color es inválido."),
    nombre: z
      .string()
      .trim()
      .min(1, "El nombre del color es requerido.")
      .max(50, "El nombre no puede superar los 50 caracteres")
      .optional(),
    codigo_hex: codigoHexSchema,
  })
  .refine((data) => data.nombre !== undefined || data.codigo_hex !== undefined, {
    message: "Debe enviar al menos nombre o codigo_hex para modificar.",
  });

/** Schema de cambio de estado de color. */
export const ColorActivoSchema = z.object({
  id_color: z.coerce
    .number({ required_error: "El ID del color es obligatorio." })
    .int("El ID del color debe ser un número entero.")
    .positive("El ID del color es inválido."),
  activo: z.coerce
    .number({ required_error: "El campo activo es obligatorio." })
    .int()
    .min(0)
    .max(1),
});

/** Schema de filtro por estado para listado de colores. */
export const ColorEstadoSchema = z.object({
  activo: z.coerce
    .number({ required_error: "El campo activo es obligatorio." })
    .int()
    .min(0)
    .max(1),
});

export type ColorCrearInputs = z.infer<typeof ColorCrearSchema>;
export type ColorActualizarInputs = z.infer<typeof ColorActualizarSchema>;
export type ColorActivoInput = z.infer<typeof ColorActivoSchema>;
export type ColorEstadoInput = z.infer<typeof ColorEstadoSchema>;
