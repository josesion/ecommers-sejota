import { Response } from "express";
import { CodigoEstadoHTTP } from "../tipados/generico";
import { TipadoData } from "../tipados/tipado.data";

/**
 * Envia una respuesta HTTP de exito con la forma de `TipadoData`.
 *
 * Es el contrato manual: se usa solo cuando `handleControladores` no alcanza
 * (payloads multiples, respuesta condicional). Los controladores usan
 * `handleControladores` siempre que puedan.
 *
 * @param {Response} res - Respuesta HTTP.
 * @param {CodigoEstadoHTTP} statusCode - Codigo de estado de la respuesta.
 * @param {string} message - Mensaje legible para el cliente.
 * @param {T} data - Carga util de la respuesta.
 * @param {TipadoData<any>["paginacion"]} [paginacion] - Metadatos de paginacion, si la operacion es un listado.
 * @param {string} [code] - Codigo interno del negocio, en UPPER_SNAKE_CASE.
 * @returns {void}
 * @example enviarResponse(res, CodigoEstadoHTTP.OK, "Listado OK", filas, { pagina: 1, limite: 10, contadorPagina: 3 }, "LISTADO_OK");
 */
export function enviarResponse<T>(
  res: Response,
  statusCode: CodigoEstadoHTTP,
  message: string,
  data: T,
  paginacion?: TipadoData<any>["paginacion"],
  code?: string,
): void {
  res.status(statusCode).json({
    error: false,
    message,
    data,
    paginacion,
    code,
  });
}

/**
 * Envia una respuesta HTTP de error con la forma de `TipadoData`.
 *
 * @param {Response} res - Respuesta HTTP.
 * @param {CodigoEstadoHTTP} statusCode - Codigo de estado de la respuesta.
 * @param {string} message - Mensaje legible para el cliente.
 * @param {string} code - Codigo interno del negocio, en UPPER_SNAKE_CASE.
 * @param {unknown[]} [errorsDetails] - Detalle del error, p. ej. los `issues` de un `ZodError`.
 * @returns {void}
 * @example enviarResponseError(res, CodigoEstadoHTTP.NO_ENCONTRADO, "No existe la escuela", "ESCUELA_NO_ENCONTRADA");
 */
export function enviarError(
  res: Response,
  statusCode: CodigoEstadoHTTP,
  message: string,
  code: string,
  errorsDetails?: unknown[],
): void {
  res.status(statusCode).json({
    error: true,
    message,
    code,
    errorsDetails,
  });
}
