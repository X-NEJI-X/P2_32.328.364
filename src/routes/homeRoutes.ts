import { Router } from 'express';
import path from 'path';

const router = Router();

// Página principal
router.get('/', (req, res) => {
  res.render('index');
});

// Página de productos
router.get('/products', (req, res) => {
  res.render('products');
});

// Página de carrito
router.get('/cart', (req, res) => {
  res.render('cart');
});

// Página de órdenes/compras
router.get('/orders', (req, res) => {
  res.render('orders');
});

// Página de login
router.get('/login', (req, res) => {
  res.render('login');
});

// Página de registro
router.get('/register', (req, res) => {
  res.render('register');
});

// Página de perfil
router.get('/profile', (req, res) => {
  res.render('profile');
});

export default router;
