// src/server.ts
import express from 'express';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import homeRoutes from './routes/homeRoutes';

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views')); 

app.use(expressLayouts);
app.set('layout', 'layouts/main-layout'); 

app.use(express.static(path.join(__dirname, '../public')));

app.use('/', homeRoutes);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});