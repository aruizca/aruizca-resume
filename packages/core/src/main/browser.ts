/**
 * Browser-compatible exports for the core package
 * 
 * This module exports only the components that can run in a browser environment,
 * excluding Node.js-specific functionality like file system operations.
 */

// Domain models (browser-compatible)
export type { Resume } from './resume/domain';
export type { JobOffer, CoverLetter } from './cover-letter/domain';

// Browser-compatible parsers
export { LinkedInZipParser } from './resume/infrastructure/parsers/LinkedInZipParser';

// JSON validation (browser-compatible)
export { JsonResumeValidator } from './resume/infrastructure/validation/JsonResumeValidator';

// Performance monitoring (browser-compatible)
export { performanceMonitor } from './shared/infrastructure/utils/performanceMonitor';

// Error types (browser-compatible)
export { 
  ValidationError, 
  APIError, 
  LinkedInParseError 
} from './shared/infrastructure/utils/errors';

// Browser-compatible Resume Generator
export { BrowserResumeGenerator } from './resume/service/BrowserResumeGenerator';
