// TipadoData se usa para el contrato que devuelven las funciones de la data para los controladores
export type TipadoData<T> = {
  error: boolean;
  message: string;
  data?: T;
  paginacion?: {
    pagina: number;
    limite: number;
    contadorPagina: number;
    /** Total de filas que matchean el filtro, antes de paginar. */
    totalRegistros?: number;
  };
  code: string;
  errorsDetails?: any;
};
