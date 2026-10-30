export function calcularFechaFinSuscripcion(
  fechaInicio: Date,
  duracionDias: number
): Date {
  const fechaFin = new Date(fechaInicio);
  fechaFin.setDate(fechaFin.getDate() + duracionDias);
  return fechaFin;
}

export function estaSuscripcionActiva(fechaFin: Date): boolean {
  return new Date() <= fechaFin;
}

export function diasRestantesSuscripcion(fechaFin: Date): number {
  const diff = fechaFin.getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
