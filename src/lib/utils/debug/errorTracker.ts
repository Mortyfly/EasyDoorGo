import { logger } from './logger';

interface ErrorContext {
  component?: string;
  action?: string;
  data?: any;
}

export class ErrorTracker {
  static track(error: unknown, context: ErrorContext = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      type: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context
      }
    };

    logger.error('Error tracked', errorInfo);
    return errorInfo;
  }
}