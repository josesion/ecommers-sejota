/**
 * Fila de `categorias` tal como vuelve del listado.
 * `activo` es TINYINT en MySQL, el driver lo devuelve como number.
 */
export interface CategoriaListado {
  id_categoria: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  activo: number;
  creado_en: Date;
  actualizado_en: Date;
}

/**
 * Resultado de un alta. `id` lo inyecta el hook `iudEntidad` desde el
 * `insertId` cuando `metodo === "CREAR"`.
 */
export interface CategoriaCreada {
  id: number;
  nombre: string;
  slug: string;
}

/**
 * Fila minima que devuelve `buscarExistenteEntidad` al detectar un slug duplicado.
 */
export interface CategoriaExistente {
  id_categoria: number;
  slug: string;
}

/**
 * Payload que la capa data recibe para insertar.
 */
export interface CategoriaAltaPayload {
  nombre: string;
  slug: string;
  descripcion?: string | null;
}

/**
 * Payload que la capa data recibe para modificar.
 */
export interface CategoriaActualizacionPayload {
  id_categoria: number;
  nombre?: string;
  slug?: string;
  descripcion?: string | null;
  activo?: number;
}
