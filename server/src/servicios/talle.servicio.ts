import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataTalles} from "../data/talles.data";

import { TipadoData } from "../tipados/tipado.data";
import { 
    TalleCrearInputs, PostTalleResult,
    TalleActualizarInputs, ModNombreTalleResult,
    ActivoInput, EstadoTalleResult, 
    EstadoInput, TalleResult,
    ReordenarTallesInput
 } from "../tipados/talles.tipado";

import { 
    TalleCrearSchema, TalleActualizarSchema, activoSchema, 
    talleActivoUpdateSchema, reordenarTallesSchema 
} from "../squemas/talles";


const altaTalles = async ( data : TalleCrearInputs  )
:Promise<TipadoData<PostTalleResult>> =>{
    const validarTalles : TalleCrearInputs = TalleCrearSchema.parse(data);
    const nombreFormateado = validarTalles.nombre.trim().toUpperCase();
    const talleExiste = await dataTalles.verificarExistenciaTalles( validarTalles.nombre);
     
    if ( talleExiste.code === 'TALLE_NO_EXISTE'){
        // Traemos el máximo orden actual (ej: si devuelve 3, o 0 si no hay ninguno)
        const ordenRespuesta = await dataTalles.contadorOrden();
        // Extraemos max_orden de forma segura (si es null o undefined, usa 0)
        const maxOrdenActual = ordenRespuesta.data?.[0]?.max_orden ?? 0;
        // El nuevo talle se guarda con maxOrdenActual + 1
        const nuevoOrden = maxOrdenActual + 1;
        // Insertamos en la BD (¡importante el await acá!)
    
        const resultadoAlta = await dataTalles.postTalle({
            nombre: nombreFormateado,
            orden: nuevoOrden
        });

        if ( resultadoAlta.code === 'TALLES_CREAR'){
            return {
                error : false,
                message : `Se creo correctamente el talle : ${nombreFormateado}.`,
                data : resultadoAlta.data,
                code : "ALTA_TALLE_OK"
            };
        };
    };

    if ( talleExiste.code === 'TALLE_EXISTE'){
        return {
            error: true,
            message: `El talle : ${nombreFormateado} ya se encuentra en el sistema.`,
            code: "TALLE_YA_EXISTE",
        };        
    };    

  return {
    error: true,
    message: "Error en el servidor, Alta de talles.",
    code: "ERROR_SERVIDOR",
  };    

};

const modTallesNombre = async ( data : TalleActualizarInputs)
:Promise<TipadoData<ModNombreTalleResult>> =>{
    const validarTalleData : TalleActualizarInputs = TalleActualizarSchema.parse(data);
    const talleTrandformado = validarTalleData.nombre.trim().toUpperCase();
    
    const existeOtroTalleConNombre =await dataTalles.verificarExistenciaTalles(talleTrandformado);

    if ( existeOtroTalleConNombre.code ===  'TALLE_EXISTE'){
        return {
            error : true,
            message : `El talle : ${talleTrandformado} ya existe en el sistema.`,
            code : "TALLE_YA_EXISTE"
        }
    };

    if ( existeOtroTalleConNombre.code ===  'TALLE_NO_EXISTE'){
        const modNombreTalleResult = await dataTalles.modNombreTalle({
            id_talle : validarTalleData.id_talle,
            nombre : talleTrandformado,
            orden : validarTalleData.orden
        });

        if ( modNombreTalleResult.code === 'TALLES_MODIFICAR'){
            return {
                error : false,
                message : `El talle se modifico a : ${talleTrandformado}.`,
                data : modNombreTalleResult.data,
                code : "MOD_TALLE_OK"
            }
        }
    };    

  return {
    error: true,
    message: "Error en el servidor, Mod de talles.",
    code: "ERROR_SERVIDOR",
  };    
};

// agregar q cuando se vayua a baja el estado el orden sea null
const estadoTalles = async( estado : ActivoInput)
:Promise<TipadoData<EstadoTalleResult>> =>{
    const verificarEstado :ActivoInput = activoSchema.parse(estado);
    // si viene 1 es alta si viene 0 es baja
    const mensaje = verificarEstado.activo 
          ? "El talle se dio de alta" 
          : "El talle se dio de baja"  
   
    const cambioEstado = await dataTalles.estadoTalles(verificarEstado);

    if ( cambioEstado.code === 'TALLES_MODIFICAR' ){
        return{
            error : false,
            message : mensaje,
            data : cambioEstado.data,
            code : "ESTADO_CAMBIADO"
        }    
    };

    return {
        error: true,
        message: "Error en el servidor, Mod de talles.",
        code: "ERROR_SERVIDOR",
    };  
};


const listaTalles = async( estado : EstadoInput )
:Promise<TipadoData<TalleResult[]>> =>{
    const verificarEstado : EstadoInput = talleActivoUpdateSchema.parse(estado);
    const listaTalles = await dataTalles.listaTalles(verificarEstado.activo);
    
    if ( listaTalles.code === 'TALLES_LISTED' ){
        const mensaje = verificarEstado.activo 
                  ? "Lista de talles activos"
                  : "Lista de talles inactivos";

        return {
            error : false,
            message : mensaje,
            data : listaTalles.data,
            code : "LISTA_TALLES_OK"
        };       
    };

    if ( listaTalles.code === 'NO_ACTIVE_TALLES' ){
        const mensaje = verificarEstado.activo 
                  ? "Sin lista de talles activos"
                  : "Sin lista de talles inactivos";        
        return {
            error: true,
            message: mensaje,
            code: "SIN_LISTA_TALLES",
        }; 
    };

    return {
        error: true,
        message: "Error en el servidor, Lista de talles.",
        code: "ERROR_SERVIDOR",
    }; 
};

const modOrdenTalles = async( tallesOrden : ReordenarTallesInput ) =>{
    const verificarOrden  : ReordenarTallesInput = reordenarTallesSchema.parse(tallesOrden);
    const resultadoOrdenNuevo = await dataTalles.modOrdenTalles(verificarOrden);

    if ( resultadoOrdenNuevo.code === 'ORDEN_TALLES_MODIFICADO') {
     return {
        error: false,
        message: "El orden de los talles se modificó correctamente.",
        data : resultadoOrdenNuevo.data,
        code: "ORDEN_TALLES_MODIFICADO"
    }; 
    };
    
    if ( resultadoOrdenNuevo.code === "ERROR_TRANSACCION" ) {
        return {
            error: true,
            message: "Error en la transacción.",
            code: "ERROR_TRANSACCION",
        };        
    }; 

    return {
        error: true,
        message: "Error en el servidor, Lista de talles.",
        code: "ERROR_SERVIDOR",
    }; 
};

export const method = {
    altaTalles : tryCatchDatos(altaTalles),
    modTallesNombre : tryCatchDatos( modTallesNombre),
    estadoTalles : tryCatchDatos( estadoTalles),
    listaTalles : tryCatchDatos( listaTalles),
    modOrdenTalles : tryCatchDatos( modOrdenTalles),
};