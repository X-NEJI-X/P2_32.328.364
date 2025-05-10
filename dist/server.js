"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const homeRoutes_1 = __importDefault(require("./routes/homeRoutes"));
const app = (0, express_1.default)();
const port = 3000;
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, '../views'));
app.use(express_ejs_layouts_1.default);
app.set('layout', 'layouts/main-layout');
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/', homeRoutes_1.default);
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
//# sourceMappingURL=server.js.map