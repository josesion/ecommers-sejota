import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidad } from "../hooks/funcionListar";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidadTransaction } from "../hooks/iudEntidadTRansaccion";

import { TipadoData } from "../tipados/tipado.data";
import { 
    MaxOrdenResult, VerificarTalleResult,
    TalleCrearInputs,TalleActualizarInputs,
    ModNombreTalleResult, ActivoInput, EstadoTalleResult,
    TalleResult, ReordenarTallesInput,  ModOrdenTallesResult
 } from "../tipados/talles.tipado";

const contadorOrdenActivos = async()
:Promise<TipadoData<MaxOrdenResult[]>> =>{
    const sql : string = `SELECT MAX(orden) as max_orden FROM talles WHERE activo = 1;`;
    return listarEntidadSinPaginacion({
        slqListado : sql,
        entidad  : "orden_talles",
        estado  : "activo",
        valores : []
    });
};

const verificarExistenciaTalles = async( nombreTalle : string )
:Promise<TipadoData<VerificarTalleResult>> =>{
    const sql : string = `SELECT id_talle, nombre, activo FROM talles WHERE nombre = ? LIMIT 1;` 
    return buscarExistenteEntidad({
        slqEntidad : sql,
        valores : [ nombreTalle],
        entidad : "talle"
    });
};

const postTalle = async ( talles : TalleCrearInputs)
:Promise<TipadoData<TalleCrearInputs>> =>{
    const { nombre, orden} = talles;
    const sql : string = `INSERT INTO talles (nombre, orden, activo) VALUES (?, ?, 1)`;
    return iudEntidad({
        slqEntidad : sql,
        datosRetorno : { nombre, orden},
        entidad : "talles",
        metodo : "CREAR",
        valores : [ nombre, orden ]
    });
};



const modNombreTalle = async (data : TalleActualizarInputs) 
:Promise<TipadoData<ModNombreTalleResult>>=>{
    const {nombre, id_talle} = data;
    const sql : string = 'UPDATE talles SET nombre = ? WHERE id_talle = ?';
    return iudEntidad({
        slqEntidad : sql,
        datosRetorno : { nombre, id_talle},
        entidad : "talles",
        metodo : "MODIFICAR",
        valores : [ nombre, id_talle]
    });
};

const estadoTalles = async( data : ActivoInput  )
:Promise<TipadoData<EstadoTalleResult >> =>{
    const {  activo, id_talle} = data;
    const sql : string = 'UPDATE talles SET activo = ?  WHERE id_talle = ?'; 
    return iudEntidad({
        slqEntidad : sql,
        datosRetorno : { activo, id_talle},
        entidad : "talles",
        metodo : "MODIFICAR",
        valores : [ activo, id_talle]
    });    
};

//El listado sera sin paginado por la razon q no existen muchos talles y estro no traeria problema
// de rendimieto, ademas de q se necesita para el front para poder mostrarlo en un select
const listaTalles  = async( estado : number )
:Promise<TipadoData<TalleResult[]>>=>{
    const sql : string =  `SELECT 
                                id_talle,
                                nombre,
                                orden,
                                activo,
                                creado_en,
                                actualizado_en
                            FROM talles
                            WHERE activo = ?
                            ORDER BY ISNULL(orden), orden ASC;`; 
    return listarEntidadSinPaginacion({
        slqListado : sql,
        entidad : "talles",
        estado : "activo",
        valores : [ estado]
    });
};

export const modOrdenTalles = async (
  info: ReordenarTallesInput
): Promise<TipadoData<ModOrdenTallesResult>> => {

  const resultadoOrdenNuevo = await iudEntidadTransaction(async (conn) => {
    for (const item of info) {
      await conn.execute(
        `UPDATE talles SET orden = ? WHERE id_talle = ? AND activo = 1`,
        [item.orden, item.id_talle]
      );
    }
    return { actualizados: info.length };
  });


  if (resultadoOrdenNuevo.code === "TRANSACCION_OK") {
    return {
      error: false,
      message: "El orden de los talles se modificó correctamente.",
      data: resultadoOrdenNuevo.data,
      code: "ORDEN_TALLES_MODIFICADO",
    };
  }

  if (resultadoOrdenNuevo.code === "TRANSACCION_FALLIDA") {
    return {
      error: true,
      message: "Error en la transacción al modificar el orden de los talles.",
      code: "ERROR_TRANSACCION",
    };
  }

  return {
    error: true,
    message: "Error en el servidor, Modificar orden de talles.",
    code: "ERROR_SERVIDOR",
  };
};

export const method = {
    verificarExistenciaTalles : tryCatchDatos( verificarExistenciaTalles, "m"),
    postTalle : tryCatchDatos( postTalle, "m"),
    contadorOrden : tryCatchDatos( contadorOrdenActivos, "f"),
    modNombreTalle : tryCatchDatos( modNombreTalle),
    estadoTalles : tryCatchDatos( estadoTalles),
    listaTalles : tryCatchDatos( listaTalles),
    modOrdenTalles : tryCatchDatos( modOrdenTalles),
};