import { Outlet, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { authClient } from '@/lib/auth';
import AdminNavBar from './components/admin-nav-bar';

type AdminMeResponse = {
  user: {
    id: string;
    email: string;
    role: { name: string } | null;
  }
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const { data, isPending: mePending, isError } = useQuery({
    queryKey: ['admin-me'],
    queryFn: () => http.get<AdminMeResponse>('/api/auth/me').then((r) => r.data),
    retry: false,
    enabled: !!session,
  });

  if (sessionPending || mePending) return null;

  if (!session) {
    void navigate('/login', { replace: true });
    return null;
  }

  if (isError) {
    void navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-surface">
      <AdminNavBar email={session.user.email} userId={data?.user.id ?? session.user.id} />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
