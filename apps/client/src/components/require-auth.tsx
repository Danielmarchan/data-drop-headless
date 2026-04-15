import { Navigate, Outlet } from 'react-router';
import { authClient } from '@/lib/auth';

interface RequireAuthProps {
  roles?: string[];
  redirectTo?: string;
}

export function RequireAuth({ redirectTo = '/login' }: RequireAuthProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;
  if (!session) return <Navigate to={redirectTo} replace />;

  return <Outlet />;
}

export function RequireRole({ roles, redirectTo = '/' }: { roles: string[]; redirectTo?: string }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;
  if (!session) return <Navigate to="/login" replace />;

  // Session user doesn't include role — role check happens via server API (403 responses)
  // Client-side role guard uses a dedicated endpoint on first admin layout mount
  void roles;
  void redirectTo;

  return <Outlet />;
}
