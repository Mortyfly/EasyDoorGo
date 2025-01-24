import { setupGlobalErrorHandling } from './errorUtils';
import { setupChart } from './chartSetup';

export const initializeApp = async () => {
  try {
    // Setup error handling first
    setupGlobalErrorHandling();

    // Initialize Chart.js
    await Promise.resolve(setupChart());

    return true;
  } catch (error) {
    console.error('App initialization failed:', error);
    return false;
  }
};