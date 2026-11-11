import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataColores } from "../data/colores.data";
import { TipadoData } from "../tipados/tipado.data";
import {
  PostColorResult,
  ModColorResult,
  EstadoColorResult,
  ColorResult,
  ColorCrearInputs,
  ColorActualizarInputs,
  ColorActivoInput,
  ColorEstadoInput,
} from "../tipados/colores.tipado";
import {
  ColorCrearSchema,
  ColorActualizarSchema,
  ColorActivoSchema,
  ColorEstadoSchema,
} from "../squemas/colores";

/**
 * Da de alta un color verificando duplicado por nombre.
 * @param data Datos de creación del color.
 * @returns Resultado del alta.
 */
const altaColores = async (
  data: ColorCrearInputs,
): Promise<TipadoData<PostColorResult>> => {
  const validar: ColorCrearInputs = ColorCrearSchema.parse(data);
  const nombreFormateado = validar.nombre.trim().toUpperCase();
  const codigoHex = validar.codigo_hex ?? null;

  const existe = await dataColores.verificarExistenciaColor(nombreFormateado);
  if (existe.code === "COLOR_EXISTE" || existe.code === "COLORES_EXISTE") {
    return {
      error: true,
      message: `El color: ${nombreFormateado} ya existe en el sistema.`,
      code: "COLOR_YA_EXISTE",
    };
  }

  if (existe.code === "COLOR_NO_EXISTE" ) {
    const alta = await dataColores.postColor({
      nombre: nombreFormateado,
      codigo_hex: codigoHex,
    });

    if (alta.code === "COLORES_CREAR" ) {
      return {
        error: false,
        message: `Se creó correctamente el color: ${nombreFormateado}.`,
        data: alta.data,
        code: "ALTA_COLOR_OK",
      };
    }
    if (alta.code === "COLORES_YA_EXISTE" ) {
      return {
        error: true,
        message: `El color: ${nombreFormateado} ya existe en el sistema.`,
        code: "COLOR_YA_EXISTE",
      };
    }
  }

  return {
    error: true,
    message: "Error en el servidor, Alta de colores.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Modifica nombre y/o codigo_hex de un color.
 * @param data Datos de modificación.
 * @returns Resultado de la modificación.
 */
const modColores = async (
  data: ColorActualizarInputs,
): Promise<TipadoData<ModColorResult>> => {
  const validar: ColorActualizarInputs = ColorActualizarSchema.parse(data);
  const idColor = validar.id_color;

  const payload: { id_color: number; nombre?: string; codigo_hex?: string | null } = {
    id_color: idColor,
  };

  if (validar.nombre !== undefined) {
    const nombreFormateado = validar.nombre.trim().toUpperCase();
    const existe = await dataColores.verificarExistenciaColor(nombreFormateado);
    if (
      (existe.code === "COLOR_EXISTE" || existe.code === "COLORES_EXISTE") &&
      existe.data?.id_color !== idColor
    ) {
      return {
        error: true,
        message: `El color: ${nombreFormateado} ya existe en el sistema.`,
        code: "COLOR_YA_EXISTE",
      };
    }
    payload.nombre = nombreFormateado;
  }

  if (validar.codigo_hex !== undefined) {
    payload.codigo_hex = validar.codigo_hex ?? null;
  }

  if (payload.nombre === undefined && payload.codigo_hex === undefined) {
    return {
      error: true,
      message: "No hay campos para modificar.",
      code: "COLOR_SIN_CAMBIOS",
    };
  }

  const mod = await dataColores.modColor(payload);
  if (mod.code === "COLORES_MODIFICAR" || mod.code === "COLOR_MODIFICAR") {
    return {
      error: false,
      message: "El color se modificó correctamente.",
      data: mod.data,
      code: "MOD_COLOR_OK",
    };
  }
  if (mod.code === "COLORES_YA_EXISTE" || mod.code === "COLOR_YA_EXISTE") {
    return {
      error: true,
      message: "El color ya existe en el sistema.",
      code: "COLOR_YA_EXISTE",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, Mod de colores.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Cambia el estado activo/inactivo de un color.
 * @param data Identificador y estado.
 * @returns Resultado del cambio de estado.
 */
const estadoColor = async (
  data: ColorActivoInput,
): Promise<TipadoData<EstadoColorResult>> => {
  const validar: ColorActivoInput = ColorActivoSchema.parse(data);
  const mensaje =
    validar.activo === 0 ? "El color se dio de baja." : "El color se dio de alta.";

  const cambio = await dataColores.estadoColor(validar);
  if (cambio.code === "COLORES_MODIFICAR" || cambio.code === "COLOR_MODIFICAR") {
    return {
      error: false,
      message: mensaje,
      data: cambio.data,
      code: "ESTADO_COLOR_CAMBIADO",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, Mod de estado de colores.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Lista colores filtrados por estado activo.
 * @param data Filtro de estado.
 * @returns Listado de colores o vacío.
 */
const listaColores = async (
  data: ColorEstadoInput,
): Promise<TipadoData<ColorResult[]>> => {
  const validar: ColorEstadoInput = ColorEstadoSchema.parse(data);
  const lista = await dataColores.listaColores(validar.activo);

  if (lista.code === "COLORES_LISTED" || lista.code === "COLOR_LISTED") {
    return {
      error: false,
      message: validar.activo === 1 ? "Lista de colores activos." : "Lista de colores inactivos.",
      data: lista.data,
      code: "LISTA_COLORES_OK",
    };
  }

  if (lista.code === "NO_ACTIVE_COLORES" || lista.code === "NO_ACTIVE_COLOR") {
    return {
      error: true,
      message: validar.activo === 1 ? "Sin lista de colores activos." : "Sin lista de colores inactivos.",
      data: [],
      code: "SIN_LISTA_COLORES",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, Lista de colores.",
    code: "ERROR_SERVIDOR",
  };
};

export const method = {
  altaColores: tryCatchDatos(altaColores, "color"),
  modColores: tryCatchDatos(modColores, "color"),
  estadoColor: tryCatchDatos(estadoColor, "color"),
  listaColores: tryCatchDatos(listaColores, "color"),
};
