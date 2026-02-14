"use strict";
/**
 * Rutas del carrito: operaciones CRUD del carrito de compras.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middlewares/authMiddleware');
const { getCart, addToCart, updateQuantity, removeFromCart, clearCart } = require('../controllers/cartController');
const router = (0, express_1.Router)();
// Middleware de autenticación para todas las rutas del carrito
router.use(verifyToken);
// Validaciones
const addToCartRules = [
    body('product_id').isInt({ min: 1 }).withMessage('El ID del producto debe ser un número entero positivo'),
    body('cantidad').optional().isInt({ min: 1 }).withMessage('La cantidad debe ser un número entero positivo')
];
const updateQuantityRules = [
    body('cantidad').isInt({ min: 0 }).withMessage('La cantidad debe ser un número entero no negativo')
];
// Middleware de validación
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Datos inválidos',
            details: errors.array()
        });
    }
    next();
};
// Rutas
router.get('/', getCart);
router.post('/add', addToCartRules, validate, addToCart);
router.put('/update/:cartId', updateQuantityRules, validate, updateQuantity);
router.delete('/remove/:cartId', removeFromCart);
router.delete('/clear', clearCart);
module.exports = router;
//# sourceMappingURL=cartRoutes.js.map