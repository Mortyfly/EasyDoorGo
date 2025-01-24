import { Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/providers/AuthProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { TutorialProvider } from '@/components/tutorial/TutorialProvider';
import { AppContent } from '@/components/AppContent';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthProvider>
        <ThemeProvider>
          <TutorialProvider>
            <AppContent />
            <Toaster />
          </TutorialProvider>
        </ThemeProvider>
      </AuthProvider>
    </Suspense>
  );
}