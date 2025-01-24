import { useState } from 'react';
import { LoginForm } from './auth/LoginForm';
import { SignupForm } from './auth/SignupForm';

export function AuthSection() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="mt-20 px-4">
      <div className="w-full max-w-md mx-auto">
        {showSignup ? (
          <SignupForm onBackToLogin={() => setShowSignup(false)} />
        ) : (
          <LoginForm onSignupClick={() => setShowSignup(true)} />
        )}
      </div>
    </div>
  );
}