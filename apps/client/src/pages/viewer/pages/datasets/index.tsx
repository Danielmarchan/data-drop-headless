import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useViewerDatasets } from '@/pages/viewer/api/use-viewer-datasets';
import SearchInput from '@/components/search-input';
import Spinner from '@/components/spinner';
import ViewerDatasetRow from './components/viewer-dataset-row';

export default function ViewerDatasetsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useViewerDatasets();

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
    <div className="container px-4 sm:px-6 py-8 sm:py-12 mx-auto">
      <div className="flex flex-col gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-manrope font-extrabold text-2xl sm:text-3xl text-on-surface tracking-tight">
          Select a Dataset to View Charts
        </h1>
        <SearchInput
          value={searchValue}
          onChange={handleSearchChange}
          placeholder="Search datasets..."
          className="w-full sm:w-72 bg-surface-lowest border-surface-high"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <Spinner />
        </div>
      ) : datasets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
          <p className="font-inter text-sm">No datasets assigned to you.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {datasets.map((d) => (
            <ViewerDatasetRow key={d.id} d={d} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} />
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-6 text-on-surface-variant">
          <Spinner />
        </div>
      )}
    </div>
  );
}
