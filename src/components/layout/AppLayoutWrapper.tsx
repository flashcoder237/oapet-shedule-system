'use client';

import { useState, useEffect } from 'react';
import AppLayout from './AppLayout';
import { LoadingSpinner } from '@/components/ui/loading';

interface AppLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading on server and during hydration
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  // Only render AppLayout on client
  return <AppLayout>{children}</AppLayout>;
}