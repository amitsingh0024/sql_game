import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { ValidationError } from '../utils/errors.js';

/**
 * Validates MongoDB ObjectId format
 */
export const validateObjectId = (paramName: string = 'id') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const id = req.params[paramName];

    if (id && !Types.ObjectId.isValid(id)) {
      return next(new ValidationError(`Invalid ${paramName} format`));
    }

    next();
  };
};

/**
 * Sanitizes request body to prevent NoSQL injection
 * Removes MongoDB operators from user input
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  const sanitize = (obj: any): any => {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        // Remove MongoDB operators
        if (key.startsWith('$')) {
          continue;
        }
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }

    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }

  if (req.query) {
    req.query = sanitize(req.query) as any;
  }

  next();
};

/**
 * Validates multiple ObjectIds from params
 */
export const validateObjectIds = (paramNames: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const paramName of paramNames) {
      const id = req.params[paramName];
      if (id && !Types.ObjectId.isValid(id)) {
        return next(new ValidationError(`Invalid ${paramName} format`));
      }
    }
    next();
  };
};

/**
 * Validates ObjectId from query parameters
 */
export const validateQueryObjectId = (paramName: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const id = req.query[paramName] as string;

    if (id && !Types.ObjectId.isValid(id)) {
      return next(new ValidationError(`Invalid ${paramName} format`));
    }

    next();
  };
};

