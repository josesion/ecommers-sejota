import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidad } from "../hooks/funcionListar";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { TipadoData } from "../tipados/tipado.data";
import {
  UsuarioActualizacionPayload,
  UsuarioAltaPayload,
  UsuarioExistente,
  UsuarioListado,
} from "../tipados/usuarios";

/** Filtros del listado, ya validados por Zod en el servicio. */
export interface FiltrosListadoUsuarios {
  limite: number;
  offset: number;
  busqueda?: string;
  rol?: "cliente" | "admin";
}

/**
 * Verifica si ya existe un usuario con ese email.
 *
 * OJO con la semantica del hook: `USUARIO_EXISTE` viene con `error: true`
 * (es un fallo de la validacion), `USUARIO_NO_EXISTE` con `error: false`.
 *
 * @async
 * @function verificacionEmail
 * @param {object} data - Solo necesita `email`.
 * @param {string} data.email - Email a verificar.
 * @returns {Promise<TipadoData<UsuarioExistente>>} `USUARIO_EXISTE` o `USUARIO_NO_EXISTE`.
 */
const verificacionEmail = async (data: {
  email: string;
}): Promise<TipadoData<UsuarioExistente>> => {
  const slqEntidad = `SELECT id_usuario, email FROM usuarios WHERE email = ?`;
  return buscarExistenteEntidad<UsuarioExistente>({
    slqEntidad,
    valores: [data.email],
    entidad: "Usuario",
  });
};

/**
 * Verifica si un usuario esta activo, es decir, apto para darse de baja.
 *
 * OJO con la semantica invertida del hook: con el filtro `estado = 1`,
 * `USUARIO_EXISTE` (`error: true`) significa que SÍ hay una fila activa,
 * y `USUARIO_NO_EXISTE` (`error: false`) que NO la hay (ya fue dado de
 * baja o no existe). Es el servicio quien interpreta el `code`.
 *
 * @async
 * @function verificacionBaja
 * @param {object} data - Solo necesita `id_usuario`.
 * @param {number} data.id_usuario - Usuario a verificar.
 * @returns {Promise<TipadoData<UsuarioExistente>>} `USUARIO_EXISTE` o `USUARIO_NO_EXISTE`.
 */
const verificacionBaja = async (data: {
  id_usuario: number;
}): Promise<TipadoData<UsuarioExistente>> => {
  const slqEntidad = `SELECT id_usuario, email FROM usuarios WHERE id_usuario = ? AND estado = 1`;
  return buscarExistenteEntidad<UsuarioExistente>({
    slqEntidad,
    valores: [data.id_usuario],
    entidad: "Usuario",
  });
};

/**
 * Inserta un usuario. El `password` llega ya hasheado desde el servicio.
 *
 * @async
 * @function alta
 * @param {UsuarioAltaPayload} data - Datos del alta.
 * @returns {Promise<TipadoData<UsuarioCreado>>} `USUARIOS_CREAR` con `data.id`.
 */
const alta = async (
  data: UsuarioAltaPayload,
): Promise<TipadoData<{ email: string } & { id?: number }>> => {
  const slqEntidad = `INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol)
                      VALUES (?, ?, ?, ?, ?, ?)`;
  return iudEntidad<{ email: string }>({
    slqEntidad,
    valores: [
      data.nombre,
      data.apellido,
      data.email,
      data.password,
      data.telefono ?? null,
      data.rol,
    ],
    entidad: "Usuarios",
    metodo: "CREAR",
    datosRetorno: { email: data.email },
  });
};

/**
 * Lista usuarios activos con paginacion.
 *
 * `limit` y `offset` vienen casteados como enteros positivos por el schema Zod
 * del servicio, que es la condicion que el contrato exige para poder
 * interpolarlos en el string.
 *
 * @async
 * @function listado
 * @param {FiltrosListadoUsuarios} data - Filtros validados.
 * @param {number} data.pagina - Pagina actual, solo para el hook.
 * @returns {Promise<TipadoData<UsuarioListado[]>>} `USUARIOS_LISTED` con paginacion, o `NO_ACTIVE_USUARIOS`.
 */
