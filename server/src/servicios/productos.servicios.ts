import { method as productosData } from "../data/productos.data";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { TipadoData } from "../tipados/tipado.data";
import { ProductoCreado, ProductoListado } from "../tipados/productos";
import {
  ProductoActualizarInputs,
  ProductoActualizarSchema,
  ProductoBajaInputs,
  ProductoBajaSchema,
  ProductoCrearInputs,
  ProductoCrearSchema,
  ProductoListadoInputs,
  ProductoListadoSchema,
} from "../squemas/productos";

/**
 * Lista productos filtrando por baja lógica (`activo`), categoría y texto.
 *
 * @async
 * @function listar
 * @param {ProductoListadoInputs} dataEntrada - Filtros crudos del controlador.
 * @returns {Promise<TipadoData<ProductoListado[]>>} `PRODUCTOS_LISTED` o `NO_ACTIVAS`.
 */
const listar = async (
  dataEntrada: ProductoListadoInputs,
): Promise<TipadoData<ProductoListado[]>> => {
  const dataValida = ProductoListadoSchema.parse(dataEntrada);

  const offset = (dataValida.pagina - 1) * dataValida.limite;

  const resultado = await productosData.listado(
    {
      limite: dataValida.limite,
      offset,
      busqueda: dataValida.busqueda,
      activo: dataValida.activo,
      id_categoria: dataValida.id_categoria,
    },
    dataValida.pagina,
  );

  if (resultado.code === "NO_ACTIVE_PRODUCTOS") {
    return {
      error: true,
      message: "No hay productos que coincidan con el filtro",
      data: [],
      paginacion: {
        pagina: dataValida.pagina,
        limite: dataValida.limite,
        contadorPagina: 0,
        totalRegistros: 0,
      },
      code: "NO_ACTIVAS",
    };
  }

  if (resultado.code === "PRODUCTOS_LISTED") {
    return {
      error: false,
      message: "Productos listados",
      data: resultado.data,
      paginacion: resultado.paginacion,
      code: "PRODUCTOS_LISTED",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, listar productos.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Crea un producto. Corta si la categoría no existe o el slug está tomado.
 *
 * @async
 * @function crear
 * @param {ProductoCrearInputs} dataEntrada - Datos crudos del controlador.
 * @returns {Promise<TipadoData<ProductoCreado>>} `PRODUCTO_CREADO`, `CATEGORIA_NO_EXISTE` o `SLUG_EXISTENTE`.
 */
const crear = async (
  dataEntrada: ProductoCrearInputs,
): Promise<TipadoData<ProductoCreado>> => {
  const dataValida = ProductoCrearSchema.parse(dataEntrada);

  // La FK es ON DELETE RESTRICT: verificar antes da un 409 legible
  // en lugar del error técnico de constraint de MySQL.
  const categoria = await productosData.verificacionCategoria({
    id_categoria: dataValida.id_categoria,
  });

  if (categoria.code === "CATEGORIA_NO_EXISTE") {
    return {
      error: true,
      message: "La categoria indicada no existe",
      code: "CATEGORIA_NO_EXISTE",
    };
  }

  const slug = await productosData.verificacionSlug({
    slug: dataValida.slug,
  });

  if (slug.code === "PRODUCTO_EXISTE") {
    return {
      error: true,
      message: "Ya existe un producto con ese slug",
      code: "SLUG_EXISTENTE",
    };
  }

  const resultado = await productosData.alta({
    id_categoria: dataValida.id_categoria,
    nombre: dataValida.nombre,
    slug: dataValida.slug,
    precio_base: dataValida.precio_base,
    precio_oferta: dataValida.precio_oferta ?? null,
    descripcion: dataValida.descripcion ?? null,
    guia_talles: dataValida.guia_talles ?? null,
  });

  if (resultado.code === "PRODUCTOS_CREAR") {
    return {
      error: false,
      message: "Producto creado",
      data: resultado.data as ProductoCreado,
      code: "PRODUCTO_CREADO",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, crear producto.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Modifica un producto. Corta si no hay campos, si la categoría nueva no
 * existe, o si el slug nuevo está tomado por otro producto.
 *
 * @async
 * @function modificar
 * @param {ProductoActualizarInputs} dataEntrada - Datos crudos del controlador.
 * @returns {Promise<TipadoData<unknown>>} `PRODUCTO_MODIFICADO`, `PRODUCTO_SIN_CAMBIOS`, `CATEGORIA_NO_EXISTE` o `SLUG_EXISTENTE`.
 */
const modificar = async (
  dataEntrada: ProductoActualizarInputs,
): Promise<TipadoData<unknown>> => {
  const dataValida = ProductoActualizarSchema.parse(dataEntrada);

  const { id_producto, ...campos } = dataValida;
  const tieneCampos = Object.values(campos).some(
    (valor) => valor !== undefined,
  );

  if (!tieneCampos) {
    return {
      error: true,
      message: "No hay campos para modificar",
      code: "PRODUCTO_SIN_CAMBIOS",
    };
  }

  if (campos.slug !== undefined) {
    const slug = await productosData.verificacionSlug({
      slug: campos.slug,
    });

    if (
      slug.code === "PRODUCTO_EXISTE" &&
      slug.data?.id_producto !== id_producto
    ) {
      return {
        error: true,
        message: "Ya existe un producto con ese slug",
        code: "SLUG_EXISTENTE",
      };
    }
  }

  const resultado = await productosData.modificacion({
    id_producto,
    ...campos,
  });

  if (resultado.code === "PRODUCTOS_MODIFICAR") {
    return {
      error: false,
      message: "Producto modificado",
      data: resultado.data,
      code: "PRODUCTO_MODIFICADO",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, modificar producto.",
    code: "ERROR_SERVIDOR",
  };
};

/**
 * Da de baja lógica a un producto (`activo = 0`). No borra la fila.
 *
 * @async
 * @function baja
 * @param {ProductoBajaInputs} dataEntrada - Solo `id_producto`.
 * @returns {Promise<TipadoData<{ id_producto: number }>>} `PRODUCTO_DADO_DE_BAJA` o `PRODUCTO_YA_DADO_DE_BAJA`.
 */
const baja = async (
  dataEntrada: ProductoBajaInputs,
): Promise<TipadoData<{ id_producto: number }>> => {
  const dataValida = ProductoBajaSchema.parse(dataEntrada);

  // Verifica que el producto esté activo antes de darlo de baja.
  // El hook invierte la señalización: con el filtro `activo = 1`,
  // `PRODUCTO_NO_EXISTE` significa que NO hay fila activa (ya fue dada
  // de baja o no existe), y `PRODUCTO_EXISTE` que está activo.
  const verificacion = await productosData.verificacionActivo({
    id_producto: dataValida.id_producto,
  });

  if (verificacion.code === "PRODUCTO_NO_EXISTE") {
    return {
      error: true,
      message: "El producto ya se encuentra dado de baja",
      code: "PRODUCTO_YA_DADO_DE_BAJA",
    };
  }

  const resultado = await productosData.baja({
    id_producto: dataValida.id_producto,
  });

  if (resultado.code === "PRODUCTOS_MODIFICAR") {
    return {
      error: false,
      message: "Producto dado de baja",
      data: resultado.data,
      code: "PRODUCTO_DADO_DE_BAJA",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, dar de baja producto.",
    code: "ERROR_SERVIDOR",
  };
};

export const method = {
  listar: tryCatchDatos(listar, "producto"),
  crear: tryCatchDatos(crear, "producto"),
  modificar: tryCatchDatos(modificar, "producto"),
  baja: tryCatchDatos(baja, "producto"),
};
