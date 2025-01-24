import { logger } from './logger';
import { ErrorTracker } from './errorTracker';

export class ErrorHandler {
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return true;

    try {
      // Handle uncaught errors
      window.onerror = (message, source, lineno, colno, error) => {
        if (this.shouldIgnoreError(message)) {
          logger.debug('Ignored known error', { message });
          return true;
        }

        ErrorTracker.track(error || message, {
          action: 'uncaught_error',
          data: { source, lineno, colno }
        });
        return false;
      };

      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        if (!this.shouldIgnoreError(event.reason?.message)) {
          ErrorTracker.track(event.reason, { action: 'unhandled_rejection' });
        }
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      logger.error('Failed to initialize error handling', error);
      return false;
    }
  }

  private static shouldIgnoreError(message?: string): boolean {
    if (!message) return false;

    const ignoredPatterns = [
      'Script error.',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed',
      'Loading chunk',
      'Failed to load resource',
      'Network request failed'
    ];

    return ignoredPatterns.some(pattern => 
      message.toLowerCase().includes(pattern.toLowerCase())
    );
  }
}