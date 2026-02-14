"use strict";
/**
 * Script para crear todas las tablas necesarias en la base de datos.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require('dotenv').config();
const { User, createTable: createUserTable } = require('../models/User');
const ProductModel = require('../models/Product');
const CartModelSetup = require('../models/Cart');
const OrderModelSetup = require('../models/Order');
const setupDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔧 Iniciando configuración de la base de datos...');
        // Crear tablas en orden correcto (por foreign keys)
        console.log('📝 Creando tabla users...');
        yield createUserTable();
        console.log('✅ Tabla users creada');
        console.log('📝 Creando tabla products...');
        yield ProductModel.createTable();
        console.log('✅ Tabla products creada');
        console.log('📝 Creando tabla cart...');
        yield CartModelSetup.createTable();
        console.log('✅ Tabla cart creada');
        console.log('📝 Creando tablas orders y order_items...');
        yield OrderModelSetup.createOrderTables();
        console.log('✅ Tablas orders y order_items creadas');
        console.log('🎉 Base de datos configurada exitosamente');
    }
    catch (error) {
        console.error('❌ Error al configurar la base de datos:', error);
        process.exit(1);
    }
});
// Ejecutar solo si se llama directamente
if (require.main === module) {
    setupDatabase();
}
module.exports = { setupDatabase };
//# sourceMappingURL=setup.js.map