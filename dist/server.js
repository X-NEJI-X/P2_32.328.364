"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const cors_1 = __importDefault(require("cors"));
const homeRoutes_1 = __importDefault(require("./routes/homeRoutes"));
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// CORS: permitir solo mismo origen (frontend servido por Express)
const frontendUrl = process.env.FRONTEND_URL || `http://localhost:${port}`;
const isProduction = process.env.NODE_ENV === 'production';
const corsOrigin = isProduction ? process.env.FRONTEND_URL : frontendUrl;
app.use((0, cors_1.default)({
    origin: corsOrigin,
    credentials: true,
}));
// Middlewares globales
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Configuración de EJS
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '../views'));
app.use(express_ejs_layouts_1.default);
app.set('layout', 'layouts/main-layout');
// Archivos estáticos
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
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
app.use('/', homeRoutes_1.default);
// Manejo de errores centralizado
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});
// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map