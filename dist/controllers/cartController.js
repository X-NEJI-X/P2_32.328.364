"use strict";
/**
 * Controlador de carrito: operaciones CRUD del carrito de compras.
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
const CartModel = require('../models/Cart');
const getCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const cartItems = yield CartModel.getCartByUserId(userId);
        const total = yield CartModel.getCartTotal(userId);
        res.json({
            items: cartItems,
            total: total,
            itemCount: cartItems.length
        });
    }
    catch (err) {
        console.error('Error al obtener carrito:', err);
        if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Base de datos no disponible. Intente más tarde.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }
        next(err);
    }
});
const addToCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const { product_id, cantidad = 1 } = req.body;
        if (!product_id) {
            return res.status(400).json({ error: 'El ID del producto es obligatorio.' });
        }
        if (cantidad < 1) {
            return res.status(400).json({ error: 'La cantidad debe ser al menos 1.' });
        }
        const cartItem = yield CartModel.addToCart(userId, product_id, cantidad);
        res.status(201).json({
            message: 'Producto agregado al carrito',
            item: cartItem
        });
    }
    catch (err) {
        console.error('Error al agregar al carrito:', err);
        if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Base de datos no disponible. Intente más tarde.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }
        if (err.code === '23503') { // foreign_key_violation
            return res.status(400).json({ error: 'El producto no existe.' });
        }
        next(err);
    }
});
const updateQuantity = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cartId } = req.params;
        const { cantidad } = req.body;
        if (!cantidad || cantidad < 0) {
            return res.status(400).json({ error: 'La cantidad debe ser un número positivo.' });
        }
        const updatedItem = yield CartModel.updateQuantity(parseInt(cartId), cantidad);
        if (!updatedItem) {
            return res.status(404).json({ error: 'Item del carrito no encontrado.' });
        }
        res.json({
            message: 'Cantidad actualizada',
            item: updatedItem
        });
    }
    catch (err) {
        console.error('Error al actualizar cantidad:', err);
        if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Base de datos no disponible. Intente más tarde.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }
        next(err);
    }
});
const removeFromCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cartId } = req.params;
        const removed = yield CartModel.removeFromCart(parseInt(cartId));
        if (!removed) {
            return res.status(404).json({ error: 'Item del carrito no encontrado.' });
        }
        res.json({ message: 'Item eliminado del carrito' });
    }
    catch (err) {
        console.error('Error al eliminar del carrito:', err);
        if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Base de datos no disponible. Intente más tarde.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }
        next(err);
    }
});
const clearCart = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const cleared = yield CartModel.clearCart(userId);
        res.json({
            message: cleared ? 'Carrito vaciado correctamente' : 'El carrito ya estaba vacío'
        });
    }
    catch (err) {
        console.error('Error al vaciar carrito:', err);
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
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
};
//# sourceMappingURL=cartController.js.map