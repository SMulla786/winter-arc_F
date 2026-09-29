import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './queryClient';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#121216',
            color: '#F5F5F5',
            border: '1px solid #28282F',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#22C55E',
              secondary: '#121216',
            },
          },
          error: {
            iconTheme: {
              primary: '#D51F2A',
              secondary: '#121216',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
};
