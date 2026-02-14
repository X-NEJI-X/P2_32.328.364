/**
 * Modelo de producto. Operaciones sobre la tabla products.
 */

const productPool = require('../config/db');

interface Product {
  id: number;
  nombre: string;
  codigo: string;
  precio: number;
  descripcion: string;
  created_at: Date;
}

const findAll = async (): Promise<Product[]> => {
  if (!productPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  const result = await productPool.query('SELECT * FROM products ORDER BY created_at DESC');
  return result.rows;
};

const findByCodigo = async (codigo: string): Promise<Product | null> => {
  if (!productPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  const result = await productPool.query('SELECT * FROM products WHERE codigo = $1', [codigo]);
  return result.rows[0] || null;
};

const createProduct = async (nombre: string, codigo: string, precio: number, descripcion: string): Promise<Product> => {
  if (!productPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  const result = await productPool.query(
    `INSERT INTO products (nombre, codigo, precio, descripcion)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [nombre, codigo, precio, descripcion]
  );
  return result.rows[0];
};

const createProductTable = async (): Promise<void> => {
  if (!productPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  await productPool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      codigo VARCHAR(50) UNIQUE NOT NULL,
      precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};

module.exports = {
  findAll,
  findByCodigo,
  create: createProduct,
  createTable: createProductTable,
};
