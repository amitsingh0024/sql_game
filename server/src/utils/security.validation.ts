/**
 * Security Validation Utilities
 * 
 * Centralized security checks for code execution
 * Validates code before it reaches language-specific engines
 */

import logger from './logger.js';

export interface SecurityValidationResult {
  safe: boolean;
  threats: string[];
  warnings: string[];
}

/**
 * Maximum code length (characters)
 */
const MAX_CODE_LENGTH = 10000;

/**
 * Maximum file size (bytes) - if file is provided
 */
const MAX_FILE_SIZE = 100 * 1024; // 100KB

/**
 * Dangerous patterns that apply to all languages
 */
const GLOBAL_DANGEROUS_PATTERNS = [
  // System commands
  /rm\s+-rf/i,
  /del\s+\/f/i,
  /format\s+/i,
  /shutdown/i,
  /reboot/i,
  
  // Network attacks
  /ddos/i,
  /port\s+scan/i,
  /sql\s+injection/i,
  
  // File system attacks
  /\.\.\/\.\./i, // Path traversal
  /\.\.\\\.\./i, // Windows path traversal
  
  // Encoding/obfuscation attempts
  /base64/i,
  /atob/i,
  /btoa/i,
  /fromCharCode/i,
  /String\.fromCharCode/i,
  
  // Memory attacks
  /buffer\s+overflow/i,
  /stack\s+overflow/i,
  
  // Process manipulation
  /kill\s+process/i,
  /taskkill/i,
  
  // Infinite loops (basic detection)
  /while\s*\(\s*true\s*\)/i,
  /for\s*\(\s*;\s*;\s*\)/i,
  
  // Resource exhaustion
  /malloc\s*\(\s*[0-9]{7,}/i, // Large memory allocation
  /new\s+Array\s*\(\s*[0-9]{7,}/i, // Large array creation
];

/**
 * Suspicious patterns (warnings, not blocked)
 */
const SUSPICIOUS_PATTERNS = [
  /eval/i,
  /exec/i,
  /compile/i,
  /reflect/i,
];

/**
 * Validate code security before execution
 */
export function validateCodeSecurity(code: string, language?: string): SecurityValidationResult {
  const threats: string[] = [];
  const warnings: string[] = [];

  // Check code length
  if (code.length > MAX_CODE_LENGTH) {
    threats.push(`Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`);
  }

  // Check for empty code
  if (!code || code.trim().length === 0) {
    threats.push('Code cannot be empty');
  }

  // Check for global dangerous patterns
  for (const pattern of GLOBAL_DANGEROUS_PATTERNS) {
    if (pattern.test(code)) {
      threats.push(`Dangerous pattern detected: ${pattern.source}`);
    }
  }

  // Check for suspicious patterns (warnings)
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(code)) {
      warnings.push(`Suspicious pattern detected: ${pattern.source}`);
    }
  }

  // Language-specific additional checks
  if (language) {
    const languageThreats = getLanguageSpecificThreats(code, language);
    threats.push(...languageThreats);
  }

  // Check for excessive whitespace (potential DoS)
  const whitespaceRatio = (code.match(/\s/g) || []).length / code.length;
  if (whitespaceRatio > 0.8) {
    warnings.push('Code contains excessive whitespace');
  }

  // Check for very long lines (potential issues)
  const lines = code.split('\n');
  const longLines = lines.filter(line => line.length > 1000);
  if (longLines.length > 0) {
    warnings.push(`Found ${longLines.length} lines exceeding 1000 characters`);
  }

  return {
    safe: threats.length === 0,
    threats,
    warnings,
  };
}

/**
 * Get language-specific security threats
 */
