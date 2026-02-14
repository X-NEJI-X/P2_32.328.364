/**
 * Controlador de pagos: integración con Stripe y gestión de órdenes.
 */

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const createCheckoutSession = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.userId;
    const { success_url, cancel_url } = req.body;
    
    if (!success_url || !cancel_url) {
      return res.status(400).json({ error: 'Se requieren las URLs de éxito y cancelación.' });
    }
    
    // Obtener carrito del usuario
    const cartItems = await Cart.getCartByUserId(userId);
    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'El carrito está vacío.' });
    }
    
    // Crear line_items para Stripe
    const line_items = cartItems.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.nombre,
          description: item.codigo
        }
      },
      unit_amount: Math.round(item.precio * 100), // Stripe usa centavos
      quantity: item.cantidad
    }));
    
    // Crear sesión de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url,
      cancel_url,
      customer_email: req.user.email || undefined,
      metadata: {
        userId: userId.toString()
      }
    });
    
    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (err: any) {
    console.error('Error al crear sesión de checkout:', err);
    
    if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Base de datos no disponible. Intente más tarde.',
        code: 'DATABASE_UNAVAILABLE'
      });
    }
    
    next(err);
  }
};

const confirmPayment = async (req: any, res: any, next: any) => {
  try {
    const { payment_intent_id } = req.body;
    
    if (!payment_intent_id) {
      return res.status(400).json({ error: 'Se requiere el ID del intento de pago.' });
    }
    
    // Verificar el pago en Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'El pago no fue exitoso.' });
    }
    
    const userId = parseInt(paymentIntent.metadata.userId);
    
    // Obtener carrito y crear orden
    const cartItems = await Cart.getCartByUserId(userId);
    const total = await Cart.getCartTotal(userId);
    
    // Crear la orden
    const order = await Order.createOrder(userId, total, payment_intent_id);
    
    // Crear items de la orden
    const orderItems = cartItems.map((item: any) => ({
      product_id: item.product_id,
      cantidad: item.cantidad,
      precio_unitario: item.precio
    }));
    
    await Order.createOrderItems(order.id, orderItems);
    
    // Actualizar estado de la orden
    await Order.updateOrderStatus(order.id, 'pagado');
    
    // Vaciar el carrito
    await Cart.clearCart(userId);
    
    res.json({
      message: 'Pago confirmado exitosamente',
      orderId: order.id,
      order: {
        id: order.id,
        total: order.total,
        estado: 'pagado',
        items: orderItems
      },
      redirectUrl: '/' // Redirigir al home después del pago
    });
  } catch (err: any) {
    console.error('Error al confirmar pago:', err);
    
    if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Base de datos no disponible. Intente más tarde.',
        code: 'DATABASE_UNAVAILABLE'
      });
    }
    
    next(err);
  }
};

const getMyOrders = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.getOrdersByUserId(userId);
    
    res.json({
      orders,
      total: orders.length
    });
  } catch (err: any) {
    console.error('Error al obtener órdenes:', err);
    
    if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Base de datos no disponible. Intente más tarde.',
        code: 'DATABASE_UNAVAILABLE'
      });
    }
    
    next(err);
  }
};

module.exports = {
  createCheckoutSession,
  confirmPayment,
  getMyOrders
};
