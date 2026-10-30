import dotenv from "dotenv";
dotenv.config();

import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "secret_default";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? "1h") as SignOptions["expiresIn"];

export function generarToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
}

export function verificarToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}
