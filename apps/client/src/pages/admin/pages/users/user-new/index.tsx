import { useNavigate } from 'react-router';
import { type CreateUserInput } from '@data-drop/api-schema';
import { useCreateUser } from './api/use-create-user';
import UserForm from '../components/user-form';

export default function AdminUsersNewPage() {
  const navigate = useNavigate();
  const createUser = useCreateUser();

  return (
    <UserForm
      mode="create"
      isPending={createUser.isPending}
      onSubmit={(data) => createUser.mutateAsync(data as CreateUserInput)}
      onSuccess={() => void navigate('/admin/users')}
      onCancel={() => void navigate('/admin/users')}
    />
  );
}
