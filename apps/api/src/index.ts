import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './auth/auth.routes.js';
import { requireAuth } from './auth/require-auth.middleware.js';
import { phrasesRouter } from './phrases/phrases.routes.js';
import { sessionsRouter } from './sessions/sessions.routes.js';
import { drillRouter } from './drill/drill.routes.js';
import { freeTalkRouter } from './free-talk/free-talk.routes.js';
import { statsRouter } from './stats/stats.routes.js';
import { errorHandler } from './error-handler.middleware.js';

const app = express();

app.use(cors({ origin: process.env.WEB_ORIGIN ?? /^http:\/\/localhost:\d+$/, credentials: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use('/auth', authRouter);
app.use('/phrases', requireAuth, phrasesRouter);
app.use('/sessions', requireAuth, sessionsRouter);
app.use('/drill', requireAuth, drillRouter);
app.use('/free-talk', requireAuth, freeTalkRouter);
app.use('/stats', requireAuth, statsRouter);

app.use(errorHandler);

const port = process.env.PORT ?? 3000;
app.listen(port, () => console.log(`api listening on ${port}`));
