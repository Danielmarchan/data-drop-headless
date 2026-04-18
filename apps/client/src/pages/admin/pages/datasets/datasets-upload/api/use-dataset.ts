import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { type DatasetDto } from '@data-drop/api-schema';

export function useDataset(id: string) {
  return useQuery({
    queryKey: ['admin', 'datasets', id],
    queryFn: () => http.get<DatasetDto>(`/api/admin/datasets/${id}`).then((r) => r.data),
    enabled: Boolean(id),
  });
}