function getLanguageSpecificThreats(code: string, language: string): string[] {
  const threats: string[] = [];
  const normalizedLang = language.toUpperCase();

  switch (normalizedLang) {
    case 'SQL':
      // Additional SQL-specific checks
      if (/;\s*--/i.test(code)) {
        threats.push('SQL comment injection attempt detected');
      }
      if (/union\s+all\s+select/i.test(code)) {
        threats.push('SQL UNION injection attempt detected');
      }
      break;

    case 'C++':
    case 'CPP':
      // Additional C++ specific checks
      if (/#include\s*<windows\.h>/i.test(code)) {
        threats.push('Windows-specific headers not allowed');
      }
      if (/asm\s*\(/i.test(code)) {
        threats.push('Inline assembly not allowed');
      }
      break;

    case 'JAVASCRIPT':
    case 'JS':
      // Additional JavaScript specific checks
      if (/import\s+\(/i.test(code)) {
        threats.push('Dynamic imports not allowed');
      }
      if (/Proxy\s*\(/i.test(code)) {
        threats.push('Proxy usage detected (may be used for sandbox escape)');
      }
      break;

    case 'PYTHON':
      // Python-specific checks (when implemented)
      if (/import\s+os/i.test(code)) {
        threats.push('OS module import not allowed');
      }
      if (/__import__/i.test(code)) {
        threats.push('Dynamic import not allowed');
      }
      break;

    case 'JAVA':
      // Java-specific checks (when implemented)
      if (/Runtime\.getRuntime/i.test(code)) {
        threats.push('Runtime execution not allowed');
      }
      if (/ProcessBuilder/i.test(code)) {
        threats.push('ProcessBuilder not allowed');
      }
      break;
  }

  return threats;
}

/**
 * Validate and sanitize file upload
 */
export function validateFileUpload(file: Buffer | string, filename?: string): SecurityValidationResult {
  const threats: string[] = [];
  const warnings: string[] = [];

  // Check file size
  const fileSize = Buffer.isBuffer(file) ? file.length : Buffer.byteLength(file);
  if (fileSize > MAX_FILE_SIZE) {
    threats.push(`File size ${fileSize} bytes exceeds maximum of ${MAX_FILE_SIZE} bytes`);
  }

  // Check filename if provided
  if (filename) {
    // Check for dangerous extensions
    const dangerousExtensions = ['.exe', '.bat', '.sh', '.cmd', '.ps1', '.dll', '.so'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (dangerousExtensions.includes(ext)) {
      threats.push(`Dangerous file extension: ${ext}`);
    }

    // Check for path traversal in filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      threats.push('Path traversal detected in filename');
    }
  }

  // Convert to string if buffer
  const code = Buffer.isBuffer(file) ? file.toString('utf-8') : file;

  // Validate code content
  const codeValidation = validateCodeSecurity(code);
  threats.push(...codeValidation.threats);
  warnings.push(...codeValidation.warnings);

  return {
    safe: threats.length === 0,
    threats,
    warnings,
  };
}

/**
 * Detect language from code or filename
 */
export function detectLanguage(code: string, filename?: string): string | null {
  // Try to detect from filename first
  if (filename) {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    const extensionMap: Record<string, string> = {
      '.sql': 'SQL',
      '.cpp': 'C++',
      '.cxx': 'C++',
      '.cc': 'C++',
      '.js': 'JAVASCRIPT',
      '.mjs': 'JAVASCRIPT',
      '.py': 'PYTHON',
      '.java': 'JAVA',
      '.c': 'C',
    };

    if (extensionMap[ext]) {
      return extensionMap[ext];
    }
  }

  // Try to detect from code content
  // SQL detection
  if (/^\s*select\s+/i.test(code) || /^\s*with\s+/i.test(code)) {
    return 'SQL';
  }

  // C++ detection
  if (/^\s*#include\s*</.test(code) || /int\s+main\s*\(/.test(code)) {
    return 'C++';
  }

  // JavaScript detection
  if (/function\s+\w+\s*\(/.test(code) || /const\s+\w+\s*=/.test(code) || /let\s+\w+\s*=/.test(code)) {
    return 'JAVASCRIPT';
  }

  // Python detection
  if (/def\s+\w+\s*\(/.test(code) || /import\s+\w+/.test(code) || /print\s*\(/.test(code)) {
    return 'PYTHON';
  }

  // Java detection
  if (/public\s+class\s+\w+/.test(code) || /public\s+static\s+void\s+main/.test(code)) {
    return 'JAVA';
  }

  return null;
}

/**
 * Log security validation result
 */
export function logSecurityValidation(
  result: SecurityValidationResult,
  language: string,
  userId?: string
): void {
  if (!result.safe) {
    logger.warn(`Security validation failed for ${language} code`, {
      userId,
      threats: result.threats,
      warnings: result.warnings,
    });
  } else if (result.warnings.length > 0) {
    logger.info(`Security validation warnings for ${language} code`, {
      userId,
      warnings: result.warnings,
    });
  }
}

