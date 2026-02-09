// frontend/src/components/Navbar.tsx
'use client';

import React from 'react';
import { User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { removeAuthCookie, isAuthenticated, getCurrentUser } from '@/services/auth';

const Navbar: React.FC = () => {
  const router = useRouter();

  const [userDisplay, setUserDisplay] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      const u = getCurrentUser?.();
      if (u) setUserDisplay(u.name || u.email || null);
    } catch (e) {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    // Remove auth token
    removeAuthCookie();

    // Redirect to login page
    router.push('/login');
  };

  if (!isAuthenticated()) {
    return null; // Don't show navbar if not authenticated
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link href="/tasks">Todo App</Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/tasks" className="hover:text-gray-300">
            Tasks
          </Link>
          <div className="flex items-center space-x-3 pr-2">
            <User className="w-6 h-6 text-white" />
            <span className="text-sm">{userDisplay ?? 'User'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;