import { logger } from '../debug/logger';
import { ErrorHandler } from '../debug/errorHandler';

export const initializeApp = async () => {
  try {
    // Initialize error handling first
    ErrorHandler.initialize();
    logger.info('Error handling initialized');

    // Initialize theme
    const isDark = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('dark', isDark);
    logger.info('Theme initialized');

    return true;
  } catch (error) {
    logger.error('App initialization failed', error);
    return false;
  }
};