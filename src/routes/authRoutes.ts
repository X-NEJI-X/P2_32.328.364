/**
 * Rutas de autenticación: registro, login y perfil.
 */

import { Router } from 'express';
const { body, validationResult } = require('express-validator');
const { register, login, me } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = Router();

// Validaciones para registro
const registerRules = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('El email debe ser válido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nivel').optional().isIn(['admin', 'usuario']).withMessage('El nivel debe ser admin o usuario')
];

// Validaciones para login
const loginRules = [
  body('email').isEmail().withMessage('El email debe ser válido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
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
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', verifyToken, me);

module.exports = router;
