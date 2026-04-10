import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { authClient } from '@/lib/auth';

export default function AuthRedirect() {
  const navigate = useNavigate();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const { data, isPending: rolePending, isError } = useQuery({
    queryKey: ['redirect-me'],
    queryFn: () =>
      http.get<{ user: { role: { name: string } | null } }>('/api/admin/me').then((r) => r.data),
    retry: false,
    enabled: !!session,
  });

  useEffect(() => {
    if (sessionPending || rolePending) return;
    if (!session) {
      void navigate('/login', { replace: true });
      return;
    }
    if (isError) {
      // Not an admin — send to viewer home
      void navigate('/', { replace: true });
      return;
    }
    if (data) {
      if (data.user.role?.name === 'admin') {
        void navigate('/admin', { replace: true });
      } else {
        void navigate('/', { replace: true });
      }
    }
  }, [session, sessionPending, rolePending, data, isError, navigate]);

  return null;
}
