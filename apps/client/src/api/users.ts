import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { http } from '@/lib/http';
import { type UserDto, type PaginatedList } from '@data-drop/api-schema';

export function useUsers() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const page = searchParams.get('page') ?? '1';

  return useQuery({
    queryKey: ['admin', 'users', { search, page }],
    queryFn: () =>
      http
        .get<PaginatedList<UserDto>>('/api/users', { params: {
          search,
          page,
          limit: 10,
        } })
        .then((r) => r.data),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete(`/api/users/${id}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
