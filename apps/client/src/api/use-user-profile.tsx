import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { authClient } from '@/lib/auth';

type MeResponse = {
  user: {
    id: string;
    email: string;
    role: { name: string } | null;
  };
};

export function useUserProfile() {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: ['me'],
    queryFn: () => http.get<MeResponse>('/api/auth/me').then((r) => r.data),
    retry: false,
    enabled: !!session,
  });
}
