import { Request, Response } from "express";
import { method as servicioColores } from "../servicios/colores.servicio";
import { handleControladores } from "../utils/handleControladores";
import { tryCatch } from "../utils/tryCatch";
import {
  ColorCrearInputs,
  PostColorResult,
  ColorActualizarInputs,
  ModColorResult,
  ColorActivoInput,
  EstadoColorResult,
  ColorEstadoInput,
  ColorResult,
} from "../tipados/colores.tipado";
import {
  MAPA_ALTA_COLORES,
  MAPA_MOD_COLORES,
  MAPA_MOD_ESTADO_COLORES,
  MAPA_LISTADO_COLORES,
} from "../respuestas/colores";

/**
 * Crea un color.
 * @param req Body con `nombre` y opcional `codigo_hex`.
 * @param res Respuesta HTTP.
 */
const altaColores = async (req: Request, res: Response) => {
  const data: ColorCrearInputs = {
    nombre: req.body.nombre,
    codigo_hex: req.body.codigo_hex ?? null,
  };

  await handleControladores<ColorCrearInputs, PostColorResult>(
    res,
    data,
    servicioColores.altaColores,
    MAPA_ALTA_COLORES,
  );
};

/**
 * Modifica nombre y/o codigo_hex de un color.
 * @param req Body con `id_color` y campos a modificar.
 * @param res Respuesta HTTP.
 */
const modColores = async (req: Request, res: Response) => {
  const data: ColorActualizarInputs = {
    id_color: Number(req.body.id_color),
    ...(req.body.nombre !== undefined ? { nombre: req.body.nombre } : {}),
    ...(Object.prototype.hasOwnProperty.call(req.body, "codigo_hex")
      ? { codigo_hex: req.body.codigo_hex }
      : {}),
  };

  await handleControladores<ColorActualizarInputs, ModColorResult>(
    res,
    data,
    servicioColores.modColores,
    MAPA_MOD_COLORES,
  );
};

/**
 * Cambia el estado activo/inactivo de un color.
 * @param req Params `estado` (0|1) e `id`.
 * @param res Respuesta HTTP.
 */
const estadoColor = async (req: Request, res: Response) => {
  const data: ColorActivoInput = {
    activo: Number(req.params.estado),
    id_color: Number(req.params.id),
  };

  await handleControladores<ColorActivoInput, EstadoColorResult>(
    res,
    data,
    servicioColores.estadoColor,
    MAPA_MOD_ESTADO_COLORES,
  );
};

/**
 * Lista colores por estado activo.
 * @param req Params `estado` (0|1).
 * @param res Respuesta HTTP.
 */
const listaColores = async (req: Request, res: Response) => {
  const data: ColorEstadoInput = {
    activo: Number(req.params.estado),
  };

  await handleControladores<ColorEstadoInput, ColorResult[]>(
    res,
    data,
    servicioColores.listaColores,
    MAPA_LISTADO_COLORES,
  );
};

export const method = {
  altaColores: tryCatch(altaColores),
  modColores: tryCatch(modColores),
  estadoColor: tryCatch(estadoColor),
  listaColores: tryCatch(listaColores),
};
