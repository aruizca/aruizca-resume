import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import { resumeRouter } from './routes/resume.js';
import { coverLetterRouter } from './routes/coverLetter.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Get current directory (for ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for React
}));

// CORS only needed for development (when webapp is served separately)
// Enable CORS by default unless explicitly in production
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
}

app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/resume', resumeRouter);
app.use('/api/cover-letter', coverLetterRouter);

// Serve static files from webapp build  
const webappDistPath = path.resolve(__dirname, '../../webapp/dist');
app.use(express.static(webappDistPath));

// Serve React app for all non-API routes (SPA fallback)
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  
  // Serve React app
  res.sendFile(path.join(webappDistPath, 'index.html'));
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Full-stack server running on port ${PORT}`);
  console.log(`📄 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Web app: http://localhost:${PORT}`);
  console.log(`🔗 API endpoints: http://localhost:${PORT}/api/*`);
});
