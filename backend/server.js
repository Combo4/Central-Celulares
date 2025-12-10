require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productsRoutes = require('./src/routes/products');
const configRoutes = require('./src/routes/config');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Central Celulares API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/products', productsRoutes);
app.use('/api/config', configRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║  Central Celulares API Server                 ║
║  Status: Running                              ║
║  Port: ${PORT}                                    ║
║  Environment: ${process.env.NODE_ENV || 'development'}              ║
║  Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5500'}  ║
╚═══════════════════════════════════════════════╝
  `);
});

module.exports = app;
