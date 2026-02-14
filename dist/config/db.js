"use strict";
/**
 * Configuración de la base de datos PostgreSQL.
 */
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 5, // Limitado para Render Free
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
// Verificar conexión
pool.on('connect', () => {
    console.log('✅ Conectado a PostgreSQL');
});
pool.on('error', (err) => {
    console.error('❌ Error en la base de datos:', err);
});
module.exports = pool;
//# sourceMappingURL=db.js.map