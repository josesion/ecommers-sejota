/**
 * Fila de `productos` tal como vuelve del listado.
 * `precio_base` y `precio_oferta` son `DECIMAL(10,2)`: mysql2 los devuelve
 * como string por defecto, así que se declaran `string | null` y el
 * frontend debe tratarlos como número.
 * `activo` es TINYINT en MySQL, el driver lo devuelve como number.
 */
export interface ProductoListado {
  id_producto: number;
  id_categoria: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  guia_talles: string | null;
  precio_base: string;
  precio_oferta: string | null;
  activo: number;
  creado_en: Date;
  actualizado_en: Date;
}

/**
 * Resultado de un alta. `id` lo inyecta el hook `iudEntidad` desde el
 * `insertId` cuando `metodo === "CREAR"`.
 */
export interface ProductoCreado {
  id: number;
  nombre: string;
  slug: string;
  id_categoria: number;
}

/**
 * Fila mínima que devuelve `buscarExistenteEntidad` al detectar un slug
 * duplicado o al validar la FK de `categorias`.
 */
export interface ProductoExistente {
  id_producto?: number;
  id_categoria?: number;
  slug?: string;
}

/**
 * Payload que la capa data recibe para insertar. Los precios entran como
 * `number`; mysql2 los convierte a `DECIMAL(10,2)` en el INSERT.
 */
export interface ProductoAltaPayload {
  id_categoria: number;
  nombre: string;
  slug: string;
  precio_base: number;
  precio_oferta?: number | null;
  descripcion?: string | null;
  guia_talles?: string | null;
}

/**
 * Payload que la capa data recibe para modificar.
 */
export interface ProductoActualizacionPayload {
  id_producto: number;
  nombre?: string;
  slug?: string;
  precio_base?: number;
  precio_oferta?: number | null;
  descripcion?: string | null;
  guia_talles?: string | null;
  activo?: number;
}
