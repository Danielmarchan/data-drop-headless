import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AxiosError } from 'axios';
import { type UpdateUserInput } from '@data-drop/api-schema';
import { useUpdateUser, useUser } from '@/api/admin/users';
import Button from '@/components/button';
import UserForm from '../components/user-form';

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Failed to save user.';
}

export default function AdminUserEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const updateUser = useUpdateUser();
  const [error, setError] = useState('');

  const { data: user, isLoading, isError } = useUser(id ?? '');

  if (!id) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <p className="font-inter text-sm text-on-surface-variant">Loading user...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="container mx-auto px-6 py-8">
        <h1 className="font-manrope text-3xl font-extrabold tracking-tight text-on-surface">
          Edit User
        </h1>
        <p className="mt-4 font-inter text-sm text-error">Unable to load this user.</p>
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
      error={error}
      onSubmit={(data) => {
        setError('');
        updateUser.mutate(
          { id, data: data as UpdateUserInput },
          {
            onSuccess: () => void navigate('/admin/users'),
            onError: (mutationError) => setError(getErrorMessage(mutationError)),
          },
        );
      }}
      onCancel={() => void navigate('/admin/users')}
    />
  );
}
