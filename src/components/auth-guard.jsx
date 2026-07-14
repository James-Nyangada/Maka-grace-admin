'use client'

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

export function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('mg_admin_token');
      
      // Allow access to login page without token
      if (pathname.includes('/login')) {
        setIsAuthorized(true);
        return;
      }

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        await api.auth.me();
        setIsAuthorized(true);
      } catch (error) {
        localStorage.removeItem('mg_admin_token');
        localStorage.removeItem('mg_admin_user');
        router.push('/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (!isAuthorized) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}
