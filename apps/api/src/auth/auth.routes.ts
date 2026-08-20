import { Router } from 'express';
import { requireAuth } from './require-auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { pin } = req.body;

  if (pin !== process.env.APP_PIN) {
    return res.status(401).json({ error: 'invalid pin' });
  }

  const isProd = Boolean(process.env.WEB_ORIGIN);

  res.cookie('session', 'authenticated', {
    httpOnly: true,
    signed: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
  res.status(204).end();
});

authRouter.get('/me', requireAuth, (_req, res) => {
  res.status(204).end();
});
