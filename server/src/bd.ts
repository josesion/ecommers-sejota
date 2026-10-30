import mysql2 from "mysql2/promise";

/**
 * Configuración de conexión a MySQL, alimentada por variables de entorno.
 * Se exporta para que los hooks de transacción puedan reutilizarla.
 */
export const config = {
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "ecommers",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

/**
 * Pool de conexiones a MySQL. Se exporta por defecto porque lo consumen
 * directamente los hooks transaccionales (`iudEntidadTransaction`).
 */
const pool = mysql2.createPool(config);

export default pool;
