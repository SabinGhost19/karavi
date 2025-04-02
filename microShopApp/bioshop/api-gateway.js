// api-gateway/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// JWT Verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized - No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized - Invalid token' });
  }
};

// Routes that don't require authentication
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '',
  },
}));

app.use('/api/products', createProxyMiddleware({
  target: process.env.PRODUCTS_SERVICE_URL || 'http://products-service:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/products': '',
  },
}));

// Routes that require authentication
app.use('/api/orders', verifyToken, createProxyMiddleware({
  target: process.env.ORDERS_SERVICE_URL || 'http://orders-service:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/orders': '',
  },
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
