import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { type UploadDto } from '@data-drop/api-schema';

type CreateUploadInput = {
  datasetId: string;
  file: File;
};

export function useCreateUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ datasetId, file }: CreateUploadInput) => {
      const form = new FormData();
      form.append('file', file);
      return http.post<UploadDto>(`/api/admin/datasets/${datasetId}/uploads`, form).then((r) => r.data);
    },
    onSuccess: (_, { datasetId }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'uploads', datasetId] });
    },
  });
}
