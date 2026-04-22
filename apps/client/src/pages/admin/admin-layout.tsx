import { Outlet, useNavigate } from 'react-router';
import { authClient } from '@/lib/auth';
import { useUserProfile } from '@/api/use-user-profile';
import TopNav from '@/components/top-nav';
import AdminNavLinks from './components/admin-nav-links';

export default function AdminLayout() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const { data, isPending: mePending, isError } = useUserProfile();

  if (sessionPending) return null;

  if (!session) {
    void navigate('/login', { replace: true });
    return null;
  }

  if (mePending) return null;

  if (isError) {
    void navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-surface">
      <TopNav
        logoHref="/admin"
        email={session.user.email}
        userId={data?.user.id ?? session.user.id}
        navLinks={<AdminNavLinks />}
        secondaryLink={{ label: 'Go to Charts Viewer', href: '/datasets' }}
      />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
