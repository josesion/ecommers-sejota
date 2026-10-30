/**
 * Contexto global de autenticación.
 *
 * Dueño único de la sesión (C7): expone `user`, `sesion`,
 * `establecerSesion` y `limpiarSesion`. El token vive solo en la cookie
 * httpOnly `id_usuario` del backend, nunca en el estado ni en
 * almacenamiento local. Sin fetch y sin estado de formulario.
 */

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { LoginUser } from "../tipado/login";

/** Valor expuesto por el proveedor de autenticación. */
export interface AuthValor {
  /** Usuario autenticado, `null` sin sesión. */
  user: LoginUser | null;
  /** Indica si hay sesión activa. */
  sesion: boolean;
  /** Guarda el usuario en memoria y marca la sesión como activa. */
  establecerSesion: (user: LoginUser) => void;
  /** Limpia el usuario en memoria (solo local: sin endpoint backend). */
  limpiarSesion: () => void;
}

const AuthContexto = createContext<AuthValor | null>(null);

/**
 * Proveedor global de sesión. Envuelve las rutas en `App.tsx`.
 *
 * @param children - Contenido de la aplicación.
 * @returns Proveedor del contexto de autenticación.
 */
export function AuthProveedor({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginUser | null>(null);

  /** Guarda el usuario autenticado en memoria. */
  const establecerSesion = useCallback((nuevo: LoginUser): void => {
    setUser(nuevo);
  }, []);

  /** Limpia la sesión solo en memoria del cliente. */
  const limpiarSesion = useCallback((): void => {
    setUser(null);
  }, []);

  const valor = useMemo<AuthValor>(
    () => ({ user, sesion: user !== null, establecerSesion, limpiarSesion }),
    [user, establecerSesion, limpiarSesion],
  );

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
}

/**
 * Consume la sesión global. Debe usarse dentro de `AuthProveedor`.
 *
 * @returns Sesión actual y acciones `establecerSesion` / `limpiarSesion`.
 */
export function useAuth(): AuthValor {
  const valor = useContext(AuthContexto);
  if (!valor) throw new Error("useAuth debe usarse dentro de AuthProveedor");
  return valor;
}
