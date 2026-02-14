"use strict";
/**
 * Middleware de autenticación: verificar token JWT y nivel de usuario.
 */
const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Token inválido.' });
    }
};
const isAdmin = (req, res, next) => {
    if (req.user.nivel !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere nivel de administrador.' });
    }
    next();
};
module.exports = {
    verifyToken,
    isAdmin,
};
//# sourceMappingURL=authMiddleware.js.map