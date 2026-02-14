/**
 * Modelo de usuario. Operaciones sobre la tabla users.
 */

const userPool = require('../config/db');

interface User {
  id: number;
  nombre: string;
  email: string;
  password: string;
  nivel: 'admin' | 'usuario';
  created_at: Date;
}

const findByEmail = async (email: string): Promise<User | null> => {
  if (!userPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  const result = await userPool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

const findById = async (id: number): Promise<User | null> => {
  if (!userPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  const result = await userPool.query('SELECT id, nombre, email, nivel, created_at FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

const create = async (nombre: string, email: string, passwordHash: string, nivel: 'admin' | 'usuario' = 'usuario'): Promise<User> => {
  if (!userPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  const result = await userPool.query(
    `INSERT INTO users (nombre, email, password, nivel)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, email, nivel, created_at`,
    [nombre, email, passwordHash, nivel]
  );
  return result.rows[0];
};

const createTable = async (): Promise<void> => {
  if (!userPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  await userPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      nivel VARCHAR(50) DEFAULT 'usuario',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

module.exports = {
  findByEmail,
  findById,
  create,
  createTable,
};
