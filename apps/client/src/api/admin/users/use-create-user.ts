import { useMutation, useQueryClient } from '@tanstack/react-query';
import { http } from '@/lib/http';
import { type CreateUserInput, type UserDetailDto } from '@data-drop/api-schema';

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      http.post<UserDetailDto>('/api/admin/users', data).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
