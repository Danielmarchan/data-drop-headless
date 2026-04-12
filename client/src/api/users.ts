import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { http } from '@/lib/http';
import { type SelectRole } from '@/types';

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  roleId: string | null;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  updatedAt: string;
  role: SelectRole | null;
}

export interface UsersResponse {
  users: UserWithRole[];
  total: number;
  page: number;
  totalPages: number;
}

export function useUsers() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const page = searchParams.get('page') ?? '1';

  return useQuery({
    queryKey: ['admin', 'users', { search, page }],
    queryFn: () =>
      http
        .get<UsersResponse>('/api/users', { params: { search, page } })
        .then((r) => r.data),
  });
}
