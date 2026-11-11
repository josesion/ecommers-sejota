import { Request, Response } from "express";
import { method as servicioTalles} from "../servicios/talle.servicio";

import { handleControladores } from "../utils/handleControladores";
import { tryCatch } from "../utils/tryCatch";

import { 
    TalleCrearInputs, PostTalleResult,
    TalleActualizarInputs, ModNombreTalleResult,
     ActivoInput, EstadoTalleResult,EstadoInput,
     ReordenarTallesInput
 } from "../tipados/talles.tipado";
import { MAPA_ALTA_TALLES, MAPA_MOD_NOMBRE_TALLES, 
         MAPA_MOD_ESTADO_TALLES, MAPA_LISTADO_TALLES,
         MAPA_MOD_ORDEN_TALLES
 } from "../respuestas/talles";


const altaTalles = async(req: Request, res: Response) =>{
    const data : TalleCrearInputs ={
        nombre : req.body.nombre,
        orden  : 0
    };

    await  handleControladores<TalleCrearInputs, PostTalleResult>(
        res,
        data,
        servicioTalles.altaTalles,
        MAPA_ALTA_TALLES
    );
};

const modTallesNombre = async (req: Request, res: Response) =>{
    const data : TalleActualizarInputs ={
        id_talle : Number(req.body.id_talle),
        nombre : req.body.nombre,
        orden  : 0
    };

    await handleControladores<TalleActualizarInputs, ModNombreTalleResult>(
        res,
        data,
        servicioTalles.modTallesNombre,
        MAPA_MOD_NOMBRE_TALLES
    );    
};


const estadoTalle = async(req: Request, res: Response ) =>{
    const data :  ActivoInput = { activo : Number(req.params.estado), id_talle : Number(req.params.id) };

    await handleControladores< ActivoInput, EstadoTalleResult >(
        res,
        data,
        servicioTalles.estadoTalles,
        MAPA_MOD_ESTADO_TALLES
    );
};

const listaTalles = async(req: Request, res: Response) =>{
    const data : EstadoInput = { activo : Number(req.params.estado) };
    
    await handleControladores< EstadoInput, EstadoTalleResult[] >(
        res,
        data,
        servicioTalles.listaTalles,
        MAPA_LISTADO_TALLES
    );
}

const modOrdenTalles = async (req: Request, res: Response) =>{
        
      const data : ReordenarTallesInput = req.body ;
      await  handleControladores< ReordenarTallesInput, { actualizados : number } >(
        res,
        data,
        servicioTalles.modOrdenTalles,
        MAPA_MOD_ORDEN_TALLES
      );
}

export const method = {
    altaTalles : tryCatch( altaTalles),
    modTallesNombre : tryCatch( modTallesNombre),
    estadoTalle : tryCatch( estadoTalle ),
    listaTalles : tryCatch( listaTalles ),
    modOrdenTalles : tryCatch( modOrdenTalles )
};