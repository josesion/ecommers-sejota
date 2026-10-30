import { useId } from "react";
import type { MouseEvent } from "react";
import { Itemnav, type NavItem } from "../ItemNav/ItemNav";
import { RUTAS_PRINCIPALES } from "../rutasProps";
import type { RutaNav } from "../rutasProps";
import { useDrawer } from "../useDrawer";
import "./navbar.css";

interface NavbarProps {
  rutas?: RutaNav[];
  marca?: string;
  marcaHref?: string;
  /** Ruta actual. Si no se pasa, se lee de window.location.pathname. */
  rutaActual?: string;
}

const esActiva = (href: string, actual: string) =>
  href === "/"
    ? actual === "/"
    : actual === href || actual.startsWith(`${href}/`);

// Desktop: solo texto. Drawer: texto + icono.
const aItem = (ruta: RutaNav, conIcono: boolean): NavItem => {
  const Icono = ruta.icono;
  return {
    href: ruta.href,
    label: ruta.label,
    icono: conIcono && Icono ? <Icono /> : undefined,
  };
};

export const Navbar = ({
  rutas = RUTAS_PRINCIPALES,
  marca = "Maison Noir",
  marcaHref = "/",
  rutaActual,
}: NavbarProps) => {
  const idDrawer = useId();
  const { abierto, cerrar, alternar, panelRef, disparadorRef } = useDrawer();

  const actual =
    rutaActual ??
    (typeof window !== "undefined" ? window.location.pathname : "");

  return (
    <>
      <header className="navbar">
        <div className="navbar_barra">
          <button
            ref={disparadorRef}
            type="button"
            className="navbar_toggle"
            aria-label="Menú"
            aria-expanded={abierto}
            aria-controls={idDrawer}
            onClick={alternar}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="14" y2="17" />
            </svg>
          </button>

          <a className="navbar_marca" href={marcaHref}>
            {marca}
          </a>

          {/* Desktop: lista horizontal, solo texto */}
          <nav className="navbar_desktop" aria-label="Principal">
            <ul className="navbar_lista">
              {rutas.map((ruta) => (
                <Itemnav
                  key={ruta.href}
                  item={aItem(ruta, false)}
                  activo={esActiva(ruta.href, actual)}
                />
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* El drawer va fuera del <header> a propósito: si el header tiene
          backdrop-filter, los hijos position:fixed se posicionan respecto
          al header y no a la pantalla. */}
      <div
        className="drawer_fondo"
        data-abierto={abierto || undefined}
        onClick={cerrar}
        aria-hidden="true"
      />

      <aside
        id={idDrawer}
        ref={panelRef}
        className="drawer"
        data-abierto={abierto || undefined}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <div className="drawer_cabecera">
          <span className="drawer_titulo">{marca}</span>
          <button
            type="button"
            className="drawer_cerrar"
            aria-label="Cerrar menú"
            onClick={cerrar}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>
        </div>

        <nav aria-label="Principal">
          <ul className="drawer_lista">
            {rutas.map((ruta) => (
              <Itemnav
                key={ruta.href}
                item={aItem(ruta, true)}
                activo={esActiva(ruta.href, actual)}
                onClick={(_e: MouseEvent<HTMLAnchorElement>) => cerrar()}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};
