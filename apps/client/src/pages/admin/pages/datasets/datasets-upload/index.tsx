import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams } from 'react-router';
import { AxiosError } from 'axios';
import { type UploadDto } from '@data-drop/api-schema';
import { useDataset } from './api/use-dataset';
import { useUploads } from './api/use-uploads';
import { useCreateUpload } from './api/use-create-upload';
import { useDeleteUpload } from './api/use-delete-upload';
import Button from '@/components/button';
import ConfirmModal from '@/components/confirm-modal';
import Spinner from '@/components/spinner';
import UploadRow from './components/upload-row';
import FileIcon from '@/components/icons/file-icon';
import FormSection from '@/components/form-section';

const COLUMN_HEADERS = [
  { label: 'Title', className: 'flex-1' },
  { label: 'Created At', className: 'w-44 shrink-0' },
  { label: '', className: 'w-24 shrink-0' },
];

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return (error.response?.data as { error?: string })?.error ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Upload failed.';
}

export default function AdminDatasetUploadsPage() {
  const { id } = useParams<{ id: string }>();

  const { data: dataset } = useDataset(id ?? '');
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useUploads(id ?? '');
  const createUpload = useCreateUpload();
  const deleteUpload = useDeleteUpload(id ?? '');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<UploadDto | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const uploads = data?.pages.flatMap((p) => p.nodes) ?? [];

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

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setTitle('');
    setError('');
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleSave = () => {
    if (!selectedFile || !id) return;
    setError('');
    createUpload.mutate(
      { datasetId: id, file: selectedFile, title },
      {
        onSuccess: () => {
          setSelectedFile(null);
          setTitle('');
        },
        onError: (err) => setError(getErrorMessage(err)),
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteUpload.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  if (!id) return null;

  return (
    <div className="container px-6 py-8 mx-auto">
      <nav className="flex items-center gap-2 mb-10">
        <Link
          to="/admin/datasets"
          className="font-inter text-sm text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Datasets
        </Link>
        <svg width="5" height="8" viewBox="0 0 5 8" fill="none" aria-hidden="true">
          <path d="M1 1l3 3-3 3" stroke="var(--color-on-surface-variant)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-inter font-medium text-sm text-on-surface">
          {dataset ? `${dataset.title} Uploads` : 'Uploads'}
        </span>
      </nav>

      <h1 className="font-manrope font-bold text-[30px] leading-9 tracking-[-0.75px] text-on-surface mb-8">
        Dataset Upload
      </h1>

      <div className="mb-10">
        {!selectedFile ? (
          <FormSection>
            <div
              className={`rounded-lg border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center py-16 px-8 ${
                dragging
                  ? 'border-primary bg-surface-low/60'
                  : 'border-outline-variant/40 bg-surface-low'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              aria-label="Drop CSV file here or click to browse"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); e.target.value = ''; }}
              />
              <div className="bg-surface-lowest rounded-xl p-4 shadow-ghost mb-4">
                <FileIcon />
              </div>
              <p className="font-manrope font-bold text-xl text-on-surface mb-1">
                Drag and Drop CSV file
              </p>
              <p className="font-inter text-sm text-on-surface-variant mb-5">
                or click to browse from your computer
              </p>
              <div className="flex items-center gap-3">
                <span className="bg-surface-high rounded-sm px-3 py-1 font-inter font-semibold text-[10px] tracking-[1px] uppercase text-on-surface-variant">
                  Max size: 10MB
                </span>
                <span className="bg-surface-high rounded-sm px-3 py-1 font-inter font-semibold text-[10px] tracking-[1px] uppercase text-on-surface-variant">
                  Format: .csv only
                </span>
              </div>
            </div>
          </FormSection>
        ) : (
          <div className="bg-surface-lowest border border-outline-variant/10 rounded-lg">
            <div className="flex items-center px-8 py-4 border-b border-outline-variant/10">
              <div className="flex-1 min-w-0">
                <p className="font-inter font-bold text-sm text-on-surface">{selectedFile.name}</p>
              </div>
              <button
                type="button"
                className="font-inter font-medium text-sm text-error hover:opacity-70 transition-opacity cursor-pointer"
                onClick={() => { setSelectedFile(null); setTitle(''); setError(''); }}
              >
                Remove
              </button>
            </div>

            <div className="px-8 py-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="upload-title"
                  className="font-inter font-semibold text-xs text-on-surface-variant tracking-[0.6px] uppercase"
                >
                  Upload Title (Optional)
                </label>
                <input
                  id="upload-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 2023 Financial Data"
                  className="h-11 w-full rounded-lg bg-surface-low px-4 font-inter text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-2 focus:ring-primary/30 border border-outline-variant/20 focus:border-primary/50 transition-colors"
                />
              </div>

              {error && (
                <p className="font-inter text-sm text-error">{error}</p>
              )}

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  className="px-6"
                  onClick={handleSave}
                  disabled={createUpload.isPending}
                >
                  {createUpload.isPending ? <Spinner pxSize={16} /> : 'Save Upload'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="font-manrope font-bold text-2xl text-on-surface mb-6">Uploads</h2>

        <div className="flex items-center gap-8 px-6 pb-3">
          {COLUMN_HEADERS.map((col) => (
            <div
              key={col.label}
              className={`${col.className} font-inter font-semibold text-xs text-on-surface-variant tracking-[0.6px] uppercase`}
            >
              {col.label}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-on-surface-variant">
            <Spinner />
          </div>
        ) : uploads.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="font-inter text-sm text-on-surface-variant">No uploads yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {uploads.map((upload) => (
              <UploadRow
                key={upload.id}
                upload={upload}
                onDelete={() => setDeleteTarget(upload)}
              />
            ))}
          </div>
        )}

        <div ref={sentinelRef} />
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-6">
            <Spinner />
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete upload"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive
        isPending={deleteUpload.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
