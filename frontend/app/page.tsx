'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// This is the root page of the application.
// Its only job is to redirect the user to the correct page based on their auth state.

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // We don't want to redirect until we are sure about the auth state.
    if (!isLoading) {
      if (isAuthenticated) {
        // If the user is logged in, send them to the dashboard.
        router.replace('/dashboard');
      } else {
        // If the user is not logged in, send them to the login page.
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Display a simple loading screen while checking the auth state
  // to prevent a flash of unstyled content or incorrect redirects.
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-700">Loading...</p>
        <p className="text-sm text-gray-500">Please wait while we prepare the application.</p>
      </div>
    </div>
  );
}
