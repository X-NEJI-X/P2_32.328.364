"use strict";
/**
 * Modelo de carrito. Operaciones sobre la tabla cart.
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
const cartPool = require('../config/db');
const getCartByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!cartPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const result = yield cartPool.query(`
    SELECT c.id, c.user_id, c.product_id, c.cantidad, c.created_at,
           p.nombre, p.codigo, p.precio
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
  `, [userId]);
    return result.rows;
});
const addItemToCart = (userId_1, productId_1, ...args_1) => __awaiter(void 0, [userId_1, productId_1, ...args_1], void 0, function* (userId, productId, cantidad = 1) {
    if (!cartPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    // Verificar si el producto ya está en el carrito
    const existing = yield cartPool.query('SELECT id, cantidad FROM cart WHERE user_id = $1 AND product_id = $2', [userId, productId]);
    if (existing.rows.length > 0) {
        // Actualizar cantidad existente
        const newCantidad = existing.rows[0].cantidad + cantidad;
        const result = yield cartPool.query('UPDATE cart SET cantidad = $1 WHERE id = $2 RETURNING *', [newCantidad, existing.rows[0].id]);
        return result.rows[0];
    }
    else {
        // Insertar nuevo item
        const result = yield cartPool.query(`INSERT INTO cart (user_id, product_id, cantidad)
       VALUES ($1, $2, $3)
       RETURNING *`, [userId, productId, cantidad]);
        return result.rows[0];
    }
});
const updateItemQuantity = (cartId, cantidad) => __awaiter(void 0, void 0, void 0, function* () {
    if (!cartPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    if (cantidad <= 0) {
        // Eliminar item si cantidad es 0 o negativa
        const result = yield cartPool.query('DELETE FROM cart WHERE id = $1 RETURNING *', [cartId]);
        return result.rows[0] || null;
    }
    const result = yield cartPool.query('UPDATE cart SET cantidad = $1 WHERE id = $2 RETURNING *', [cantidad, cartId]);
    return result.rows[0] || null;
});
const deleteFromCart = (cartId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!cartPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const result = yield cartPool.query('DELETE FROM cart WHERE id = $1', [cartId]);
    return result.rowCount > 0;
});
const clearUserCart = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!cartPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const result = yield cartPool.query('DELETE FROM cart WHERE user_id = $1', [userId]);
    return result.rowCount > 0;
});
const getCartTotal = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!cartPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const result = yield cartPool.query(`
    SELECT SUM(c.cantidad * p.precio) as total
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
  `, [userId]);
    return parseFloat(result.rows[0].total) || 0;
});
const createCartTable = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!cartPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    yield cartPool.query(`
    CREATE TABLE IF NOT EXISTS cart (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL DEFAULT 1 CHECK (cantidad > 0),
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    )
  `);
});
module.exports = {
    getCartByUserId,
    addToCart: addItemToCart,
    updateQuantity: updateItemQuantity,
    removeFromCart: deleteFromCart,
    clearCart: clearUserCart,
    getCartTotal,
    createCartTable,
};
//# sourceMappingURL=Cart.js.map