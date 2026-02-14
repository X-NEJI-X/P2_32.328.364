import express from "express";
import path from 'path';
import { fileURLToPath } from "url";
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = __dirname;

const app = express();
app.set("port", process.env.PORT || 5000);

app.use(express.static(path.join(APP_ROOT, "../public")));
app.use(express.json());
app.use(cookieParser());

// CORS
app.use((req, res, next) => {
    const allowedOrigins = [
        `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`,
        'http://localhost:4000',
        'http://localhost:10000'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// Rutas principales
app.get("/", (req, res) => res.sendFile(path.join(APP_ROOT, "../views/index.html")));
app.get("/products", (req, res) => res.sendFile(path.join(APP_ROOT, "../views/products.html")));
app.get("/cart", (req, res) => res.sendFile(path.join(APP_ROOT, "../views/cart.html")));
app.get("/orders", (req, res) => res.sendFile(path.join(APP_ROOT, "../views/orders.html")));
app.get("/login", (req, res) => res.sendFile(path.join(APP_ROOT, "../views/login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(APP_ROOT, "../views/register.html")));
app.get("/vistas", (req, res) => res.sendFile(path.join(APP_ROOT, "../views/index.html")));

// API Routes
app.get("/api/health", (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Mock de productos para pruebas
const mockProducts = [
    { id: 1, nombre: "Producto 1", codigo: "PROD001", precio: 29.99, descripcion: "Descripción del producto 1" },
    { id: 2, nombre: "Producto 2", codigo: "PROD002", precio: 49.99, descripcion: "Descripción del producto 2" },
    { id: 3, nombre: "Producto 3", codigo: "PROD003", precio: 19.99, descripcion: "Descripción del producto 3" }
];

app.get("/api/products", (req, res) => {
    res.json({ products: mockProducts });
});

app.get("/api/products/:codigo", (req, res) => {
    const product = mockProducts.find(p => p.codigo === req.params.codigo);
    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ product });
});

// Mock de autenticación
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    // Mock login - acepta cualquier email/password
    res.json({
        message: 'Login correcto',
        user: { id: 1, nombre: 'Usuario Test', email: email, nivel: 'usuario' },
        token: 'mock_token_12345'
    });
});

app.post("/api/auth/register", (req, res) => {
    const { nombre, email, password } = req.body;
    // Mock register
    res.json({
        message: 'Usuario registrado correctamente',
        user: { id: 1, nombre: nombre, email: email, nivel: 'usuario' },
        token: 'mock_token_12345'
    });
});

// Mock de carrito
app.get("/api/cart", (req, res) => {
    res.json({ 
        items: [],
        total: 0
    });
});

app.post("/api/cart/add", (req, res) => {
    res.json({ message: 'Producto agregado al carrito' });
});

app.get("/api/orders", (req, res) => {
    res.json({ orders: [] });
});

app.listen(app.get("port"), () => {
    console.log(`Servidor corriendo en http://localhost:${app.get("port")}`);
});
