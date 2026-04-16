import { useParams } from 'react-router';

export default function AdminDatasetUploadsPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <main>
      <h1>Admin — Uploads for Dataset {id}</h1>
    </main>
  );
}
