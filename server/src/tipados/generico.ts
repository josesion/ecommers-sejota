/**
 * Codigos de estado HTTP estandarizados para el manejo de respuestas.
 * Se utiliza en `handleControladores` para mapear los codigos de servicio
 * a configuraciones de respuesta HTTP.
 */
export enum CodigoEstadoHTTP {
  OK = 200,
  CREADO = 201,
  SIN_CONTENIDO = 204,
  SOLICITUD_INCORRECTA = 400,
  NO_AUTORIZADO = 401,
  PROHIBIDO = 403,
  NO_ENCONTRADO = 404,
  CONFLICTO = 409,
  ERROR_DE_VALIDACION = 422,
  ERROR_INTERNO_SERVIDOR = 500,
}
