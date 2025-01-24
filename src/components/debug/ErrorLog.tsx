import { useState } from 'react';
import { logger } from '@/lib/utils/debug/logger';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ErrorLog() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const showLogs = () => {
    setLogs(logger.getLogs());
    setIsVisible(true);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={showLogs}
      >
        Show Error Logs
      </Button>

      {isVisible && (
        <div className="fixed inset-4 bg-background border rounded-lg shadow-lg z-50 flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Error Logs</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              Close
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {logs.join('\n\n')}
            </pre>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}