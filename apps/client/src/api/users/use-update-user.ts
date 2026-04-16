import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { type UpdateUserInput, type UserDetailDto } from '@data-drop/api-schema';

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
      http.patch<UserDetailDto>(`/api/users/${id}`, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users', id] });
    },
  });
}
