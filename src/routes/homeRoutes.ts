import { Router } from 'express';
import path from 'path';

const router = Router();

router.get('/', (req, res) => {
  res.render('pages/index'); // Página principal
});         
router.get('/', (req, res) => {
  res.render('pages/vista');
});
export default router;
