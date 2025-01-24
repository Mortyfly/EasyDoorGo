import { toast } from '@/components/ui/use-toast';
import { logger } from './debug/logger';
import { ErrorTracker } from './debug/errorTracker';

export const handleGlobalError = (error: Error | ErrorEvent | unknown) => {
  // Track the error with context
  const errorInfo = ErrorTracker.track(error, {
    action: 'global_error_handler'
  });

  // Log detailed error information
  logger.error('Global error caught', errorInfo);

  // Handle the error as before
  if (
    error instanceof Error && 
    (error.message === 'Script error.' || error.message === 'ResizeObserver loop limit exceeded')
  ) {
    logger.debug('Ignored known error', { message: error.message });
    return;
  }

  let errorMessage = 'Une erreur inattendue est survenue';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }

  if (errorMessage !== 'Script error.' && errorMessage !== 'ResizeObserver loop limit exceeded') {
    try {
      toast({
        title: "Une erreur est survenue",
        description: errorMessage,
        variant: "destructive",
      });
    } catch (e) {
      logger.error('Failed to show error toast', e);
    }
  }
};