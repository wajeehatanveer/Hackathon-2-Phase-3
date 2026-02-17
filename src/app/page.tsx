'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the tasks page
    router.push('/tasks');
  }, [router]);

  return null; // Render nothing since we're redirecting
};

export default HomePage;