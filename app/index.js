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
app.get("/profile", (req, res) => res.sendFile(path.join(APP_ROOT, "../views/profile.ejs")));
app.get("/vistas", (req, res) => res.sendFile(path.join(APP_ROOT, "../views/index.html")));

// API Routes
app.get("/api/health", (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Mock de espacios para pruebas
let mockProducts = [
    { id: 1, nombre: "Salón Aurora", codigo: "SALON001", precio: 150.00, descripcion: "Salón elegante con capacidad para 150 personas. Ideal para bodas y eventos corporativos.", stock: 1 },
    { id: 2, nombre: "Jardín Central", codigo: "JARDIN001", precio: 200.00, descripcion: "Jardín al aire libre con decoración natural. Perfecto para celebraciones al atardecer.", stock: 1 },
    { id: 3, nombre: "Terraza Skyline", codigo: "TERRAZA001", precio: 180.00, descripcion: "Terraza con vista panorámica de la ciudad. Ambiente moderno para eventos exclusivos.", stock: 1 },
    { id: 4, nombre: "Salón Cristal", codigo: "SALON002", precio: 120.00, descripcion: "Salón luminoso con paredes de cristal. Excelente para conferencias y reuniones.", stock: 1 },
    { id: 5, nombre: "Casa de Campo", codigo: "CAMPO001", precio: 250.00, descripcion: "Espacio rústico con áreas verdes y zona de BBQ. Ideal para eventos familiares.", stock: 1 },
    { id: 6, nombre: "Auditorio Premium", codigo: "AUD001", precio: 300.00, descripcion: "Auditorio equipado con sonido profesional y proyector. Para charlas, lanzamientos y presentaciones.", stock: 1 },
    { id: 7, nombre: "Salón Marfil", codigo: "SALON003", precio: 140.00, descripcion: "Salón clásico con decoración neutra. Perfecto para eventos formales.", stock: 1 },
    { id: 8, nombre: "Piscina & Lounge", codigo: "PISCINA001", precio: 220.00, descripcion: "Área de piscina con lounge y bar. Para fiestas privadas y celebraciones.", stock: 1 },
    { id: 9, nombre: "Sala Ejecutiva", codigo: "EJEC001", precio: 90.00, descripcion: "Sala privada para reuniones ejecutivas. Incluye proyector y coffee break.", stock: 1 },
    { id: 10, nombre: "Galería Urbana", codigo: "GALERIA001", precio: 160.00, descripcion: "Espacio tipo galería para exposiciones, cócteles y eventos culturales.", stock: 1 }
];

// Mock de usuarios para pruebas
let mockUsers = [
    { id: 1, nombre: "Admin User", email: "admin@test.com", password: "admin123", nivel: "admin" },
    { id: 2, nombre: "Test User", email: "user@test.com", password: "user123", nivel: "usuario" }
];

app.get("/api/products", (req, res) => {
    res.json({ products: mockProducts });
});

// Middleware para verificar si es admin
function isAdmin(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Debes iniciar sesión como admin para agregar espacios' });
    }
    
    // Extraer userId del token (mock)
    const userId = token.replace('mock_token_', '');
    const user = mockUsers.find(u => u.id === parseInt(userId));
    
    if (!user || user.nivel !== 'admin') {
        return res.status(403).json({ error: 'Debes iniciar sesión como admin para agregar espacios' });
    }
    
    req.user = user;
    next();
}

// Crear producto (solo admin)
app.post("/api/products", isAdmin, (req, res) => {
    const { nombre, codigo, precio, descripcion, stock = 10 } = req.body;
    
    // Validaciones
    if (!nombre || !codigo || !precio) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, codigo, precio' });
    }
    
    if (precio <= 0) {
        return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }
    
    // Verificar si el código ya existe
    if (mockProducts.find(p => p.codigo === codigo)) {
        return res.status(400).json({ error: 'El código del espacio ya existe' });
    }
    
    // Crear nuevo producto
    const newProduct = {
        id: mockProducts.length + 1,
        nombre,
        codigo,
        precio: parseFloat(precio),
        descripcion: descripcion || '',
        stock: parseInt(stock)
    };
    
    mockProducts.push(newProduct);
    
    res.status(201).json({
        message: 'Espacio creado exitosamente',
        product: newProduct
    });
});

// Actualizar producto (solo admin)
app.put("/api/products/:id", isAdmin, (req, res) => {
    const { id } = req.params;
    const { nombre, codigo, precio, descripcion, stock } = req.body;
    
    const productIndex = mockProducts.findIndex(p => p.id === parseInt(id));
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Validaciones
    if (precio <= 0) {
        return res.status(400).json({ error: 'El precio debe ser mayor a 0' });
    }
    
    // Actualizar producto
    const updatedProduct = {
        ...mockProducts[productIndex],
        ...(nombre && { nombre }),
        ...(codigo && { codigo }),
        ...(precio && { precio: parseFloat(precio) }),
        ...(descripcion !== undefined && { descripcion }),
        ...(stock !== undefined && { stock: parseInt(stock) })
    };
    
    mockProducts[productIndex] = updatedProduct;
    
    res.json({
        message: 'Producto actualizado exitosamente',
        product: updatedProduct
    });
});

// Eliminar producto (solo admin)
app.delete("/api/products/:id", isAdmin, (req, res) => {
    const { id } = req.params;
    
    const productIndex = mockProducts.findIndex(p => p.id === parseInt(id));
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    const deletedProduct = mockProducts.splice(productIndex, 1)[0];
    
    res.json({
        message: 'Producto eliminado exitosamente',
        product: deletedProduct
    });
});

// Obtener usuario actual (para verificar si es admin)
app.get("/api/auth/me", (req, res) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    const userId = token.replace('mock_token_', '');
    const user = mockUsers.find(u => u.id === parseInt(userId));
    
    if (!user) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({
        user: {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            nivel: user.nivel
        }
    });
});

// Ver producto por código
app.get("/api/products/:codigo", (req, res) => {
    const product = mockProducts.find(p => p.codigo === req.params.codigo);
    if (!product) {
        return res.status(404).json({ error: 'Espacio no encontrado' });
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
