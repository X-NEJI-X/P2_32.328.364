"use strict";
/**
 * Rutas de productos: CRUD de productos con protección de administrador.
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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const { body, validationResult } = require('express-validator');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const { findAll, findByCodigo, create } = require('../models/Product');
const router = (0, express_1.Router)();
// Validaciones
const createProductRules = [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('codigo').notEmpty().withMessage('El código es obligatorio'),
    body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser mayor a 0'),
    body('descripcion').optional().notEmpty().withMessage('La descripción no puede estar vacía')
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
// Rutas públicas
router.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield findAll();
        res.json({ products });
    }
    catch (err) {
        console.error('Error al obtener productos:', err);
        if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Base de datos no disponible. Intente más tarde.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }
        next(err);
    }
}));
router.get('/:codigo', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { codigo } = req.params;
        const product = yield findByCodigo(codigo);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        res.json({ product });
    }
    catch (err) {
        console.error('Error al obtener producto:', err);
        if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Base de datos no disponible. Intente más tarde.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }
        next(err);
    }
}));
// Rutas protegidas (solo administradores)
router.post('/', verifyToken, isAdmin, createProductRules, validate, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, codigo, precio, descripcion } = req.body;
        const product = yield create(nombre, codigo, precio, descripcion);
        res.status(201).json({
            message: 'Producto creado exitosamente',
            product
        });
    }
    catch (err) {
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
}));
module.exports = router;
//# sourceMappingURL=productRoutes.js.map