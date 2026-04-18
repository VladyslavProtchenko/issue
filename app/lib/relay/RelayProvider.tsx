'use client';

import { useMemo } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createRelayEnvironment } from './environment';

export function RelayProvider({ children }: { children: React.ReactNode }) {
  const environment = useMemo(() => createRelayEnvironment(), []);
  return (
    <RelayEnvironmentProvider environment={environment}>
      {children}
    </RelayEnvironmentProvider>
  );
}
