"use strict";
/**
 * Modelo de producto. Operaciones sobre la tabla products.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const productPool = require('../config/db');
const findAll = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!productPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const result = yield productPool.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
});
const findByCodigo = (codigo) => __awaiter(void 0, void 0, void 0, function* () {
    if (!productPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const result = yield productPool.query('SELECT * FROM products WHERE codigo = $1', [codigo]);
    return result.rows[0] || null;
});
const createProduct = (nombre, codigo, precio, descripcion) => __awaiter(void 0, void 0, void 0, function* () {
    if (!productPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const result = yield productPool.query(`INSERT INTO products (nombre, codigo, precio, descripcion)
     VALUES ($1, $2, $3, $4)
     RETURNING *`, [nombre, codigo, precio, descripcion]);
    return result.rows[0];
});
const createProductTable = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!productPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    yield productPool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      codigo VARCHAR(50) UNIQUE NOT NULL,
      precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
      descripcion TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
});
module.exports = {
    findAll,
    findByCodigo,
    create: createProduct,
    createTable: createProductTable,
};
//# sourceMappingURL=Product.js.map