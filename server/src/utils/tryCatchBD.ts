import { ClientError } from "./error";
import { CodigoEstadoHTTP } from "../tipados/generico";

/** Género gramatical, para armar el mensaje de duplicado. */
export type GeneroEntidad = "m" | "f";

/** Cualquier función asíncrona de servicio o data. */
type FuncionAsincrona<TArgs extends unknown[], TResult> = (
  ...args: TArgs
) => Promise<TResult>;

/**
 * Envuelve una función de servicio o data para traducir el error de duplicado
 * de MySQL a un `ClientError` con mensaje automático.
 *
 * MySQL lanza `ER_DUP_ENTRY` (errno 1062) cuando se viola un índice UNIQUE.
 * Ese error técnico se convierte en un `ClientError` 409 `DUPLICATE_ENTITY`,
 * que el manejador global de `app.ts` sabe responder.
 *
 * La función se devuelve **sin alterar su firma**, así que la capa que la
 * consume la sigue llamando con los mismos argumentos.
 *
 * @param {FuncionAsincrona} fn - Función de servicio o data a proteger.
 * @param {string} [entidadNombre] - Singular de la entidad, p. ej. `"usuario"`. Sin esto no se arma el mensaje automático.
 * @param {GeneroEntidad} [genero] - `"m"` (por defecto) o `"f"`, para concordar "registrado"/"registrada".
 * @returns {FuncionAsincrona} La misma función, con el manejo de duplicado agregado.
 * @example const alta = tryCatchDatos(crearUsuario, "usuario");
 * @example const altaFemenino = tryCatchDatos(crearEmpresa, "empresa", "f"); // "Esta empresa ya se encuentra registrada"
 */
export function tryCatchDatos<TArgs extends unknown[], TResult>(
  fn: FuncionAsincrona<TArgs, TResult>,
  entidadNombre?: string,
  genero: GeneroEntidad = "m",
): FuncionAsincrona<TArgs, TResult> {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      return await fn(...args);
    } catch (error) {
      const detalle = error as { code?: string; errno?: number };
      const esDuplicado =
        detalle?.code === "ER_DUP_ENTRY" || detalle?.errno === 1062;

      if (esDuplicado) {
        const determinante = genero === "f" ? "Esta" : "Este";
        const participio = genero === "f" ? "registrada" : "registrado";
        const mensaje = entidadNombre
          ? `${determinante} ${entidadNombre} ya se encuentra ${participio}`
          : "Ya existe un registro con esos datos";

        throw new ClientError(
          mensaje,
          CodigoEstadoHTTP.CONFLICTO,
          "DUPLICATE_ENTITY",
        );
      }

      throw error;
    }
  };
}
