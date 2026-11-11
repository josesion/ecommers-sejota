import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { TipadoData } from "../tipados/tipado.data";
import {
  VerificarColorResult,
  PostColorResult,
  ModColorResult,
  EstadoColorResult,
  ColorResult,
  ColorActivoInput,
} from "../tipados/colores.tipado";

/**
 * Verifica la existencia de un color por nombre.
 * @param nombreColor Nombre normalizado del color.
 * @returns Resultado de existencia con datos del color si existe.
 */
const verificarExistenciaColor = async (
  nombreColor: string,
): Promise<TipadoData<VerificarColorResult>> => {
  const slqEntidad = `SELECT id_color, nombre, codigo_hex, activo FROM colores WHERE nombre = ? LIMIT 1;`;
  return buscarExistenteEntidad<VerificarColorResult>({
    slqEntidad,
    valores: [nombreColor],
    entidad: "color",
  });
};

/**
 * Inserta un nuevo color.
 * @param data Datos del color a crear.
 * @returns Resultado de la creación.
 */
const postColor = async (data: {
  nombre: string;
  codigo_hex: string | null;
}): Promise<TipadoData<PostColorResult>> => {
  const { nombre, codigo_hex } = data;
  const slqEntidad = `INSERT INTO colores (nombre, codigo_hex, activo) VALUES (?, ?, 1)`;
  return iudEntidad<PostColorResult>({
    slqEntidad,
    datosRetorno: { nombre, codigo_hex, activo: 1 },
    entidad: "colores",
    metodo: "CREAR",
    valores: [nombre, codigo_hex],
  });
};

/**
 * Modifica nombre y/o codigo_hex de un color.
 * @param data Campos a actualizar e id del color.
 * @returns Resultado de la modificación.
 */
const modColor = async (data: {
  id_color: number;
  nombre?: string;
  codigo_hex?: string | null;
}): Promise<TipadoData<ModColorResult>> => {
  const { id_color, nombre, codigo_hex } = data;
  const sets: string[] = [];
  const valores: Array<string | number | null> = [];

  if (nombre !== undefined) {
    sets.push("nombre = ?");
    valores.push(nombre);
  }
  if (codigo_hex !== undefined) {
    sets.push("codigo_hex = ?");
    valores.push(codigo_hex);
  }

  const slqEntidad = `UPDATE colores SET ${sets.join(", ")} WHERE id_color = ?`;
  valores.push(id_color);

  const datosRetorno: ModColorResult = { id_color };
  if (nombre !== undefined) datosRetorno.nombre = nombre;
  if (codigo_hex !== undefined) datosRetorno.codigo_hex = codigo_hex;

  return iudEntidad<ModColorResult>({
    slqEntidad,
    datosRetorno,
    entidad: "colores",
    metodo: "MODIFICAR",
    valores,
  });
};

/**
 * Cambia el estado (activo) de un color.
 * @param data Identificador y nuevo estado.
 * @returns Resultado del cambio de estado.
 */
const estadoColor = async (
  data: ColorActivoInput,
): Promise<TipadoData<EstadoColorResult>> => {
  const { activo, id_color } = data;
  const slqEntidad = `UPDATE colores SET activo = ? WHERE id_color = ?`;
  return iudEntidad<EstadoColorResult>({
    slqEntidad,
    datosRetorno: { activo, id_color },
    entidad: "colores",
    metodo: "MODIFICAR",
    valores: [activo, id_color],
  });
};

/**
 * Lista colores por estado activo.
 * @param estado 0 inactivos, 1 activos.
 * @returns Listado de colores.
 */
const listaColores = async (estado: number): Promise<TipadoData<ColorResult[]>> => {
  const slqListado = `SELECT
                        id_color,
                        nombre,
                        codigo_hex,
                        activo,
                        creado_en,
                        actualizado_en
                      FROM colores
                      WHERE activo = ?
                      ORDER BY id_color ASC;`;
  return listarEntidadSinPaginacion<ColorResult>({
    slqListado,
    entidad: "colores",
    estado: "activo",
    valores: [estado],
  });
};

export const method = {
  verificarExistenciaColor: tryCatchDatos(verificarExistenciaColor, "color"),
  postColor: tryCatchDatos(postColor, "color"),
  modColor: tryCatchDatos(modColor, "color"),
  estadoColor: tryCatchDatos(estadoColor, "color"),
  listaColores: tryCatchDatos(listaColores, "color"),
};
