import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { type UserDto } from '@data-drop/api-schema';
import { useDeleteUser } from './api/use-delete-user';
import { useUsers } from './api/use-users';
import Button from '@/components/button';
import ConfirmModal from '@/components/confirm-modal';
import AdminListLayout from '@/components/admin-list-layout';
import UserRow from './components/user-row';

const COLUMN_HEADERS = [
  { label: 'User', className: 'flex-1' },
  { label: 'Role', className: 'w-44 shrink-0' },
  { label: '', className: 'w-15 shrink-0' },
];

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useUsers();
  const deleteUser = useDeleteUser();

  const [userToDelete, setUserToDelete] = useState<UserDto | null>(null);
  const [searchValue, setSearchValue] = useState(search);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const q = e.target.value;
      setSearchValue(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams();
        if (q) params.set('search', q);
        void navigate(`?${params.toString()}`);
      }, 300);
    },
    [navigate],
  );

  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void fetchNextPage();
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  const users = data?.pages.flatMap((p) => p.nodes) ?? [];

  return (
    <AdminListLayout
      title="Users"
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search by name or email..."
      action={
        <Button
          type="button"
          size="md"
          onClick={() => void navigate('/admin/users/new')}
          className="px-5 shrink-0"
        >
          New User
        </Button>
      }
      columnHeaders={COLUMN_HEADERS}
      isLoading={isLoading}
      isEmpty={users.length === 0}
      emptyMessage="No users found."
      isFetchingNextPage={isFetchingNextPage}
      sentinelRef={sentinelRef}
      modal={
        <ConfirmModal
          open={userToDelete !== null}
          title="Delete user"
          description={`Are you sure you want to delete "${userToDelete?.name}"? This action cannot be undone.`}
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
      }
    >
      {users.map((u) => (
        <UserRow
          key={u.id}
          u={u}
          onEdit={() => void navigate(`/admin/users/${u.id}/edit`)}
          onDelete={() => setUserToDelete(u)}
        />
      ))}
    </AdminListLayout>
  );
}
