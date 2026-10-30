# Estructura del Proyecto — web-sejotas server

> Solo el **Coordinador** actualiza este archivo al cerrar una spec.

## Stack

- **Runtime:** Node.js + Express
- **Lenguaje:** TypeScript estricto (`strict: true`)
- **Base de datos:** MySQL (pool en `src/bd.ts`)
- **Auth:** JWT en cookie `id_usuario` (httpOnly)

## Estructura de carpetas

```
src/
├── index.ts                      entry point (listen)
├── app.ts                        middlewares globales + rutas + manejo de errores
├── bd.ts                         config + pool de MySQL (default export)
│
├── rutas/                        definición de endpoints
│   ├── login.ruta.ts             POST /api/login (público)
│   ├── usuarios.ruta.ts          GET/POST/PUT/DELETE /api/usuarios (protegido)
│   └── categorias.ruta.ts        GET/POST/PUT/DELETE /api/categorias (protegido)
│
├── controladores/                arma payload, llama servicio, responde
│   ├── login.controlador.ts
│   ├── usuarios.controlador.ts
│   └── categorias.controlador.ts
│
├── servicios/                    lógica de negocio (.parse() primera línea)
│   ├── login.servicios.ts
│   ├── usuarios.servicios.ts
│   └── categorias.servicios.ts
│
├── data/                         acceso a BD (solo hooks, prohibido pool.query)
│   ├── login.data.ts
│   ├── usuarios.data.ts
│   └── categorias.data.ts
│
├── squemas/                      validación Zod por operación
│   ├── login.ts
│   ├── usuarios.ts
│   └── categorias.ts
│
├── tipados/                      interfaces y tipos
│   ├── generico.ts               CodigoEstadoHTTP
│   ├── tipado.data.ts            TipadoData<T>
│   ├── login.ts
│   ├── usuarios.ts
│   └── categorias.ts
│
├── respuestas/                   mapas code → status HTTP
│   ├── login.ts                  MAPA_LOGIN
│   ├── usuarios.ts               MAPA_USUARIOS_*
│   └── categorias.ts             MAPA_CATEGORIAS_*
│
├── hooks/                        hooks genéricos de BD (no se tocan)
│   ├── buscarExistenteEntidad.ts
│   ├── funcionListar.ts
│   ├── funcionListarSinPag.ts
│   ├── iudEntidad.ts
│   ├── iudEntidadTRansaccion.ts
│   └── fecha.ts
│
├── utils/                        utilidades transversales
│   ├── jwt.ts                    generarToken / verificarToken
│   ├── permisos.ts               validarPermiso (JWT) + soloAdmin (rol)
│   ├── handleControladores.ts    invoca servicio y responde
│   ├── response.ts               enviarResponse / enviarError
│   ├── responseError.ts          enviarResponseError
│   ├── tryCatch.ts               wrapper de controladores
│   ├── tryCatchBD.ts             wrapper de servicios/data (traduce ER_DUP_ENTRY)
│   ├── error.ts                  ClientError
│   ├── baseDatos.ts              select / execute
│   ├── logger.ts
│   ├── subirImagen.ts
│   ├── r2.servicio.ts
│   ├── fechasSuscripcion.ts
│   └── emailService.ts
│
├── config/
│   └── r2.ts                     config de Cloudflare R2
│
└── middleware/                   (vacío por ahora)
```

## Flujo de una request

```
HTTP → ruta → controlador → servicio → data → hooks → BD
                              ↓
                         squemas (Zod)
                              ↓
                         respuestas (mapa code → HTTP)
```

## Reglas por capa

| Capa | Regla |
|---|---|
| **Rutas** | Prefijo `/api/` dentro del path. `permisos.validarPermiso` en toda ruta protegida. Controlador como último middleware. |
| **Controladores** | Arma payload con `Number()`. Llama servicio vía `handleControladores` (o `enviarResponse` si necesita cookie). Prohibido importar Zod o data. |
| **Servicios** | `.parse()` primera línea. Prohibido recibir `req`/`res`. Prohibido SQL. |
| **Data** | Solo hooks de `src/hooks/`. Prohibido `pool.query`. Envuelta en `tryCatchDatos`. |
| **Squemas** | Zod con coerción y acotación. Exportar `...Inputs` inferidos. |
| **Respuestas** | Mapas `Record<string, {status, msg}>` con `ERROR_SERVIDOR` de reserva. |

## Endpoints

| Método | Path | Auth | Descripción |
|---|---|---|---|
| `POST` | `/api/login` | Público | Autentica y devuelve JWT en cookie |
| `GET` | `/api/usuarios` | admin | Lista usuarios activos con paginación |
| `POST` | `/api/usuarios` | admin | Crea usuario (verifica duplicado email) |
| `PUT` | `/api/usuarios` | admin | Modifica usuario (campos presentes) |
| `DELETE` | `/api/usuarios` | admin | Baja lógica (`estado = 0`) |
| `GET` | `/api/categorias` | admin | Lista categorías con paginación y filtro `activo` |
| `POST` | `/api/categorias` | admin | Crea categoría (verifica duplicado slug) |
| `PUT` | `/api/categorias` | admin | Modifica categoría (campos presentes) |
| `DELETE` | `/api/categorias` | admin | Baja lógica (`activo = 0`) |

## Autenticación

1. `POST /api/login` valida credenciales con `bcrypt.compare`.
2. Genera JWT con payload `{id, rol, email}`.
3. Setea cookie `id_usuario` (httpOnly, sameSite=lax, maxAge=1h).
4. Rutas protegidas leen el JWT de la cookie vía `permisos.validarPermiso`.
5. `permisos.soloAdmin` exige `req.usuario.rol === "admin"`.
