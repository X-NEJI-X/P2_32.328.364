/**
 * Rutas de pagos: integración con Stripe y gestión de órdenes.
 */

import { Router } from 'express';
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  createCheckoutSession,
  confirmPayment,
  getMyOrders
} = require('../controllers/paymentController');

const router = Router();

// Middleware de autenticación para todas las rutas de pagos
router.use(verifyToken);

// Validaciones
const checkoutRules = [
  body('success_url').isURL().withMessage('La URL de éxito debe ser válida'),
  body('cancel_url').isURL().withMessage('La URL de cancelación debe ser válida')
];

const confirmRules = [
  body('payment_intent_id').notEmpty().withMessage('El ID del intento de pago es obligatorio')
];

// Middleware de validación
const validate = (req: any, res: any, next: any) => {
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
router.post('/create-checkout-session', checkoutRules, validate, createCheckoutSession);
router.post('/confirm', confirmRules, validate, confirmPayment);
router.get('/my-orders', getMyOrders);

module.exports = router;
