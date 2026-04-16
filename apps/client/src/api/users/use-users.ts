import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { http } from '@/lib/http';
import { type UserDto, type PaginatedList } from '@data-drop/api-schema';

export function useUsers() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';

  return useInfiniteQuery({
    queryKey: ['admin', 'users', { search }],
    queryFn: ({ pageParam }) =>
      http
        .get<PaginatedList<UserDto>>('/api/users', { params: { search, page: pageParam, limit: 5 } })
        .then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.page < lastPage.pageInfo.totalPages
        ? lastPage.pageInfo.page + 1
        : undefined,
  });
}
