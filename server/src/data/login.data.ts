import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { TipadoData } from "../tipados/tipado.data";
import { UsuarioLogin } from "../tipados/login";

/**
 * Trae el usuario por email, INCLUIDO el hash de `password` y el `estado`.
 * Es el unico SELECT del proyecto que pide `password`: el servicio lo pasa
 * directo a `bcrypt.compare` y nunca lo devuelve.
 *
 * No filtra por `estado` a proposito: el servicio necesita distinguir
 * "no existe" (`USUARIO_NO_EXISTE`) de "existe pero esta de baja"
 * (`USUARIO_EXISTE` con `estado === 0`).
 *
 * @async
 * @function buscarUsuarioPorEmail
 * @param {object} data - Solo necesita `email`.
 * @param {string} data.email - Email del login.
 * @returns {Promise<TipadoData<UsuarioLogin>>} `USUARIO_EXISTE` con la fila en `data`, o `USUARIO_NO_EXISTE`.
 */
const buscarUsuarioPorEmail = async (data: {
  email: string;
}): Promise<TipadoData<UsuarioLogin>> => {
  const slqEntidad = `SELECT id_usuario, email, password, rol, estado
                       FROM usuarios
                       WHERE email = ?`;

  return buscarExistenteEntidad<UsuarioLogin>({
    slqEntidad,
    valores: [data.email],
    entidad: "Usuario",
  });
};

export const method = {
  buscarUsuarioPorEmail: tryCatchDatos(buscarUsuarioPorEmail, "usuario"),
};
