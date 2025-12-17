import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { env } from './config/env.js';
import { API_CONFIG } from './config/api.config.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { sanitizeInput } from './middleware/security.middleware.js';
import logger from './utils/logger.js';

// Routes
import healthRoutes from './routes/health.routes.js';
import v1Routes from './routes/v1/index.js';

const app: Express = express();

// Trust proxy - Important for rate limiting and security behind reverse proxy
app.set('trust proxy', 1);

// Security middleware - Enhanced Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding if needed
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-API-Version'],
  maxAge: 86400, // 24 hours
}));

// Input sanitization middleware (must be before body parsing)
app.use(sanitizeInput);

// Body parsing middleware - Reduced limit for security
app.use(express.json({ 
  limit: '1mb', // Reduced from 10mb for security
  strict: true, // Only parse arrays and objects
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb', // Reduced from 10mb for security
  parameterLimit: 50, // Limit number of parameters
}));

// Compression
app.use(compression());

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));
}

// Rate limiting - applies to all /api routes
app.use('/api/', apiLimiter);

// Health check routes (unversioned - system routes)
app.use('/api', healthRoutes);

// API Versioning
// Add version info to response headers for all versioned routes
app.use(API_CONFIG.getVersionPath(), (_req, res, next) => {
  res.setHeader('X-API-Version', API_CONFIG.CURRENT_VERSION);
  next();
});

// API v1 routes
app.use(API_CONFIG.getVersionPath('v1'), v1Routes);


// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export default app;

