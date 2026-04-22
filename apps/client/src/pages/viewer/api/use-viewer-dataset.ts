import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { type ViewerDataset } from '@data-drop/api-schema';

export function useViewerDataset(datasetId: string | undefined) {
  return useQuery({
    queryKey: ['viewer', 'datasets', datasetId],
    queryFn: () =>
      http.get<ViewerDataset>(`/api/viewer/datasets/${datasetId}`).then((r) => r.data),
    enabled: Boolean(datasetId),
  });
}
