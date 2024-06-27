const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api', createProxyMiddleware({
  target: 'https://firebasestorage.googleapis.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // remove base path
  },
}));

app.listen(3000, () => {
  console.log('Proxy server running on http://localhost:5173');
});