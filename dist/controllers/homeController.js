"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vista = exports.servicios = exports.index = void 0;
const index = (req, res) => {
    res.render('pages/index');
};
exports.index = index;
const servicios = (req, res) => {
    res.render('pages/servicios');
};
exports.servicios = servicios;
// Ruta para la vista de pago
const vista = (req, res) => {
    res.render('pages/vista');
};
exports.vista = vista;
//# sourceMappingURL=homeController.js.map