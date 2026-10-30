/**
 * Página privada principal tras el inicio de sesión.
 *
 * Por ahora funciona como galería de componentes: botones, inputs,
 * selector, cargando (skeleton) y error, de cada tipo y estado,
 * para revisar el diseño.
 *
 * @returns Vista principal privada.
 */

import { useState } from "react";
import "./Principal.css";

import { Boton } from "../../componentes/personales/Boton/Boton";
import { Inputs } from "../../componentes/personales/Inputs/Inputs";
import { ComponenteCargando } from "../../componentes/personales/Cargando/Cargando";
import { CompoError } from "../../componentes/personales/Error/Error";
import { SelectorOpt } from "../../componentes/personales/CompSelecObt/SelectorOpt";
import { Navbar } from "../../componentes/MenuNavegacion/BarraNav/NavBar";

import {
  Itemnav,
  type NavItem,
} from "../../componentes/MenuNavegacion/ItemNav/ItemNav";
import { GiDress } from "react-icons/gi";

const escuelas = [
  { id: 1, nombre: "Escuela Norte" },
  { id: 2, nombre: "Escuela Sur" },
  { id: 3, nombre: "Escuela Este" },
];

const mockNavItem: NavItem = {
  href: "/vestidos",
  label: "Vestidos de Alta Gama",
  icono: <GiDress size={20} aria-hidden="true" />,
};
export default function Principal() {
  const [seleccion, setSeleccion] = useState("");

  return (
    <>
      <Navbar />{" "}
      <main className="principal">
        <h1 id="principal-titulo" className="principal-titulo">
          Principal
        </h1>

        <section>
          <Itemnav item={mockNavItem} />
        </section>

        {/* ===== BOTONES ===== */}
        <section className="principal_seccion" aria-labelledby="titulo-botones">
          <h2 id="titulo-botones" className="principal_subtitulo">
            Botones
          </h2>

          <div className="principal_botones">
            <Boton
              onClick={() => {}}
              clase="aceptar"
              logo="Go"
              texto="Aceptar"
            />
            <Boton
              onClick={() => {}}
              clase="agregar"
              logo="Add"
              texto="Agregar"
            />
            <Boton
              onClick={() => {}}
              clase="cancelar"
              logo="Cancel"
              texto="Cancelar"
            />
            <Boton
              onClick={() => {}}
              clase="editar"
              logo="Edit"
              texto="Editar"
            />
            <Boton
              onClick={() => {}}
              clase="eliminar"
              logo="Delete"
              texto="Eliminar"
            />
            <Boton
              onClick={() => {}}
              clase="flechas"
              logo="Go"
              texto="Siguiente"
            />
            <Boton
              onClick={() => {}}
              clase="listar"
              logo="List"
              texto="Listar"
            />
          </div>

          <div className="principal_botones">
            <Boton clase="aceptar" logo="Check" texto="Guardar" cargando />
            <Boton clase="cancelar" logo="Cancel" texto="Bloqueado" disable />
            <Boton
              clase="eliminar"
              logo="Delete"
              ariaLabel="Eliminar escuela"
            />
          </div>
        </section>

        {/* ===== INPUTS ===== */}
        <section className="principal_seccion" aria-labelledby="titulo-inputs">
          <h2 id="titulo-inputs" className="principal_subtitulo">
            Inputs
          </h2>

          {/* Un input de cada tipo */}
          <div className="principal_inputs">
            <Inputs
              label="Texto"
              type="text"
              name="demo_texto"
              placeholder="Escribí algo"
            />
            <Inputs
              label="Contraseña"
              type="password"
              name="demo_password"
              placeholder="••••••••"
              showPasswordToggle
            />
            <Inputs
              label="Email"
              type="email"
              name="demo_email"
              placeholder="nombre@correo.com"
            />
            <Inputs
              label="Número"
              type="number"
              name="demo_numero"
              placeholder="0"
            />
            <Inputs
              label="Teléfono"
              type="tel"
              name="demo_tel"
              placeholder="387 000 0000"
            />
            <Inputs label="Fecha" type="date" name="demo_fecha" />
            <Inputs
              label="Archivo"
              type="file"
              name="demo_archivo"
              accept="image/*"
            />
            <Inputs
              label="Acepto los términos"
              type="checkbox"
              name="demo_checkbox"
            />
          </div>

          {/* Radios: mismo name, id distinto en cada uno */}
          <h3 className="principal_subtitulo principal_subtitulo--chico">
            Grupo de radios
          </h3>
          <div className="principal_inputs">
            <Inputs
              label="Turno mañana"
              type="radio"
              name="turno"
              id="turno_manana"
              value="manana"
            />
            <Inputs
              label="Turno tarde"
              type="radio"
              name="turno"
              id="turno_tarde"
              value="tarde"
            />
          </div>

          {/* Estados */}
          <h3 className="principal_subtitulo principal_subtitulo--chico">
            Estados
          </h3>
          <div className="principal_inputs">
            <Inputs
              label="Requerido"
              name="demo_requerido"
              placeholder="Campo obligatorio"
              required
            />
            <Inputs
              label="Con error"
              name="demo_error"
              placeholder="Probá el error"
              error="Este campo no es válido"
            />
            <Inputs
              label="Contraseña con error"
              type="password"
              name="demo_password_error"
              showPasswordToggle
              error="Mínimo 8 caracteres"
            />
            <Inputs
              label="Solo lectura"
              name="demo_readonly"
              value="No se puede editar"
              readonly
            />
            <Inputs
              label="Deshabilitado"
              name="demo_disabled"
              placeholder="Bloqueado"
              disabled
            />
          </div>
        </section>

        {/* ===== SELECTOR ===== */}
        <section
          className="principal_seccion"
          aria-labelledby="titulo-selector"
        >
          <h2 id="titulo-selector" className="principal_subtitulo">
            Selector
          </h2>

          <div className="principal_inputs">
            <SelectorOpt
              categorias={escuelas}
              itemKey="id"
              itemLabel="nombre"
              name="demo_escuela"
              ariaLabel="Escuela"
              labelDefault="Elegí una escuela"
              value={seleccion}
              onChangeSelector={(e) => setSeleccion(e.target.value)}
            />
            <SelectorOpt
              categorias={escuelas}
              itemKey="id"
              itemLabel="nombre"
              name="demo_escuela_error"
              ariaLabel="Escuela con error"
              value=""
              onChangeSelector={() => {}}
              error="Elegí una escuela"
            />
            <SelectorOpt
              categorias={escuelas}
              itemKey="id"
              itemLabel="nombre"
              name="demo_escuela_disabled"
              ariaLabel="Escuela deshabilitada"
              value="2"
              onChangeSelector={() => {}}
              disabled
            />
          </div>
        </section>

        {/* ===== CARGANDO (skeleton) ===== */}
        <section
          className="principal_seccion"
          aria-labelledby="titulo-cargando"
        >
          <h2 id="titulo-cargando" className="principal_subtitulo">
            Cargando
          </h2>

          <div className="principal_cargando">
            <div className="principal_caja">
              <ComponenteCargando variante="texto" lineas={5} />
            </div>
            <div className="principal_caja">
              <ComponenteCargando variante="tarjeta" />
            </div>
            <div className="principal_caja">
              <ComponenteCargando variante="lista" items={3} />
            </div>
            <div className="principal_caja principal_caja--ancha">
              <ComponenteCargando
                variante="fila"
                items={3}
                texto="Cargando escuelas"
              />
            </div>
          </div>
        </section>

        {/* ===== ERROR ===== */}
        <section className="principal_seccion" aria-labelledby="titulo-error">
          <h2 id="titulo-error" className="principal_subtitulo">
            Error
          </h2>

          <CompoError mensaje="No se pudo guardar la escuela. Intentá de nuevo." />
          <CompoError
            titulo="Sin conexión"
            mensaje="Revisá tu internet y volvé a intentar."
          />
        </section>
      </main>
    </>
  );
}
