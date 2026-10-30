import { Response } from "express";
import { CodigoEstadoHTTP } from "../tipados/generico";

export function enviarResponseError(
  res: Response,
  statusCode: number,
  message: string,
  code: string,
  errorsDetails?: any[]
): void {
  res.status(statusCode).json({
    error: true,
    message,
    code,
    errorsDetails,
  });
}
