import express from 'express';

const app = express();

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    diagnostics: 'standalone_api_route',
    time: new Date().toISOString() 
  });
});

export default app;
