import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { http } from '@/lib/http';
import { type DatasetDto, type PaginatedList } from '@data-drop/api-schema';

export function useDatasets(searchOverride?: string) {
  const [searchParams] = useSearchParams();
  const search = searchOverride ?? searchParams.get('search') ?? '';

  return useInfiniteQuery({
    queryKey: ['admin', 'datasets', { search }],
    queryFn: ({ pageParam }) =>
      http
        .get<PaginatedList<DatasetDto>>('/api/datasets', { params: { search, page: pageParam, limit: 10 } })
        .then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.page < lastPage.pageInfo.totalPages
        ? lastPage.pageInfo.page + 1
        : undefined,
  });
}
