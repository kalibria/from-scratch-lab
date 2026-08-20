import type { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.signedCookies.session !== 'authenticated') {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}
