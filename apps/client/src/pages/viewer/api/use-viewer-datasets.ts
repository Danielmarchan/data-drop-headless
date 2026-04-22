import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { type ViewerDatasetWithUploadCount } from '@data-drop/api-schema';

export function useViewerDatasets() {
  return useQuery({
    queryKey: ['viewer', 'datasets'],
    queryFn: () =>
      http.get<ViewerDatasetWithUploadCount[]>('/api/viewer/datasets').then((r) => r.data),
  });
}
