import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { http } from '@/lib/http';
import { type PaginatedList, type ViewerDatasetWithUploadCount } from '@data-drop/api-schema';

export function useViewerDatasets(searchOverride?: string) {
  const [searchParams] = useSearchParams();
  const search = searchOverride ?? searchParams.get('search') ?? '';

  return useInfiniteQuery({
    queryKey: ['viewer', 'datasets', { search }],
    queryFn: ({ pageParam }) =>
      http
        .get<PaginatedList<ViewerDatasetWithUploadCount>>('/api/viewer/datasets', {
          params: { search, page: pageParam, limit: 10 },
        })
        .then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.page < lastPage.pageInfo.totalPages
        ? lastPage.pageInfo.page + 1
        : undefined,
  });
}
