// frontend/src/components/ProtectedRoute.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const authStatus = isAuthenticated();
      setIsAuthenticatedState(authStatus);

      // If not authenticated and not on login/signup pages, redirect to login
      if (!authStatus && !location.pathname.includes('/login') && !location.pathname.includes('/signup')) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Show nothing while checking authentication
  if (isAuthenticatedState === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated, render the children
  if (isAuthenticatedState) {
    return <>{children}</>;
  }

  // If not authenticated, return null (redirect happens in useEffect)
  return null;
};

export default ProtectedRoute;