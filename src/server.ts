// src/server.ts
require('dotenv').config();
import express from 'express';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import cors from 'cors';
import homeRoutes from './routes/homeRoutes';
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const port = process.env.PORT || 3000;

// CORS: permitir solo mismo origen (frontend servido por Express)
const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${port}`;
const isProduction = process.env.NODE_ENV === 'production';
const corsOrigin = isProduction ? process.env.FRONTEND_URL : frontendUrl;

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));

// Middlewares globales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views')); 
app.use(expressLayouts);
app.set('layout', 'layouts/main-layout'); 

// Archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payments', paymentRoutes);

// Web Routes (EJS)
app.use('/', homeRoutes);

// Manejo de errores centralizado
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

export default app;