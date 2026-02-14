"use strict";
/**
 * Modelo de usuario. Operaciones sobre la tabla users.
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
const userPool = require('../config/db');
const findByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const result = yield userPool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
});
const findById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const result = yield userPool.query('SELECT id, nombre, email, nivel, created_at FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
});
const create = (nombre_1, email_1, passwordHash_1, ...args_1) => __awaiter(void 0, [nombre_1, email_1, passwordHash_1, ...args_1], void 0, function* (nombre, email, passwordHash, nivel = 'usuario') {
    if (!userPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const result = yield userPool.query(`INSERT INTO users (nombre, email, password, nivel)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, email, nivel, created_at`, [nombre, email, passwordHash, nivel]);
    return result.rows[0];
});
const createTable = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!userPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    yield userPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      nivel VARCHAR(50) DEFAULT 'usuario',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
});
module.exports = {
    findByEmail,
    findById,
    create,
    createTable,
};
//# sourceMappingURL=User.js.map