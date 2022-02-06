import { Request, Response, NextFunction } from 'express';

export const auth = async (req: Request, res: Response, next: NextFunction) => {

  if (!req.session.isAuth) {
    return res.json({ message: "unauthorized" })
  }
  return next();

}