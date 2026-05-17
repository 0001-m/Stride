import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();

const isProd = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

if (!isProd) {
  // Dev: allow your Vite dev server to call the API.
  app.use(
    cors({
      origin: clientUrl,
      credentials: true,
    })
  );
}
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'stride-api' });
});

app.use('/api/auth', authRoutes);
// Nested task routes must register before generic /api/projects router
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/projects/:projectId/analytics', analyticsRoutes);
app.use('/api/projects', projectRoutes);

// 404 for unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Production: serve the built React app (client/dist) from the same server.
if (isProd) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientDistPath = path.resolve(__dirname, '../../client/dist');

  app.use(express.static(clientDistPath));

  // SPA fallback: let React Router handle non-API routes.
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is required in .env');
    }
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
