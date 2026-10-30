import "./error.css";

type CompoErrorProps = {
  mensaje: string;
  /** Etiqueta chica sobre el mensaje. Por defecto "Error". */
  titulo?: string;
};

export const CompoError = ({ mensaje, titulo = "Error" }: CompoErrorProps) => {
  return (
    // role="alert" ya es assertive: el lector de voz anuncia el error al aparecer.
    <div className="error-contenedor" role="alert">
      <div className="error-marca" aria-hidden="true">
        <svg
          className="error-icono"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="9.25" />
          <line x1="12" y1="7.5" x2="12" y2="13" />
          <circle cx="12" cy="16.5" r="0.6" fill="currentColor" />
        </svg>
      </div>

      <div className="error-cuerpo">
        <span className="error-titulo">{titulo}</span>
        {/* key: si cambia el mensaje, el texto se remonta y repite el fade */}
        <p key={mensaje} className="error-mensaje">
          {mensaje}
        </p>
      </div>
    </div>
  );
};
