import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/http';
import {
  type PaginatedList,
  type ViewerUploadDetailDto,
  type ViewerUploadListItem,
} from '@data-drop/api-schema';

export function useViewerUploads(datasetId: string | undefined) {
  return useQuery({
    queryKey: ['viewer', 'datasets', datasetId, 'uploads'],
    queryFn: () =>
      http
        .get<PaginatedList<ViewerUploadListItem>>(
          `/api/viewer/datasets/${datasetId}/uploads`,
          { params: { page: 1, limit: 100 } },
        )
        .then((r) => r.data),
    enabled: Boolean(datasetId),
  });
}

export function useViewerUpload(
  datasetId: string | undefined,
  uploadId: string | undefined,
) {
  return useQuery({
    queryKey: ['viewer', 'datasets', datasetId, 'uploads', uploadId],
    queryFn: () =>
      http
        .get<ViewerUploadDetailDto>(
          `/api/viewer/datasets/${datasetId}/uploads/${uploadId}`,
        )
        .then((r) => r.data),
    enabled: Boolean(datasetId) && Boolean(uploadId),
  });
}
