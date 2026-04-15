import { useQuery } from '@tanstack/react-query';
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
