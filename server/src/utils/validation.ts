import { Types } from 'mongoose';
import { ValidationError } from './errors.js';

/**
 * Validates if a string is a valid MongoDB ObjectId
 */
export function isValidObjectId(id: string | undefined | null): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return Types.ObjectId.isValid(id) && new Types.ObjectId(id).toString() === id;
}

/**
 * Validates and converts string to ObjectId
 * Throws ValidationError if invalid
 */
export function validateAndConvertObjectId(id: string, fieldName: string = 'id'): Types.ObjectId {
  if (!isValidObjectId(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`);
  }
  return new Types.ObjectId(id);
}

/**
 * Validates an array of ObjectId strings
 */
export function validateObjectIdArray(ids: string[], fieldName: string = 'ids'): Types.ObjectId[] {
  if (!Array.isArray(ids)) {
    throw new ValidationError(`${fieldName} must be an array`);
  }

  return ids.map((id, index) => {
    if (!isValidObjectId(id)) {
      throw new ValidationError(`Invalid ${fieldName}[${index}] format`);
    }
    return new Types.ObjectId(id);
  });
}

/**
 * Sanitizes string input to prevent injection
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove null bytes and trim
  return input.replace(/\0/g, '').trim();
}

/**
 * Validates MongoDB query operators are not in user input
 */
export function hasMongoOperator(obj: any): boolean {
  if (obj === null || obj === undefined) {
    return false;
  }

  if (Array.isArray(obj)) {
    return obj.some(hasMongoOperator);
  }

  if (typeof obj === 'object') {
    for (const key in obj) {
      if (key.startsWith('$')) {
        return true;
      }
      if (hasMongoOperator(obj[key])) {
        return true;
      }
    }
  }

  return false;
}

