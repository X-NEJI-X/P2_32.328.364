"use strict";
/**
 * Modelo de órdenes. Operaciones sobre la tabla orders y order_items.
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
const orderPool = require('../config/db');
const createOrder = (userId, total, paymentIntentId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!orderPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const result = yield orderPool.query(`INSERT INTO orders (user_id, total, estado, payment_intent_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`, [userId, total, 'pendiente', paymentIntentId]);
    return result.rows[0];
});
const createOrderItems = (orderId, items) => __awaiter(void 0, void 0, void 0, function* () {
    if (!orderPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const orderItems = [];
    for (const item of items) {
        const result = yield orderPool.query(`INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [orderId, item.product_id, item.cantidad, item.precio_unitario]);
        orderItems.push(result.rows[0]);
    }
    return orderItems;
});
const getOrdersByUserId = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!orderPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const ordersResult = yield orderPool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    const ordersWithItems = [];
    for (const order of ordersResult.rows) {
        const itemsResult = yield orderPool.query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at', [order.id]);
        ordersWithItems.push(Object.assign(Object.assign({}, order), { items: itemsResult.rows }));
    }
    return ordersWithItems;
});
const updateOrderStatus = (orderId, estado) => __awaiter(void 0, void 0, void 0, function* () {
    if (!orderPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    const result = yield orderPool.query('UPDATE orders SET estado = $1 WHERE id = $2 RETURNING *', [estado, orderId]);
    return result.rows[0] || null;
});
const createOrderTables = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!orderPool) {
        throw new Error('DATABASE_UNAVAILABLE');
    }
    yield orderPool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
      estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'cancelado')),
      payment_intent_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    yield orderPool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL CHECK (cantidad > 0),
      precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario > 0),
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);
});
module.exports = {
    createOrder,
    createOrderItems,
    getOrdersByUserId,
    updateOrderStatus,
    createOrderTables,
};
//# sourceMappingURL=Order.js.map