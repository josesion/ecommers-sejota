import { Response } from "express";
import { TipadoData } from "../tipados/tipado.data";
import { CodigoEstadoHTTP } from "../tipados/generico";
import { enviarResponse } from "./response";
import { enviarResponseError } from "./responseError";

/**
 * Mapa de traduccion `code` interno -> status HTTP + mensaje por defecto.
 * Vive en `src/respuestas/<dominio>.ts`.
 */
export type MapaRespuestas = Record<
  string,
  { status: CodigoEstadoHTTP; msg: string }
>;

/**
 * Configuracion de reserva cuando el `code` que devuelve el servicio no esta
 * en el mapa. Evita que un `code` sin mapear se traduzca a un 200 con `error: true`.
 */
const ERROR_SERVIDOR: MapaRespuestas[string] = {
  status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
  msg: "Error interno de servidor, intente nuevamente",
};

/**
 * Invoca un servicio y responde de forma centralizada.
 *
 * Decide entre `enviarResponse` y `enviarResponseError` segun el status del
 * mapa: cualquier 2xx (200, 201, 204) es exito, el resto es error. Inyecta
 * `resultado.paginacion`
 * cuando el servicio lo trae. Es el contrato por defecto de los controladores:
 * solo se usa el contrato manual cuando la respuesta no encaja aqui.
 *
 * @async
 * @function handleControladores
 * @param {Response} res - Respuesta HTTP.
 * @param {TInputs} dataEntrada - Payload armado por el controlador, ya casteado.
 * @param {servicio} servicio - Funcion del servicio a invocar.
 * @param {MapaRespuestas} mapa - Mapa de `code` a status HTTP, con `ERROR_SERVIDOR` incluido.
 * @returns {Promise<void>}
 * @example
 * await handleControladores<AlumnoInputs, AlumnoListado>(
 *   res,
 *   dataAlumno,
 *   servicioAlumno.altaAlumno,
 *   MAPA_ALTA_ALUMNO,
 * );
 */
export async function handleControladores<TInputs, TRetorno>(
  res: Response,
  dataEntrada: TInputs,
  servicio: (data: TInputs) => Promise<TipadoData<TRetorno>>,
  mapa: MapaRespuestas,
): Promise<void> {
  const resultado = await servicio(dataEntrada);
  const config = mapa[resultado.code] ?? ERROR_SERVIDOR;

  // Cualquier 2xx es exito: 200, 201 (CREADO), 204 (SIN_CONTENIDO)...
  const esExito = config.status >= 200 && config.status < 300;

  if (esExito) {
    return enviarResponse(
      res,
      config.status,
      resultado.message || config.msg,
      resultado.data as TRetorno,
      resultado.paginacion,
      resultado.code,
    );
  }

  return enviarResponseError(
    res,
    config.status,
    resultado.message || config.msg,
    resultado.code,
    resultado.errorsDetails as unknown[] | undefined,
  );
}
