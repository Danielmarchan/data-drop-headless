import { useParams } from 'react-router';

export default function AdminUserEditPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <main>
      <h1>Admin — Edit User {id}</h1>
    </main>
  );
}
