import express from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { handler } from './dist/server/entry.mjs';

export const LIMITER_WINDOW_MS = 10 * 1000;
export const LIMITER_MAX = 250;
export const LIMITER_API_MAX = 15;

const app = express();
const port = process.env.PORT || 4321;

const limiter = rateLimit({
  windowMs: LIMITER_WINDOW_MS,
  max: LIMITER_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {

    const now = new Date();
    const remainingTime = req.rateLimit.resetTime ? Math.ceil((req.rateLimit.resetTime.getTime() - now.getTime()) / 1000) : 0;
    res.setHeader('Retry-After', remainingTime);
    res.status(429).send('too-many-requests');
		
  }
});

const apiLimiter = rateLimit({
  windowMs: LIMITER_WINDOW_MS,
  max: LIMITER_API_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {

		const messages = ['too-many-requests', 'rate-limit-exceeded', 'slow-down', 'hold-your-horses', 'shut-the-fuck-up'];
		const message = messages[Math.floor(Math.random() * messages.length)];

    const reset = req.rateLimit.resetTime?.getTime?.() ?? Date.now() + 10_000;
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    res.setHeader("Retry-After", retryAfter);

		// Random delay to slow discourage scrapers
		setTimeout(() => {
			res.status(429).send();
		}, Math.floor(Math.random() * 300) + 200);

  },
});

app.use(limiter);
app.use('/api', apiLimiter);
console.log('Rate limiter applied.');

// Serve static files from Astro's client build output
app.use(express.static(path.join(process.cwd(), 'dist', 'client')));

// Use the Astro-generated middleware
app.use(handler);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}/`);
});
