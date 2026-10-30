import pool from "../bd";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export { pool };

/**
 * Ejecuta un SELECT y devuelve las filas tipadas.
 *
 * Es la única vía de lectura de la capa data: siempre placeholders `?`
 * y valores en un array, nunca interpolación en el string.
 *
 * @async
 * @function select
 * @param {string} slq - Consulta con placeholders `?`.
 * @param {unknown[]} valores - Valores de los placeholders, en orden.
 * @returns {Promise<T[]>} Filas devueltas por la consulta (array vacío si no hay coincidencias).
 * @example const usuarios = await select<UsuarioRow>("SELECT * FROM usuarios WHERE rol = ?", ["cliente"]);
 */
export const select = async <T>(slq: string, valores: unknown[]): Promise<T[]> => {
  const [filas] = await pool.query<RowDataPacket[]>(slq, valores);
  return filas as T[];
};

/**
 * Ejecuta un INSERT / UPDATE / DELETE y devuelve la metadata de la operación.
 *
 * Es la única vía de escritura de la capa data: siempre placeholders `?`
 * y valores en un array, nunca interpolación en el string.
 *
 * @async
 * @function iud
 * @param {string} slq - Consulta con placeholders `?`.
 * @param {unknown[]} valores - Valores de los placeholders, en orden.
 * @returns {Promise<IudResultMetadata>} Metadata de la operación.
 * @example const meta = await iud("UPDATE usuarios SET nombre = ? WHERE id_usuario = ?", ["Juan", 1]);
 */
export const iud = async (
  slq: string,
  valores: unknown[],
): Promise<IudResultMetadata> => {
  const [resultado] = await pool.query<ResultSetHeader>(slq, valores);
  return {
    affectedRows: resultado.affectedRows,
    insertId: resultado.insertId,
  };
};

/**
 * Metadata devuelta por `iud` tras un INSERT / UPDATE / DELETE.
 */
export interface IudResultMetadata {
  affectedRows: number;
  insertId: number;
}
