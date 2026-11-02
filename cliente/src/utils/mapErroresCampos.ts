export interface DetalleErrorBackend {
  campo: string;
  message: string;
  code?: string;
}

/**
 * Mapea la lista de errores del backend de forma segura ante nulos o objetos vacíos.
 */
export function mapErroresCampos<T extends string>(
  details?: DetalleErrorBackend[] | unknown
): Partial<Record<T, string>> {
  // Si no es un arreglo válido, devolvemos un objeto vacío de forma segura
  if (!details || !Array.isArray(details)) return {};

  return details.reduce((acc, curr) => {
    if (curr && typeof curr === "object" && "campo" in curr && "message" in curr) {
      const detalle = curr as DetalleErrorBackend;
      if (detalle.campo && detalle.message) {
        acc[detalle.campo as T] = detalle.message;
      }
    }
    return acc;
  }, {} as Partial<Record<T, string>>);
}