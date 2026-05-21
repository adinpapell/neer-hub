/**
 * Neer Hub — Express Server.
 * Serves the API and static frontend files.
 * Auto-detects PostgreSQL (cloud) or JSON file (local).
 */
import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './server/routes.js';
import { initDB } from './server/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use(apiRoutes);

// Serve built frontend in production
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback — serve index.html for any non-API route
app.get('/{*splat}', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  }
});

// Initialize database then start server
async function start() {
  await initDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  🩷 Neer Hub server running at:`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);

    import('os').then(os => {
      const nets = os.networkInterfaces();
      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          if (net.family === 'IPv4' && !net.internal) {
            console.log(`  ➜  Network: http://${net.address}:${PORT}/`);
          }
        }
      }
      console.log('');
    });
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
