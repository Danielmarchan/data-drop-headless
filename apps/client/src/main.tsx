import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { AllCommunityModule, ModuleRegistry } from 'ag-charts-community';

import GlobalAlertPresenter from '@/components/alert/global-alert-presenter';
import { router } from './router';
import { queryClient } from '@/lib/query-client';
import './globals.css';

ModuleRegistry.registerModules([AllCommunityModule]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GlobalAlertPresenter />
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
