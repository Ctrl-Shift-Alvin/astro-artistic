import express from 'express';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { handler } from './dist/server/entry.mjs';

const app = express();
const port = process.env.PORT || 4321;

// Serve static files from Astro's client build output
app.use(express.static(path.join(process.cwd(), 'dist', 'client')));

// Use the Astro-generated middleware
app.use(handler);

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}/`);
});
