import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '@/lib/firebase/config';

export const initializeFirebase = () => {
  try {
    const app = initializeApp(firebaseConfig);
    getAuth(app);
    return true;
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    return false;
  }
};