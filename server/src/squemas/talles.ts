import { z } from "zod";

export const TalleCrearSchema = z.object({
  nombre:  z.string().min(1, "El nombre del talle es requerido")
            .max(20, "El nombre no puede superar los 20 caracteres"),
  orden: z.number().int("El orden debe ser un número entero").default(0),
});

export const TalleActualizarSchema = TalleCrearSchema.extend({
  id_talle: z.number().int().positive("El ID del talle es inválido"),
});

export const activoSchema = z.object({
  id_talle: z.number().int().positive("El ID del talle es inválido"),  
  activo: z
    .number({
      required_error: "El campo activo es obligatorio.",
      invalid_type_error: "El campo activo debe ser un número."
    })
    .int("El campo activo debe ser un número entero.")
    .min(0, "El valor de activo debe ser 0 o 1.")
    .max(1, "El valor de activo debe ser 0 o 1.")
});


// Ejemplo de cómo se integraría en un objeto (por ejemplo, para actualizar)
export const talleActivoUpdateSchema = z.object({
    activo: z
    .number({
      required_error: "El campo activo es obligatorio.",
      invalid_type_error: "El campo activo debe ser un número."
    })
    .int("El campo activo debe ser un número entero.")
    .min(0, "El valor de activo debe ser 0 o 1.")
    .max(1, "El valor de activo debe ser 0 o 1.")
});


export const reordenarTallesSchema = z.array(
  z.object({
    id_talle: z.number()
        .int("El campo activo debe ser un número entero."),

    orden: z.number()
        .int("El campo activo debe ser un número entero.")

  })
);

export type TalleCrearInputs = z.infer<typeof TalleCrearSchema>;
export type TalleActualizarInputs = z.infer<typeof TalleActualizarSchema>;
export type ActivoInput = z.infer<typeof activoSchema>;
export type EstadoInput = z.infer<typeof talleActivoUpdateSchema>;
export type ReordenarTallesInput = z.infer<typeof reordenarTallesSchema>;