import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { type UpdateUploadInput, type UploadDto } from '@data-drop/api-schema';

export function useUpdateUpload(datasetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUploadInput }) =>
      http.patch<UploadDto>(`/api/admin/uploads/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'uploads', datasetId] });
    },
  });
}
