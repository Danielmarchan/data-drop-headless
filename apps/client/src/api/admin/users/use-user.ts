import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { type UserDetailDto } from '@data-drop/api-schema';

export function useUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => http.get<UserDetailDto>(`/api/admin/users/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}
