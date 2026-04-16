import { Outlet, useNavigate } from 'react-router';
import { authClient } from '@/lib/auth';

export default function ViewerLayout() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return null;

  if (!session) {
    void navigate('/login', { replace: true });
    return null;
  }

  return <Outlet />;
}
