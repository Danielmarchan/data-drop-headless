import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router';
import { AxiosError } from 'axios';
import { type UploadDto } from '@data-drop/api-schema';
import { useDataset } from './api/use-dataset';
import { useUploads } from './api/use-uploads';
import { useCreateUpload } from './api/use-create-upload';
import { useDeleteUpload } from './api/use-delete-upload';
import { useUpdateUpload } from './api/use-update-upload';
import Breadcrumbs from '@/components/breadcrumbs';
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
  const updateUpload = useUpdateUpload(id ?? '');

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

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!id || createUpload.isPending) return;
      setError('');
      createUpload.mutate(
        { datasetId: id, file },
        { onError: (err) => setError(getErrorMessage(err)) },
      );
    },
    [id, createUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      if (createUpload.isPending) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect, createUpload.isPending],
  );

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteUpload.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const handleToggleVisibility = (upload: UploadDto) => {
    updateUpload.mutate({ id: upload.id, data: { visible: !upload.visible } });
  };

  const handleRename = (upload: UploadDto, title: string) => {
    updateUpload.mutate({ id: upload.id, data: { title } });
  };

  if (!id) return null;

  const isUploading = createUpload.isPending;

  return (
    <div className="container px-6 py-8 mx-auto">
      <Breadcrumbs
        className="mb-10"
        items={[
          { label: 'Datasets', to: '/admin/datasets' },
          { label: dataset ? `${dataset.title} Uploads` : 'Uploads' },
        ]}
      />

      <h1 className="font-manrope font-bold text-[30px] leading-9 tracking-[-0.75px] text-on-surface mb-8">
        Dataset Upload
      </h1>

      <div className="mb-10">
        <FormSection>
          <div
            className={`relative rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center py-16 px-8 ${
              isUploading ? 'cursor-wait opacity-60' : 'cursor-pointer'
            } ${
              dragging
                ? 'border-primary bg-surface-low/60'
                : 'border-outline-variant/40 bg-surface-low'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              if (!isUploading) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (!isUploading) fileInputRef.current?.click();
            }}
            role="button"
            tabIndex={0}
            aria-disabled={isUploading}
            onKeyDown={(e) => {
              if (isUploading) return;
              if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
            }}
            aria-label="Drop CSV file here or click to browse"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              disabled={isUploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
                e.target.value = '';
              }}
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
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-low/70 rounded-lg">
                <Spinner />
              </div>
            )}
          </div>
          {error && (
            <p className="font-inter text-sm text-error mt-3">{error}</p>
          )}
        </FormSection>
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
                onToggleVisibility={() => handleToggleVisibility(upload)}
                onRename={(title) => handleRename(upload, title)}
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
