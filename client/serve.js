import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5173;

// Middleware to log requests (helps debugging blank screens)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// --- PASSWORD PROTECTION MIDDLEWARE ---
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="LeadForge Private Access"');
    return res.status(401).send('Authentication required.');
  }

  try {
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    const secretPassword = 'kali26';

    if (user === 'admin' && pass === secretPassword) {
      return next();
    }
  } catch (err) {
    console.error('Auth parsing error:', err);
  }

  res.setHeader('WWW-Authenticate', 'Basic realm="LeadForge Private Access"');
  return res.status(401).send('Invalid credentials.');
};

// Apply protection to all frontend routes
app.use(auth);

// Serve static files from the Vite build directory
// Using absolute path for safety
const distPath = path.resolve(__dirname, 'dist');
console.log(`Serving static files from: ${distPath}`);
app.use(express.static(distPath));

// Redirect all requests to index.html (for SPA routing)
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath);
});

// Bind to 0.0.0.0 for Render
app.listen(port, '0.0.0.0', () => {
  console.log(`Private LeadForge server running on port ${port}`);
});
