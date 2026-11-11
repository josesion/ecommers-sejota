import {
  ColorCrearInputs,
  ColorActualizarInputs,
  ColorActivoInput,
  ColorEstadoInput,
} from "../squemas/colores";

export interface VerificarColorResult {
  id_color: number;
  nombre: string;
  codigo_hex: string | null;
  activo: number;
}

export interface PostColorResult {
  id_color?: number;
  nombre: string;
  codigo_hex: string | null;
  activo: number;
  creado_en?: Date | string;
  actualizado_en?: Date | string;
}

export interface ModColorResult {
  id_color: number;
  nombre?: string;
  codigo_hex?: string | null;
}

export interface EstadoColorResult {
  id_color: number;
  activo: number;
}

export interface ColorResult {
  id_color: number;
  nombre: string;
  codigo_hex: string | null;
  activo: number;
  creado_en?: Date | string;
  actualizado_en?: Date | string;
}

export type { ColorCrearInputs, ColorActualizarInputs, ColorActivoInput, ColorEstadoInput };
