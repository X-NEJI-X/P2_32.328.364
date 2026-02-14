"use strict";
/**
 * Controlador de autenticación: registro y login.
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
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const UserModel = require('../models/User');
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nombre, email, password, nivel } = req.body;
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, email, password.' });
        }
        const existing = yield UserModel.findByEmail(email);
        if (existing) {
            return res.status(400).json({ error: 'El email ya está registrado.' });
        }
        const hash = yield bcrypt.hash(password, 10);
        const user = yield UserModel.create(nombre, email, hash, nivel || 'usuario');
        const token = jsonwebtoken.sign({ userId: user.id, nivel: user.nivel }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        console.log('Usuario creado:', { id: user.id, nombre: user.nombre, email: user.email });
        res.status(201).json({
            message: 'Usuario registrado correctamente.',
            user: { id: user.id, nombre: user.nombre, email: user.email, nivel: user.nivel },
            token
        });
    }
    catch (err) {
        console.error('Error en registro:', {
            message: err.message,
            code: err.code,
            detail: err.detail,
            hint: err.hint,
            where: err.where,
        });
        // Manejar errores de BD específicos
        if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Base de datos no disponible. Intente más tarde.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }
        next(err);
    }
});
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }
        const valid = yield bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Credenciales incorrectas.' });
        }
        const token = jsonwebtoken.sign({ userId: user.id, nivel: user.nivel }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
        res.json({
            message: 'Login correcto.',
            user: { id: user.id, nombre: user.nombre, email: user.email, nivel: user.nivel },
            token,
        });
    }
    catch (err) {
        console.error('Error en login:', {
            message: err.message,
            code: err.code,
            detail: err.detail,
            hint: err.hint,
            where: err.where,
        });
        // Manejar errores de BD específicos
        if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'Base de datos no disponible. Intente más tarde.',
                code: 'DATABASE_UNAVAILABLE'
            });
        }
        next(err);
    }
});
const me = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield UserModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json({ user: { id: user.id, nombre: user.nombre, email: user.email, nivel: user.nivel } });
    }
    catch (err) {
        // Manejar errores de BD específicos
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
    register,
    login,
    me,
};
//# sourceMappingURL=authController.js.map