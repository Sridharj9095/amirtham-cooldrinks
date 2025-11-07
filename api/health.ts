import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from './_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test database connection
    await connectDB();
    return res.json({ 
      status: 'OK', 
      message: 'Server is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(503).json({ 
      status: 'ERROR', 
      message: 'Server is running but database connection failed',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

