import { Outlet, useNavigate } from 'react-router';
import { authClient } from '@/lib/auth';
import { useUserProfile } from '@/api/use-user-profile';
import TopNav from '@/components/top-nav';
import Footer from '@/components/footer';

export default function ViewerLayout() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const { data, isPending: mePending } = useUserProfile();

  if (sessionPending) return null;

  if (!session) {
    void navigate('/login', { replace: true });
    return null;
  }

  if (mePending) return null;

  const isAdmin = data?.user.role?.name === 'admin';

  return (
    <div className="h-screen flex flex-col bg-surface-low">
      <TopNav
        logoHref="/datasets"
        email={session.user.email}
        userId={data?.user.id ?? session.user.id}
        secondaryLink={isAdmin ? { label: 'Go to Admin Dashboard', href: '/admin' } : null}
        canEditProfile={isAdmin}
      />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
