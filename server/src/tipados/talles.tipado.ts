import { 
    TalleCrearInputs, TalleActualizarInputs, ActivoInput,
    EstadoInput, ReordenarTallesInput
 } from "../squemas/talles";

export interface MaxOrdenResult {
  max_orden: number | null;
}

export interface VerificarTalleResult {
    id_talle : number,
    nombre : string,
    activo : number
};

export interface PostTalleResult {
    nombre : string,
    orden : number,
}

export interface ModNombreTalleResult {
    nombre : string,
    id_talle : number
}

export interface EstadoTalleResult {
    activo : number,
    id_talle : number,
}

export interface TalleResult {
  id_talle: number;
  nombre: string;
  orden: number | null; // Es null si no tiene posición asignada
  activo: number;       // 1 o 0 (TINYINT de MySQL)
  creado_en?: Date | string;
  actualizado_en?: Date | string;
}

export interface ModOrdenTallesResult {
  actualizados: number;
}

export type { 
    TalleCrearInputs, TalleActualizarInputs, ActivoInput, 
    EstadoInput, ReordenarTallesInput
 };