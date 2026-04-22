import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useDatasets } from '@/pages/admin/api/use-datasets';
import AdminListLayout from '@/components/admin-list-layout';
import DatasetRow from './components/dataset-row';

const COLUMN_HEADERS = [
  { label: 'Title', className: 'flex-1' },
  { label: 'Created At', className: 'w-44 shrink-0' },
  { label: '', className: 'w-6 shrink-0' },
];

export default function AdminDatasetsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useDatasets();

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

  const datasets = data?.pages.flatMap((p) => p.nodes) ?? [];

  return (
    <AdminListLayout
      title="Datasets"
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search datasets..."
      columnHeaders={COLUMN_HEADERS}
      isLoading={isLoading}
      isEmpty={datasets.length === 0}
      emptyMessage="No datasets found."
      isFetchingNextPage={isFetchingNextPage}
      sentinelRef={sentinelRef}
    >
      {datasets.map((d) => (
        <DatasetRow
          key={d.id}
          d={d}
        />
      ))}
    </AdminListLayout>
  );
}
