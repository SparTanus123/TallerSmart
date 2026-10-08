import React from 'react';
import { GlobalProvider } from '@/lib/context';
import { ToastProvider } from '@/components/ui/primitives';
import Shell from '@/components/Shell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <GlobalProvider>
      <ToastProvider>
        <Shell>{children}</Shell>
      </ToastProvider>
    </GlobalProvider>
  );
}
