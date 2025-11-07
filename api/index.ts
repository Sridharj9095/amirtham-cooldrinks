import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.json({ 
    status: 'OK', 
    message: 'Amirtham Cooldrinks API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      menuItems: '/api/menu-items',
      orders: '/api/orders',
      sales: '/api/sales',
      settings: '/api/settings'
    }
  });
}

