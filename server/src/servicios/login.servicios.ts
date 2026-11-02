import bcrypt from "bcrypt";
import { method as loginData } from "../data/login.data";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { TipadoData } from "../tipados/tipado.data";
import { LoginInputs, LoginSchema } from "../squemas/login";
import { LoginRespuesta } from "../tipados/login";
import { generarToken } from "../utils/jwt";

/**
 * Autentica un usuario: valida credenciales, arma el JWT `{id, rol, email}`
 * y lo devuelve junto a los datos publicos. El controlador es quien setea
 * la cookie; el servicio nunca toca `req`/`res`.
 *
 * Se responde siempre `CREDENCIALES_INVALIDAS` cuando el email no existe o
 * la contrasena no coincide, para no filtrar que emails estan registrados.
 *
 * @async
 * @function login
 * @param {LoginInputs} dataEntrada - `email` y `password` crudos del controlador.
 * @returns {Promise<TipadoData<LoginRespuesta>>} `LOGIN_OK` con el token, o `CREDENCIALES_INVALIDAS` / `USUARIO_INACTIVO`.
 */
const login = async (
  dataEntrada: LoginInputs,
): Promise<TipadoData<LoginRespuesta>> => {

  const dataValida = LoginSchema.parse(dataEntrada);
 
  const busqueda = await loginData.buscarUsuarioPorEmail({
    email: dataValida.email,
  });

  // No existe, o no vino la fila: misma respuesta que credenciales invalidas.
  if (busqueda.code !== "USUARIO_EXISTE" || !busqueda.data) {
    return {
      error: true,
      message: "Email o contrasena incorrectos",
      code: "CREDENCIALES_INVALIDAS",
    };
  }

  const usuario = busqueda.data;

  if (Number(usuario.estado) !== 1) {
    return {
      error: true,
      message: "La cuenta de usuario se encuentra inactiva",
      code: "USUARIO_INACTIVO",
    };
  }

  const coincide = await bcrypt.compare(dataValida.password, usuario.password);

  if (!coincide) {
    return {
      error: true,
      message: "Email o contrasena incorrectos",
      code: "CREDENCIALES_INVALIDAS",
    };
  }

const datosPublicos = {
  id: usuario.id_usuario,
  nombre: usuario.nombre,
  apellido: usuario.apellido,
  email: usuario.email,
  rol: usuario.rol,
  // ID de la dirección predeterminada seleccionada para envíos rápidos
  id_direccion_principal: usuario.id_direccion_principal || null, 
};

  const token = generarToken(datosPublicos);

  return {
    error: false,
    message: "Inicio de sesion exitoso",
    data: { ...datosPublicos, token },
    code: "LOGIN_OK",
  };
};

export const method = {
  login: tryCatchDatos(login, "usuario"),
};
