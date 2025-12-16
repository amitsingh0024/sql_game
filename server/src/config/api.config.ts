/**
 * API Configuration
 * Centralized configuration for API versioning
 */

export const API_CONFIG = {
  // Current API version
  CURRENT_VERSION: 'v1',
  
  // Supported API versions
  SUPPORTED_VERSIONS: ['v1'],
  
  // Default version (used when no version is specified)
  DEFAULT_VERSION: 'v1',
  
  // API base path
  BASE_PATH: '/api',
  
  // Get full path for a version
  getVersionPath: (version: string = API_CONFIG.CURRENT_VERSION): string => {
    return `${API_CONFIG.BASE_PATH}/${version}`;
  },
  
  // Check if version is supported
  isVersionSupported: (version: string): boolean => {
    return API_CONFIG.SUPPORTED_VERSIONS.includes(version);
  },
};

