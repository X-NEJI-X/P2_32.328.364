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
let mockProducts = [
    { id: 1, nombre: "Producto 1", codigo: "PROD001", precio: 29.99, descripcion: "Descripción del producto 1", stock: 10 },
    { id: 2, nombre: "Producto 2", codigo: "PROD002", precio: 49.99, descripcion: "Descripción del producto 2", stock: 5 },
    { id: 3, nombre: "Producto 3", codigo: "PROD003", precio: 19.99, descripcion: "Descripción del producto 3", stock: 15 },
    { id: 4, nombre: "Producto 4", codigo: "PROD004", precio: 39.99, descripcion: "Descripción del producto 4", stock: 8 },
    { id: 5, nombre: "Producto 5", codigo: "PROD005", precio: 59.99, descripcion: "Descripción del producto 5", stock: 12 }
];

// Mock de usuarios para pruebas
let mockUsers = [
    { id: 1, nombre: "Admin User", email: "admin@test.com", password: "$2b$10$92IXUNpkjO0rOQ5byMi.Y4Rk9jgPX1fIe3", nivel: "admin" },
    { id: 2, nombre: "Test User", email: "user@test.com", password: "$2b$10$92IXUNpkjO0rOQ5byMi.Y4Rk9jgPX1fIe3", nivel: "usuario" }
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
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    // Mock password verification (en producción usarías bcrypt)
    if (user.password !== password) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    
    res.json({
        message: 'Login correcto',
        user: { id: user.id, nombre: user.nombre, email: user.email, nivel: user.nivel },
        token: 'mock_token_' + user.id
    });
});

app.post("/api/auth/register", (req, res) => {
    const { nombre, email, password, nivel = 'usuario' } = req.body;
    
    // Verificar si el email ya existe
    if (mockUsers.find(u => u.email === email)) {
        return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Crear nuevo usuario (en producción usarías bcrypt)
    const newUser = {
        id: mockUsers.length + 1,
        nombre,
        email,
        password: password, // En producción: await bcrypt.hash(password, 10)
        nivel
    };
    
    mockUsers.push(newUser);
    
    res.json({
        message: 'Usuario registrado correctamente',
        user: { id: newUser.id, nombre: newUser.nombre, email: newUser.email, nivel: newUser.nivel },
        token: 'mock_token_' + newUser.id
    });
});

// Carrito API (localStorage en frontend)
app.get("/api/cart", (req, res) => {
    // El carrito se manejará en el frontend con localStorage
    res.json({ message: 'Carrito manejado en frontend' });
});

app.post("/api/cart/add", (req, res) => {
    const { product_id, cantidad = 1 } = req.body;
    const product = mockProducts.find(p => p.id === parseInt(product_id));
    
    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    if (product.stock < cantidad) {
        return res.status(400).json({ error: 'Stock insuficiente' });
    }
    
    // Actualizar stock (simulación)
    product.stock -= cantidad;
    
    res.json({ 
        message: 'Producto agregado al carrito',
        product: { ...product, stock: product.stock }
    });
});

// Órdenes API
let mockOrders = [];

app.get("/api/orders", (req, res) => {
    res.json({ orders: mockOrders });
});

app.post("/api/orders", (req, res) => {
    const { items, total, payment_intent_id } = req.body;
    
    const newOrder = {
        id: mockOrders.length + 1,
        items,
        total,
        payment_intent_id,
        estado: 'pagado',
        created_at: new Date().toISOString()
    };
    
    mockOrders.push(newOrder);
    
    res.json({
        message: 'Orden creada exitosamente',
        order: newOrder
    });
});

// Stripe checkout session (simulado)
app.post("/api/payments/create-checkout-session", (req, res) => {
    const { success_url, cancel_url } = req.body;
    
    // Simulación de checkout session
    const mockSession = {
        sessionId: 'mock_session_' + Date.now(),
        url: `${success_url}?payment_id=mock_payment_${Date.now()}`
    };
    
    res.json({
        sessionId: mockSession.sessionId,
        url: mockSession.url
    });
});

app.post("/api/payments/confirm", (req, res) => {
    const { payment_id } = req.body;
    
    // Simulación de confirmación de pago
    res.json({
        message: 'Pago confirmado exitosamente',
        payment_id,
        redirectUrl: '/'
    });
});

app.listen(app.get("port"), () => {
    console.log(`Servidor corriendo en http://localhost:${app.get("port")}`);
});
