import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';

export function useDeleteUpload(datasetId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uploadId: string) => http.delete(`/api/uploads/${uploadId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'uploads', datasetId] });
    },
  });
}
