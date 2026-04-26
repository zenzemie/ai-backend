import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5173;

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'dist')));

// Redirect all requests to index.html (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Bind to 0.0.0.0 for Render
app.listen(port, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${port}`);
});
