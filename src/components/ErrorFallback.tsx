import { FallbackProps } from 'react-error-boundary';
import { AlertCircle } from 'lucide-react';

export function ErrorFallback({ error }: FallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-4 bg-destructive/10 text-destructive rounded-md max-w-md">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Une erreur est survenue</h2>
        </div>
        <p className="text-sm">{error.message}</p>
      </div>
    </div>
  );
}