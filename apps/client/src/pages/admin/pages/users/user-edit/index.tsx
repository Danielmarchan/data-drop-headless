import { useNavigate, useParams } from 'react-router';
import { type UpdateUserInput } from '@data-drop/api-schema';
import { useUpdateUser } from './api/use-update-user';
import { useUser } from '@/pages/admin/pages/users/api/use-user';
import Button from '@/components/button';
import UserForm from '../components/user-form';

export default function AdminUserEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateUser = useUpdateUser();

  const { data: user, isLoading, isError } = useUser(id ?? '');

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <p className="font-inter text-on-surface-variant text-sm">
          Loading user...
        </p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-manrope text-on-surface text-3xl font-extrabold tracking-tight">
          Edit User
        </h1>
        <p className="font-inter text-error mt-4 text-sm">
          Unable to load this user.
        </p>
        <Button
          type="button"
          onClick={() => void navigate('/admin/users')}
          className="mt-6 px-5"
        >
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <UserForm
      mode="edit"
      defaultValues={{
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        email: user.email,
        role: user.role?.name ?? 'viewer',
        assignedDatasetIds: user.assignedDatasets.map((dataset) => dataset.id),
      }}
      isPending={updateUser.isPending}
      onSubmit={(data) =>
        updateUser.mutateAsync({ id, data: data as UpdateUserInput })
      }
      onSuccess={() => void navigate('/admin/users')}
      onCancel={() => void navigate('/admin/users')}
    />
  );
}
