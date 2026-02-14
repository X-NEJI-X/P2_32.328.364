/**
 * Modelo de carrito. Operaciones sobre la tabla cart.
 */

const cartPool = require('../config/db');

interface CartItem {
  id: number;
  user_id: number;
  product_id: number;
  cantidad: number;
  created_at: Date;
}

interface CartWithProduct extends CartItem {
  nombre: string;
  codigo: string;
  precio: number;
}

const getCartByUserId = async (userId: number): Promise<CartWithProduct[]> => {
  if (!cartPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  const result = await cartPool.query(`
    SELECT c.id, c.user_id, c.product_id, c.cantidad, c.created_at,
           p.nombre, p.codigo, p.precio
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
    ORDER BY c.created_at DESC
  `, [userId]);
  return result.rows;
};

const addItemToCart = async (userId: number, productId: number, cantidad: number = 1): Promise<CartItem> => {
  if (!cartPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  
  // Verificar si el producto ya está en el carrito
  const existing = await cartPool.query(
    'SELECT id, cantidad FROM cart WHERE user_id = $1 AND product_id = $2',
    [userId, productId]
  );
  
  if (existing.rows.length > 0) {
    // Actualizar cantidad existente
    const newCantidad = existing.rows[0].cantidad + cantidad;
    const result = await cartPool.query(
      'UPDATE cart SET cantidad = $1 WHERE id = $2 RETURNING *',
      [newCantidad, existing.rows[0].id]
    );
    return result.rows[0];
  } else {
    // Insertar nuevo item
    const result = await cartPool.query(
      `INSERT INTO cart (user_id, product_id, cantidad)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, productId, cantidad]
    );
    return result.rows[0];
  }
};

const updateItemQuantity = async (cartId: number, cantidad: number): Promise<CartItem | null> => {
  if (!cartPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  
  if (cantidad <= 0) {
    // Eliminar item si cantidad es 0 o negativa
    const result = await cartPool.query(
      'DELETE FROM cart WHERE id = $1 RETURNING *',
      [cartId]
    );
    return result.rows[0] || null;
  }
  
  const result = await cartPool.query(
    'UPDATE cart SET cantidad = $1 WHERE id = $2 RETURNING *',
    [cantidad, cartId]
  );
  return result.rows[0] || null;
};

const deleteFromCart = async (cartId: number): Promise<boolean> => {
  if (!cartPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  const result = await cartPool.query('DELETE FROM cart WHERE id = $1', [cartId]);
  return result.rowCount > 0;
};

const clearUserCart = async (userId: number): Promise<boolean> => {
  if (!cartPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  const result = await cartPool.query('DELETE FROM cart WHERE user_id = $1', [userId]);
  return result.rowCount > 0;
};

const getCartTotal = async (userId: number): Promise<number> => {
  if (!cartPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  const result = await cartPool.query(`
    SELECT SUM(c.cantidad * p.precio) as total
    FROM cart c
    JOIN products p ON c.product_id = p.id
    WHERE c.user_id = $1
  `, [userId]);
  return parseFloat(result.rows[0].total) || 0;
};

const createCartTable = async (): Promise<void> => {
  if (!cartPool) {
    throw new Error('DATABASE_UNAVAILABLE');
  }
  await cartPool.query(`
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
};

module.exports = {
  getCartByUserId,
  addToCart: addItemToCart,
  updateQuantity: updateItemQuantity,
  removeFromCart: deleteFromCart,
  clearCart: clearUserCart,
  getCartTotal,
  createCartTable,
};
