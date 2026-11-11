import express, { Express, NextFunction, Response, Request } from "express";
import { z } from "zod";
import cookieParser from "cookie-parser";
import cors from "cors";

import { ClientError } from "./utils/error";
import { enviarResponseError } from "./utils/responseError";

/** IMPORTACIÓN DE RUTAS */
import usuariosRuta from "./rutas/usuarios.ruta";
import loginRuta from "./rutas/login.ruta";
import categoriasRuta from "./rutas/categorias.ruta";
import tallesRuta from "./rutas/talles.ruta";

import productosRuta from "./rutas/productos.ruta";

import coloresRuta from "./rutas/colores.ruta";


// ** LIMITADOR DE PETICIONES **/
import { globalLimiter } from "./middleware/rateLimite"; 

const app: Express = express();

/** CONFIGURACIÓN DE MIDDLEWARES dependiendo de donde se este ejecutando */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.1.20:5174",
     
    ],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(globalLimiter);




/** REGISTRO DE RUTAS */
app.use(loginRuta);
app.use(usuariosRuta);
app.use(categoriasRuta);
app.use(tallesRuta);


app.use(productosRuta);

app.use(coloresRuta);

/** MANEJADOR GLOBAL DE ERRORES */
app.use((err: Error, __req: Request, res: Response, __next: NextFunction) => {
  let statusCode = 500;
  let message = "Error interno del servidor";
  let code = "INTERNAL_SERVER_ERROR";
  let errorsDetails: any[] | undefined = undefined;

  if (err instanceof ClientError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (err instanceof z.ZodError) {
    statusCode = 400;
    message = "Error de validación de datos";
    code = "VALIDATION_ERROR";

    // Mapeamos los errores de Zod extrayendo el campo exacto y su mensaje
    errorsDetails = err.issues.map((zodIssue) => ({
      campo: zodIssue.path.join("."),
      message: zodIssue.message,
      code: zodIssue.code,
    }));
  } else if (
    err instanceof SyntaxError &&
    (err as any).status === 400 &&
    "body" in err
  ) {
    statusCode = 400;
    message = "Error de sintaxis JSON: El cuerpo de la solicitud no es un JSON válido.";
    code = "INVALID_JSON_SYNTAX";
  }

  // Pasamos los detalles a la función de respuesta
  enviarResponseError(res, statusCode, message, code, errorsDetails);
});

export default app;
