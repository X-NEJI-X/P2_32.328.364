/**
 * Script para crear todas las tablas necesarias en la base de datos.
 */

require('dotenv').config();
const { User, createTable: createUserTable } = require('../models/User');
const ProductModel = require('../models/Product');
const CartModelSetup = require('../models/Cart');
const OrderModelSetup = require('../models/Order');

const setupDatabase = async () => {
  try {
    console.log('🔧 Iniciando configuración de la base de datos...');
    
    // Crear tablas en orden correcto (por foreign keys)
    console.log('📝 Creando tabla users...');
    await createUserTable();
    console.log('✅ Tabla users creada');
    
    console.log('📝 Creando tabla products...');
    await ProductModel.createTable();
    console.log('✅ Tabla products creada');
    
    console.log('📝 Creando tabla cart...');
    await CartModelSetup.createTable();
    console.log('✅ Tabla cart creada');
    
    console.log('📝 Creando tablas orders y order_items...');
    await OrderModelSetup.createOrderTables();
    console.log('✅ Tablas orders y order_items creadas');
    
    console.log('🎉 Base de datos configurada exitosamente');
    
  } catch (error: any) {
    console.error('❌ Error al configurar la base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar solo si se llama directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
