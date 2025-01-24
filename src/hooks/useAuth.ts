import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [state, setState] = useState<{
    user: User | null;
    loading: boolean;
    error: Error | null;
  }>({
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => setState({ user, loading: false, error: null }),
      (error) => setState((s) => ({ ...s, loading: false, error }))
    );

    return unsubscribe;
  }, []);

  return state;
}