import { Router, Request, Response } from 'express';
import database from '../config/database.js';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  const dbStatus = database.getConnectionStatus();
  
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'connected' : 'disconnected',
    },
  });
});

router.get('/info', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'Reality Patch: SQL Game API',
      version: '1.0.0',
      apiVersion: 'v1',
      environment: process.env.NODE_ENV || 'development',
      endpoints: {
        v1: '/api/v1',
      },
    },
  });
});

export default router;

