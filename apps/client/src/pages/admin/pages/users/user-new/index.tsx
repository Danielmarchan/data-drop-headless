import { useState } from 'react';
import { useNavigate } from 'react-router';
import { type CreateUserInput } from '@data-drop/api-schema';
import { AxiosError } from 'axios';
import { useCreateUser } from './api/use-create-user';
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

export default function AdminUsersNewPage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();
  const [error, setError] = useState('');

  return (
    <UserForm
      mode="create"
      isPending={createUser.isPending}
      error={error}
      onSubmit={(data) => {
        setError('');
        createUser.mutate(data as CreateUserInput, {
          onSuccess: () => void navigate('/admin/users'),
          onError: (mutationError) => setError(getErrorMessage(mutationError)),
        });
      }}
      onCancel={() => void navigate('/admin/users')}
    />
  );
}
