import { useInfiniteQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { type UploadDto, type PaginatedList } from '@data-drop/api-schema';

export function useUploads(datasetId: string) {
  return useInfiniteQuery({
    queryKey: ['admin', 'uploads', datasetId],
    queryFn: ({ pageParam }) =>
      http
        .get<PaginatedList<UploadDto>>(`/api/admin/datasets/${datasetId}/uploads`, {
          params: { page: pageParam, limit: 10 },
        })
        .then((r) => r.data),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.page < lastPage.pageInfo.totalPages
        ? lastPage.pageInfo.page + 1
        : undefined,
    enabled: Boolean(datasetId),
  });
}
