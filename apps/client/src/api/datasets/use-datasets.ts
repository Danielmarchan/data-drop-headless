import { useQuery } from '@tanstack/react-query';
import { type DatasetDto, type PaginatedList } from '@data-drop/api-schema';
import { http } from '@/lib/http';

export function useDatasets(search = '') {
  return useQuery({
    queryKey: ['admin', 'datasets', { search }],
    queryFn: () =>
      http
        .get<PaginatedList<DatasetDto>>('/api/datasets', { params: { search, limit: 10, page: 1 } })
        .then((r) => r.data),
  });
}
