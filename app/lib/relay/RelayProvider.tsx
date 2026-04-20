'use client';

import { useMemo } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createRelayEnvironment } from './environment';
import { useRealtimeIssues } from '@/app/hooks/useRealtimeIssues';

function RealtimeSubscriptions() {
  useRealtimeIssues();
  return null;
}

export function RelayProvider({ children }: { children: React.ReactNode }) {
  const environment = useMemo(() => createRelayEnvironment(), []);
  return (
    <RelayEnvironmentProvider environment={environment}>
      <RealtimeSubscriptions />
      {children}
    </RelayEnvironmentProvider>
  );
}
