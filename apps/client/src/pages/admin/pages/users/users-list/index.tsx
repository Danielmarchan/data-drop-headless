import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { type UserDto } from '@data-drop/api-schema';
import { useDeleteUser, useUsers } from '@/api/users';
import Button from '@/components/button';
import SearchInput from '@/components/search-input';
import ConfirmModal from '@/components/confirm-modal';
import UserRow from './components/user-row';
import Pagination from './components/pagination';

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const { data, isLoading } = useUsers();
  const deleteUser = useDeleteUser();

  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get('search') as string) ?? '';
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    void navigate(`?${params.toString()}`);
  }

  const users = data?.nodes ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.pageInfo?.totalPages ?? 1;
  const safePage = data?.pageInfo?.page ?? page;

  return (
    <div className="container px-6 py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-manrope font-extrabold text-3xl text-on-surface tracking-tight">
          Users
        </h1>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit}>
            <SearchInput
              name="search"
              defaultValue={search}
              placeholder="Search by name or email..."
              className="w-72 bg-surface-lowest"
            />
          </form>
          <Button
            type="button"
            size="md"
            onClick={() => void navigate('/admin/users/new')}
            className="px-5 shrink-0"
          >
            New User
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-8 px-6 pb-3">
          <div className="flex-1 font-inter font-semibold text-xs text-on-surface-variant tracking-[0.6px] uppercase">
            User
          </div>
          <div className="w-44 shrink-0 font-inter font-semibold text-xs text-on-surface-variant tracking-[0.6px] uppercase">
            Role
          </div>
          <div className="w-15 shrink-0" />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <p className="font-inter text-sm">Loading...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <p className="font-inter text-sm">No users found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <UserRow
                key={u.id}
                u={u}
                onEdit={() => void navigate(`/admin/users/${u.id}/edit`)}
                onDelete={() => setUserToDelete(u)}
              />
            ))}
          </div>
        )}

        {total > 0 && (
          <Pagination page={safePage} totalPages={totalPages} total={total} search={search} />
        )}
      </div>

      <ConfirmModal
        open={userToDelete !== null}
        title="Delete user"
        description={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isPending={deleteUser.isPending}
        onConfirm={() => {
          if (userToDelete) {
            deleteUser.mutate(userToDelete.id, {
              onSuccess: () => setUserToDelete(null),
            });
          }
        }}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
}
