/**
 * Página pública de inicio de sesión.
 *
 * Solo JSX: invoca el seteo `useAbmLogin` de `hookNegocios/`, lee `sesion`
 * de `useAuth()` para el `Navigate` y compone `main`, `h1`, subtítulo y
 * `<LoginFormulario />`. No pinta `Input` ni `Boton`, no tiene `useReducer`
 * ni importa el fetch.
 */

import { Navigate } from "react-router-dom";
import {
  inputsFormulario,
  useAbmLogin,
} from "../../../hookNegocios/useAbmLogin/useAbmLogin";
import { useAuth } from "../../../contexto/AuthContext";
import { LoginFormulario } from "../../../componentes/Login/LoginFormulario/LoginFormulario";
import "./LoginPage.css";

/**
 * Muestra el formulario de inicio de sesión sobre el fondo de mármol
 * global (`.fondo-imagen` en `main.tsx`) con la tarjeta encima.
 *
 * @returns Página de login o redirección a `/principal` con sesión.
 */
export default function LoginPage() {
  const { state, handlers } = useAbmLogin();
  const { sesion } = useAuth();

  if (sesion) {
    return <Navigate to="/principal" replace />;
  }

  return (
    <main className="login">
      <section className="login-tarjeta" aria-label="Acceso a la cuenta">
        <h1 id="login-titulo" className="login-titulo">
          Iniciar sesión
        </h1>

        <p id="login-subtitulo" className="login-subtitulo">
          Accede a tu cuenta para gestionar tus pedidos
        </p>

        <LoginFormulario
          valores={state.form}
          inputs={inputsFormulario}
          carga={state.carga["formulario"]}
          error={state.error["formulario"]}
          idTitulo="login-titulo"
          idSubtitulo="login-subtitulo"
          onChange={handlers.onChange}
          onSubmit={handlers.onSubmit}
        />
      </section>
    </main>
  );
}
