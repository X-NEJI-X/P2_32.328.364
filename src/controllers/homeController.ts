import { Request, Response } from 'express';

export const index = (req: Request, res: Response) => {
  res.render('pages/index');
};

export const servicios = (req: Request, res: Response) => {
  res.render('pages/servicios');
};
// Ruta para la vista de pago
export const vista = (req: Request, res: Response) => {
  res.render('pages/vista');
};
