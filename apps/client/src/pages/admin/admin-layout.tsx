import { Outlet, useNavigate } from 'react-router';
import { authClient } from '@/lib/auth';
import { useUserProfile } from '@/api/use-user-profile';
import TopNav from '@/components/top-nav';

const adminNavLinks = [
  { label: 'Users', href: '/admin/users' },
  { label: 'Datasets', href: '/admin/datasets' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const { data, isPending: mePending, isError } = useUserProfile();
  const isAdmin = data?.user.role?.name === 'admin';

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

  if (!isAdmin) {
    void navigate('/not-found', { replace: true });
    return null;
  }

  return (
    <div className="bg-surface flex h-screen flex-col">
      <TopNav
        logoHref="/admin"
        email={session.user.email}
        userId={data?.user.id ?? session.user.id}
        navLinks={adminNavLinks}
        secondaryLink={{ label: 'Go to Charts Viewer', href: '/datasets' }}
        canEditProfile={isAdmin}
      />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
