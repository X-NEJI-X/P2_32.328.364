"use strict";
/**
 * Controlador de pagos: integración con Stripe y gestión de órdenes.
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
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const createCheckoutSession = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { success_url, cancel_url } = req.body;
        if (!success_url || !cancel_url) {
            return res.status(400).json({ error: 'Se requieren las URLs de éxito y cancelación.' });
        }
        // Obtener carrito del usuario
        const cartItems = yield Cart.getCartByUserId(userId);
        if (cartItems.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío.' });
        }
        // Crear line_items para Stripe
        const line_items = cartItems.map((item) => ({
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
        const session = yield stripe.checkout.sessions.create({
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
    }
    catch (err) {
        console.error('Error al crear sesión de checkout:', err);
        if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Base de datos no disponible. Intente más tarde.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }
        next(err);
    }
});
const confirmPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { payment_intent_id } = req.body;
        if (!payment_intent_id) {
            return res.status(400).json({ error: 'Se requiere el ID del intento de pago.' });
        }
        // Verificar el pago en Stripe
        const paymentIntent = yield stripe.paymentIntents.retrieve(payment_intent_id);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: 'El pago no fue exitoso.' });
        }
        const userId = parseInt(paymentIntent.metadata.userId);
        // Obtener carrito y crear orden
        const cartItems = yield Cart.getCartByUserId(userId);
        const total = yield Cart.getCartTotal(userId);
        // Crear la orden
        const order = yield Order.createOrder(userId, total, payment_intent_id);
        // Crear items de la orden
        const orderItems = cartItems.map((item) => ({
            product_id: item.product_id,
            cantidad: item.cantidad,
            precio_unitario: item.precio
        }));
        yield Order.createOrderItems(order.id, orderItems);
        // Actualizar estado de la orden
        yield Order.updateOrderStatus(order.id, 'pagado');
        // Vaciar el carrito
        yield Cart.clearCart(userId);
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
    }
    catch (err) {
        console.error('Error al confirmar pago:', err);
        if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Base de datos no disponible. Intente más tarde.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }
        next(err);
    }
});
const getMyOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const orders = yield Order.getOrdersByUserId(userId);
        res.json({
            orders,
            total: orders.length
        });
    }
    catch (err) {
        console.error('Error al obtener órdenes:', err);
        if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Base de datos no disponible. Intente más tarde.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }
        next(err);
    }
});
module.exports = {
    createCheckoutSession,
    confirmPayment,
    getMyOrders
};
//# sourceMappingURL=paymentController.js.map