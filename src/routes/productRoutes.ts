/**
 * Rutas de productos: CRUD de productos con protección de administrador.
 */

import { Router } from 'express';
const { body, validationResult } = require('express-validator');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { findAll, findByCodigo, create } = require('../models/Product');

const router = Router();

// Validaciones
const createProductRules = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('codigo').notEmpty().withMessage('El código es obligatorio'),
  body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser mayor a 0'),
  body('descripcion').optional().notEmpty().withMessage('La descripción no puede estar vacía')
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

// Rutas públicas
router.get('/', async (req: any, res: any, next: any) => {
  try {
    const products = await findAll();
    res.json({ products });
  } catch (err: any) {
    console.error('Error al obtener productos:', err);
    
    if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Base de datos no disponible. Intente más tarde.',
        code: 'DATABASE_UNAVAILABLE'
      });
    }
    
    next(err);
  }
});

router.get('/:codigo', async (req: any, res: any, next: any) => {
  try {
    const { codigo } = req.params;
    const product = await findByCodigo(codigo);
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }
    
    res.json({ product });
  } catch (err: any) {
    console.error('Error al obtener producto:', err);
    
    if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Base de datos no disponible. Intente más tarde.',
        code: 'DATABASE_UNAVAILABLE'
      });
    }
    
    next(err);
  }
});

// Rutas protegidas (solo administradores)
router.post('/', verifyToken, isAdmin, createProductRules, validate, async (req: any, res: any, next: any) => {
  try {
    const { nombre, codigo, precio, descripcion } = req.body;
    const product = await create(nombre, codigo, precio, descripcion);
    
    res.status(201).json({
      message: 'Producto creado exitosamente',
      product
    });
  } catch (err: any) {
    console.error('Error al crear producto:', err);
    
    if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Base de datos no disponible. Intente más tarde.',
        code: 'DATABASE_UNAVAILABLE'
      });
    }
    
    if (err.code === '23505') { // unique_violation
      return res.status(400).json({ error: 'El código del producto ya existe.' });
    }
    
    next(err);
  }
});

module.exports = router;
