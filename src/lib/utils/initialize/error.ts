import { ErrorHandler } from '../debug/errorHandler';

export const initializeErrorHandling = () => {
  return ErrorHandler.initialize();
};