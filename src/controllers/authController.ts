/**
 * Controlador de autenticación: registro y login.
 */

const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
const UserModel = require('../models/User');

const register = async (req: any, res: any, next: any) => {
  try {
    const { nombre, email, password, nivel } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, email, password.' });
    }

    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'El email ya está registrado.' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = await UserModel.create(nombre, email, hash, nivel || 'usuario');
    const token = jsonwebtoken.sign(
      { userId: user.id, nivel: user.nivel },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    console.log('Usuario creado:', { id: user.id, nombre: user.nombre, email: user.email });
    res.status(201).json({
      message: 'Usuario registrado correctamente.',
      user: { id: user.id, nombre: user.nombre, email: user.email, nivel: user.nivel },
      token
    });
  } catch (err: any) {
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
};

const login = async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }
    
    const token = jsonwebtoken.sign(
      { userId: user.id, nivel: user.nivel },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login correcto.',
      user: { id: user.id, nombre: user.nombre, email: user.email, nivel: user.nivel },
      token,
    });
  } catch (err: any) {
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
};

const me = async (req: any, res: any, next: any) => {
  try {
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ user: { id: user.id, nombre: user.nombre, email: user.email, nivel: user.nivel } });
  } catch (err: any) {
    // Manejar errores de BD específicos
    if (err.message === 'DATABASE_UNAVAILABLE' || err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'Base de datos no disponible. Intente más tarde.',
        code: 'DATABASE_UNAVAILABLE'
      });
    }
    next(err);
  }
};

module.exports = {
  register,
  login,
  me,
};
