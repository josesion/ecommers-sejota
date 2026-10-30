import bcrypt from "bcrypt";
import { method as usuariosData } from "../data/usuarios.data";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { TipadoData } from "../tipados/tipado.data";
import {
  UsuariosActualizarInputs,
  UsuariosActualizarSchema,
  UsuariosBajaInputs,
  UsuariosBajaSchema,
  UsuariosCrearInputs,
  UsuariosCrearSchema,
  UsuariosListadoInputs,
  UsuariosListadoSchema,
} from "../squemas/usuarios";
import { UsuarioCreado, UsuarioListado } from "../tipados/usuarios";

/** Costos de bcrypt para hashear y comparar contrasenas. */
const RONDAS_BCRYPT = 10;

/**
 * Lista usuarios activos con paginacion.
 *
 * @async
 * @function listar
 * @param {UsuariosListadoInputs} dataEntrada - Filtros crudos del controlador.
 * @returns {Promise<TipadoData<UsuarioListado[]>>} `LISTADO_OK` o `LISTADO_VACIO`.
 */
const listar = async (
  dataEntrada: UsuariosListadoInputs,
): Promise<TipadoData<UsuarioListado[]>> => {
  const dataValida = UsuariosListadoSchema.parse(dataEntrada);

  const offset = (dataValida.pagina - 1) * dataValida.limite;

  const resultado = await usuariosData.listado(
    {
      limite: dataValida.limite,
      offset,
      busqueda: dataValida.busqueda,
      rol: dataValida.rol,
    },
    dataValida.pagina,
  );

  if (resultado.code === "NO_ACTIVE_USUARIOS") {
    return {
      error: true,
      message: "No hay usuarios que coincidan con el filtro",
      data: [],
      paginacion: {
        pagina: dataValida.pagina,
        limite: dataValida.limite,
        contadorPagina: 0,
        totalRegistros: 0,
      },
      code: "LISTADO_VACIO",
    };
  }

  if (resultado.code === "USUARIOS_LISTED") {
    return {
      error: false,
      message: "Usuarios listados",
      data: resultado.data,
      paginacion: resultado.paginacion,
      code: "LISTADO_OK",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, listar usuarios.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Crea un usuario. Hashea la contrasena antes de tocar la base, y corta si el
 * email ya existe.
 *
 * @async
 * @function crear
 * @param {UsuariosCrearInputs} dataEntrada - Datos crudos del controlador.
 * @returns {Promise<TipadoData<UsuarioCreado>>} `USUARIO_CREADO` o `USUARIO_EXISTENTE`.
 */
const crear = async (
  dataEntrada: UsuariosCrearInputs,
): Promise<TipadoData<UsuarioCreado>> => {
  const dataValida = UsuariosCrearSchema.parse(dataEntrada);

  const existente = await usuariosData.verificacionEmail({
    email: dataValida.email,
  });

  if (existente.code === "USUARIO_EXISTE") {
    return {
      error: true,
      message: "Este usuario ya se encuentra registrado",
      code: "USUARIO_EXISTENTE",
    };
  }

  const passwordHasheada = await bcrypt.hash(dataValida.password, RONDAS_BCRYPT);

  const resultado = await usuariosData.alta({
    nombre: dataValida.nombre,
    apellido: dataValida.apellido,
    email: dataValida.email,
    password: passwordHasheada,
    telefono: dataValida.telefono ?? null,
    rol: dataValida.rol,
  });

  if (resultado.code === "USUARIOS_CREAR") {
    return {
      error: false,
      message: "Usuario creado",
      // El hook solo garantiza `id` cuando metodo === "CREAR", que es este caso.
      data: resultado.data as UsuarioCreado,
      code: "USUARIO_CREADO",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, crear usuario.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Modifica un usuario. Corta si no hay campos, o si el email nuevo ya existe.
 *
 * @async
 * @function modificar
 * @param {UsuariosActualizarInputs} dataEntrada - Datos crudos del controlador.
 * @returns {Promise<TipadoData<unknown>>} `USUARIO_MODIFICADO`, `USUARIO_SIN_CAMBIOS` o `USUARIO_EXISTENTE`.
 */
const modificar = async (
  dataEntrada: UsuariosActualizarInputs,
): Promise<TipadoData<unknown>> => {
  const dataValida = UsuariosActualizarSchema.parse(dataEntrada);

  const { id_usuario, ...campos } = dataValida;
  const tieneCampos = Object.values(campos).some((valor) => valor !== undefined);

  if (!tieneCampos) {
    return {
      error: true,
      message: "No hay campos para modificar",
      code: "USUARIO_SIN_CAMBIOS",
    };
  }

  if (campos.email !== undefined) {
    const existente = await usuariosData.verificacionEmail({
      email: campos.email,
    });

    if (existente.code === "USUARIO_EXISTE" && existente.data?.id_usuario !== id_usuario) {
      return {
        error: true,
        message: "Este usuario ya se encuentra registrado",
        code: "USUARIO_EXISTENTE",
      };
    }
  }

  const resultado = await usuariosData.modificacion({ id_usuario, ...campos });

  if (resultado.code === "USUARIOS_MODIFICAR") {
    return {
      error: false,
      message: "Usuario modificado",
      data: resultado.data,
      code: "USUARIO_MODIFICADO",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, modificar usuario.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Da de baja logica a un usuario (`estado = 0`). No borra la fila.
 *
 * @async
 * @function baja
 * @param {UsuariosBajaInputs} dataEntrada - Solo `id_usuario`.
 * @returns {Promise<TipadoData<{ id_usuario: number }>>} `USUARIO_DADO_DE_BAJA`.
 */
const baja = async (
  dataEntrada: UsuariosBajaInputs,
): Promise<TipadoData<{ id_usuario: number }>> => {
  const dataValida = UsuariosBajaSchema.parse(dataEntrada);

  // Verifica que el usuario este activo antes de darle de baja.
  // El hook invierte la senalizacion: con el filtro `estado = 1`,
  // `USUARIO_NO_EXISTE` significa que NO hay fila activa (ya fue dada
  // de baja o no existe), y `USUARIO_EXISTE` que esta activo.
  const verificacion = await usuariosData.verificacionBaja({
    id_usuario: dataValida.id_usuario,
  });

  if (verificacion.code === "USUARIO_NO_EXISTE") {
    return {
      error: true,
      message: "El usuario ya se encuentra dado de baja",
      code: "USUARIO_YA_DADO_DE_BAJA",
    };
  }

  const resultado = await usuariosData.baja({
    id_usuario: dataValida.id_usuario,
  });

  if (resultado.code === "USUARIOS_MODIFICAR") {
    return {
      error: false,
      message: "Usuario dado de baja",
      data: resultado.data,
      code: "USUARIO_DADO_DE_BAJA",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, dar de baja usuario.",
    code: "ERROR_SERVIDOR",
  };
};

export const method = {
  listar: tryCatchDatos(listar, "usuario"),
  crear: tryCatchDatos(crear, "usuario"),
  modificar: tryCatchDatos(modificar, "usuario"),
  baja: tryCatchDatos(baja, "usuario"),
};