const listado = async (
  data: FiltrosListadoUsuarios,
  pagina: number,
): Promise<TipadoData<UsuarioListado[]>> => {
  const { limite, offset, busqueda, rol } = data;

  const condiciones: string[] = ["estado = 1"];
  const valores: unknown[] = [];

  if (busqueda) {
    condiciones.push("(nombre LIKE ? OR apellido LIKE ? OR email LIKE ?)");
    const like = `%${busqueda}%`;
    valores.push(like, like, like);
  }
  if (rol) {
    condiciones.push("rol = ?");
    valores.push(rol);
  }

  const where = condiciones.join(" AND ");
  const limiteSeguro = Math.trunc(limite);
  const offsetSeguro = Math.trunc(offset);

  const slqListado = `SELECT id_usuario, nombre, apellido, email, telefono, rol,
                             creado_en, actualizado_en,
                             COUNT(*) OVER() AS total_registros
                      FROM usuarios
                      WHERE ${where}
                      ORDER BY id_usuario DESC
                      LIMIT ${limiteSeguro} OFFSET ${offsetSeguro}`;

  return listarEntidad<UsuarioListado>({
    slqListado,
    valores,
    limit: limiteSeguro,
    pagina: String(pagina),
    entidad: "Usuarios",
    estado: "activos",
  });
};

/**
 * Modifica un usuario. Solo toca los campos presentes en el payload.
 *
 * @async
 * @function modificacion
 * @param {UsuarioActualizacionPayload} data - Campos a cambiar mas `id_usuario`.
 * @returns {Promise<TipadoData<{ email: string }>>} `USUARIOS_MODIFICAR`, o lanza `ClientError` 404 si no existe.
 */
const modificacion = async (
  data: UsuarioActualizacionPayload,
): Promise<TipadoData<{ email?: string } & { id?: number }>> => {
  const { id_usuario, ...campos } = data;

  const sets: string[] = [];
  const valores: unknown[] = [];

  if (campos.nombre !== undefined) {
    sets.push("nombre = ?");
    valores.push(campos.nombre);
  }
  if (campos.apellido !== undefined) {
    sets.push("apellido = ?");
    valores.push(campos.apellido);
  }
  if (campos.email !== undefined) {
    sets.push("email = ?");
    valores.push(campos.email);
  }
  if (campos.telefono !== undefined) {
    sets.push("telefono = ?");
    valores.push(campos.telefono);
  }
  if (campos.rol !== undefined) {
    sets.push("rol = ?");
    valores.push(campos.rol);
  }

  const slqEntidad = `UPDATE usuarios SET ${sets.join(", ")} WHERE id_usuario = ? AND estado = 1`;
  valores.push(id_usuario);

  return iudEntidad<{ email?: string }>({
    slqEntidad,
    valores,
    entidad: "Usuarios",
    metodo: "MODIFICAR",
    datosRetorno: {},
  });
};

/**
 * Da de baja logica a un usuario: `estado = 0` mas `eliminado_en`.
 * No borra la fila fisicamente.
 *
 * @async
 * @function baja
 * @param {number} data.id_usuario - Usuario a dar de baja.
 * @returns {Promise<TipadoData<{ id_usuario: number }>>} `USUARIOS_MODIFICAR`, o lanza `ClientError` 404 si no esta activo.
 */
const baja = async (
  data: { id_usuario: number },
): Promise<TipadoData<{ id_usuario: number }>> => {
  const slqEntidad = `UPDATE usuarios
                      SET estado = 0, eliminado_en = CURRENT_TIMESTAMP
                      WHERE id_usuario = ? AND estado = 1`;

  return iudEntidad<{ id_usuario: number }>({
    slqEntidad,
    valores: [data.id_usuario],
    entidad: "Usuarios",
    metodo: "MODIFICAR",
    datosRetorno: { id_usuario: data.id_usuario },
  });
};

export const method = {
  verificacionEmail: tryCatchDatos(verificacionEmail, "usuario"),
  verificacionBaja: tryCatchDatos(verificacionBaja, "usuario"),
  alta: tryCatchDatos(alta, "usuario"),
  listado: tryCatchDatos(listado, "usuario"),
  modificacion: tryCatchDatos(modificacion, "usuario"),
  baja: tryCatchDatos(baja, "usuario"),
};
