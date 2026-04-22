import { createBrowserRouter, Navigate } from 'react-router';

import LoginPage from '@/pages/login';
import AuthRedirect from '@/pages/redirect';
import ViewerDatasetsPage from '@/pages/viewer/pages/datasets';
import ViewerLayout from '@/pages/viewer/viewer-layout';
import AdminLayout from '@/pages/admin/admin-layout';
import AdminUsersPage from '@/pages/admin/pages/users/users-list';
import AdminUsersNewPage from '@/pages/admin/pages/users/user-new';
import AdminUserEditPage from '@/pages/admin/pages/users/user-edit';
import AdminDatasetsPage from '@/pages/admin/pages/datasets/datasets-list';
import AdminDatasetUploadsPage from '@/pages/admin/pages/datasets/datasets-upload';
import NotFoundPage from '@/pages/not-found';
import ViewerChartsPage from './pages/viewer/pages/charts';

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
    path: '/not-found',
    element: <NotFoundPage />,
  },
  {
    path: '/',
    element: <Navigate to="/datasets" replace />,
  },
  {
    path: '/datasets',
    element: <ViewerLayout />,
    children: [
      {
        index: true,
        element: <ViewerDatasetsPage />,
      },
      {
        path: ':datasetId/charts',
        element: <ViewerChartsPage />,
      },
      {
        path: ':datasetId/charts/:chartId',
        element: <ViewerChartsPage />,
      },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      {
        path: '/admin',
        element: <Navigate to="/admin/users" replace />,
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
    element: <Navigate to="/not-found" replace />,
  },
]);
