import { createBrowserRouter, Navigate } from 'react-router';
import { RequireAuth } from '@/components/require-auth';

import LoginPage from '@/app/login/page';
import AuthRedirect from '@/app/redirect/page';
import HomePage from '@/app/viewer/page';
import AdminLayout from '@/app/admin/layout';
import AdminPage from '@/app/admin/page';
import AdminUsersPage from '@/app/admin/users/page';
import AdminUsersNewPage from '@/app/admin/users/new/page';
import AdminUserEditPage from '@/app/admin/users/[id]/edit/page';
import AdminDatasetsPage from '@/app/admin/datasets/page';
import AdminDatasetUploadsPage from '@/app/admin/datasets/[id]/uploads/page';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/redirect',
    element: <AuthRedirect />,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      {
        path: '/admin',
        element: <AdminPage />,
      },
      {
        path: '/admin/users',
        element: <AdminUsersPage />,
      },
      {
        path: '/admin/users/new',
        element: <AdminUsersNewPage />,
      },
      {
        path: '/admin/users/:id/edit',
        element: <AdminUserEditPage />,
      },
      {
        path: '/admin/datasets',
        element: <AdminDatasetsPage />,
      },
      {
        path: '/admin/datasets/:id/uploads',
        element: <AdminDatasetUploadsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
