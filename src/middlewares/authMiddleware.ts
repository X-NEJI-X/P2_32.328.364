/**
 * Middleware de autenticación: verificar token JWT y nivel de usuario.
 */

const jwt = require('jsonwebtoken');

interface UserPayload {
  userId: number;
  nivel: 'admin' | 'usuario';
}

const verifyToken = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido.' });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.nivel !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere nivel de administrador.' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
};
