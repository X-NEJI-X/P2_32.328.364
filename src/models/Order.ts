/**
 * Modelo de órdenes. Operaciones sobre la tabla orders y order_items.
 */

const orderPool = require('../config/db');

interface Order {
  id: number;
  user_id: number;
  total: number;
  estado: 'pendiente' | 'pagado' | 'cancelado';
  payment_intent_id?: string;
  created_at: Date;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  cantidad: number;
  precio_unitario: number;
  created_at: Date;
}

interface OrderWithItems extends Order {
  items: OrderItem[];
}

const createOrder = async (userId: number, total: number, paymentIntentId?: string): Promise<Order> => {
  if (!orderPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  
  const result = await orderPool.query(
    `INSERT INTO orders (user_id, total, estado, payment_intent_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, total, 'pendiente', paymentIntentId]
  );
  
  return result.rows[0];
};

const createOrderItems = async (orderId: number, items: Array<{product_id: number, cantidad: number, precio_unitario: number}>): Promise<OrderItem[]> => {
  if (!orderPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  
  const orderItems = [];
  for (const item of items) {
    const result = await orderPool.query(
      `INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [orderId, item.product_id, item.cantidad, item.precio_unitario]
    );
    orderItems.push(result.rows[0]);
  }
  
  return orderItems;
};

const getOrdersByUserId = async (userId: number): Promise<OrderWithItems[]> => {
  if (!orderPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  
  const ordersResult = await orderPool.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  
  const ordersWithItems = [];
  for (const order of ordersResult.rows) {
    const itemsResult = await orderPool.query(
      'SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at',
      [order.id]
    );
    ordersWithItems.push({
      ...order,
      items: itemsResult.rows
    });
  }
  
  return ordersWithItems;
};

const updateOrderStatus = async (orderId: number, estado: 'pendiente' | 'pagado' | 'cancelado'): Promise<Order | null> => {
  if (!orderPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  
  const result = await orderPool.query(
    'UPDATE orders SET estado = $1 WHERE id = $2 RETURNING *',
    [estado, orderId]
  );
  
  return result.rows[0] || null;
};

const createOrderTables = async (): Promise<void> => {
  if (!orderPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  
  await orderPool.query(`
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
  
  await orderPool.query(`
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
};

module.exports = {
  createOrder,
  createOrderItems,
  getOrdersByUserId,
  updateOrderStatus,
  createOrderTables,
};
