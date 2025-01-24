import { FirebaseError } from 'firebase/app';
import { Toast } from '@/components/ui/use-toast';

export const handleAuthError = (error: unknown, toast: Toast) => {
  console.error('Auth error:', error);
  
  let message = 'Une erreur est survenue lors de l\'authentification';
  
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-email':
        message = 'Adresse email invalide';
        break;
      case 'auth/user-disabled':
        message = 'Ce compte a été désactivé';
        break;
      case 'auth/user-not-found':
        message = 'Aucun compte ne correspond à cet email';
        break;
      case 'auth/wrong-password':
        message = 'Mot de passe incorrect';
        break;
      case 'auth/email-already-in-use':
        message = 'Cette adresse email est déjà utilisée';
        break;
      case 'auth/weak-password':
        message = 'Le mot de passe doit contenir au moins 6 caractères';
        break;
      case 'auth/network-request-failed':
        message = 'Erreur de connexion réseau';
        break;
      default:
        message = error.message;
    }
  }

  toast({
    title: "Erreur d'authentification",
    description: message,
    variant: "destructive"
  });
};