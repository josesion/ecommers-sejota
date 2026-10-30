import type { CSSProperties } from "react";
import "./cargando.css";

type Variante = "texto" | "tarjeta" | "lista" | "fila";

interface EsqueletoProps {
  /** Número = px; string = cualquier unidad CSS ("60%"). */
  ancho?: string | number;
  alto?: string | number;
  /** Forma circular (avatar). Usa `alto` para ambos lados. */
  circulo?: boolean;
}

/** Pieza suelta para armar la forma de cualquier contenido. */
export const Esqueleto = ({
  ancho = "100%",
  alto = 14,
  circulo = false,
}: EsqueletoProps) => (
  <span
    className="esqueleto"
    data-circulo={circulo || undefined}
    style={{ width: circulo ? alto : ancho, height: alto }}
    aria-hidden="true"
  />
);

interface ComponenteCargandoProps {
  variante?: Variante;
  /** Cantidad de líneas (variantes "texto" y "tarjeta"). */
  lineas?: number;
  /** Cantidad de filas (variantes "lista" y "fila"). */
  items?: number;
  /** Texto que anuncia el lector de pantalla. No se ve en pantalla. */
  texto?: string;
}

// La última línea es más corta, como en un párrafo real.
const anchoLinea = (i: number, total: number) =>
  i === total - 1 && total > 1 ? "60%" : i % 2 ? "92%" : "100%";

const indice = (i: number) => ({ "--i": i }) as CSSProperties;

export const ComponenteCargando = ({
  variante = "texto",
  lineas = 3,
  items = 3,
  texto = "Cargando",
}: ComponenteCargandoProps) => {
  const filas = Array.from({ length: items }, (_, i) => i);
  const renglones = Array.from({ length: lineas }, (_, i) => i);

  return (
    <div
      className="cargando"
      data-variante={variante}
      role="status"
      aria-live="polite"
    >
      <span className="solo_lector">{texto}...</span>

      {variante === "texto" &&
        renglones.map((i) => (
          <div key={i} style={indice(i)}>
            <Esqueleto ancho={anchoLinea(i, lineas)} />
          </div>
        ))}

      {variante === "tarjeta" && (
        <div className="cargando_tarjeta" aria-hidden="true">
          <Esqueleto alto={140} />
          <div style={indice(1)}>
            <Esqueleto ancho="55%" alto={18} />
          </div>
          {renglones.map((i) => (
            <div key={i} style={indice(i + 2)}>
              <Esqueleto ancho={anchoLinea(i, lineas)} />
            </div>
          ))}
        </div>
      )}

      {variante === "lista" &&
        filas.map((i) => (
          <div
            key={i}
            className="cargando_lista_item"
            style={indice(i)}
            aria-hidden="true"
          >
            <Esqueleto circulo alto={40} />
            <div className="cargando_columna">
              <Esqueleto ancho="45%" alto={14} />
              <Esqueleto ancho="75%" alto={12} />
            </div>
          </div>
        ))}

      {variante === "fila" &&
        filas.map((i) => (
          <div
            key={i}
            className="cargando_fila"
            style={indice(i)}
            aria-hidden="true"
          >
            <Esqueleto ancho="35%" alto={16} />
            <Esqueleto ancho={72} alto={22} />
            <span className="cargando_relleno" />
            <Esqueleto ancho={84} alto={34} />
            <Esqueleto ancho={84} alto={34} />
          </div>
        ))}
    </div>
  );
};
