import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router';
import { AxiosError } from 'axios';
import { type UploadDto } from '@data-drop/api-schema';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useAlertStore } from '@/components/alert/stores/ui-alert-store';

const COLUMN_HEADERS = [
  { label: 'Title', className: 'flex-1' },
  { label: 'Created At', className: 'hidden sm:block sm:w-44 sm:shrink-0' },
  { label: '', className: 'sm:w-24 sm:shrink-0' },
];

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const uploadSchema = z.object({
  file: z
    .custom<File>((value) => value instanceof File, {
      message: 'Select a CSV file to upload.',
    })
    .refine(
      (file) => file.size <= MAX_UPLOAD_SIZE_BYTES,
      'File must be 10MB or smaller.',
    )
    .refine(
      (file) => file.name.toLowerCase().endsWith('.csv'),
      'Only CSV files are supported.',
    ),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

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
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useUploads(id ?? '');
  const createUpload = useCreateUpload();
  const deleteUpload = useDeleteUpload(id ?? '');
  const updateUpload = useUpdateUpload(id ?? '');
  const showAlert = useAlertStore((state) => state.showAlert);
  const dismissAlert = useAlertStore((state) => state.dismissAlert);
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const [dragging, setDragging] = useState(false);
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

  const submitUpload = handleSubmit(async ({ file }) => {
    if (!id || createUpload.isPending) return;

    dismissAlert();

    try {
      const upload = await createUpload.mutateAsync({ datasetId: id, file });
      reset({ file: undefined });
      showAlert({
        variant: 'success',
        title: 'Upload created successfully',
        message: `"${upload.title}" is now available in the uploads list.`,
        persistOnNavigation: true,
      });
    } catch (error) {
      showAlert({
        variant: 'error',
        title: 'Upload failed',
        message: getErrorMessage(error),
        persistOnNavigation: true,
      });
    }
  });

  const handleFileSelect = useCallback(
    async (file: File) => {
      dismissAlert();
      setValue('file', file, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      const isValid = await trigger('file');
      if (!isValid) return;

      await submitUpload();
    },
    [dismissAlert, setValue, submitUpload, trigger],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      if (createUpload.isPending) return;
      const file = e.dataTransfer.files[0];
      if (file) void handleFileSelect(file);
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
    <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8">
      <Breadcrumbs
        className="mb-10"
        items={[
          { label: 'Datasets', to: '/admin/datasets' },
          { label: dataset ? `${dataset.title} Uploads` : 'Uploads' },
        ]}
      />

      <h1 className="font-manrope text-on-surface mb-8 text-2xl leading-8 font-bold tracking-[-0.75px] sm:text-[30px] sm:leading-9">
        Dataset Upload
      </h1>

      <div className="mb-10">
        <FormSection>
          <form onSubmit={submitUpload} noValidate className="space-y-3">
            <Controller
              name="file"
              control={control}
              render={({ field: { name, onBlur, onChange, ref } }) => (
                <>
                  <input
                    ref={(element) => {
                      ref(element);
                      fileInputRef.current = element;
                    }}
                    type="file"
                    name={name}
                    accept=".csv,text/csv"
                    className="hidden"
                    disabled={isUploading}
                    onBlur={onBlur}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      onChange(file);
                      if (file) void handleFileSelect(file);
                      e.target.value = '';
                    }}
                  />

                  <div
                    className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-10 transition-colors sm:px-8 sm:py-16 ${
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
                      if (e.key === 'Enter' || e.key === ' ')
                        fileInputRef.current?.click();
                    }}
                    aria-label="Drop CSV file here or click to browse"
                  >
                    <div className="bg-surface-lowest shadow-ghost mb-4 rounded-xl p-4">
                      <FileIcon />
                    </div>
                    <p className="font-manrope text-on-surface mb-1 text-xl font-bold">
                      Drag and Drop CSV file
                    </p>
                    <p className="font-inter text-on-surface-variant mb-5 text-sm">
                      or click to browse from your computer
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="bg-surface-high font-inter text-on-surface-variant rounded-sm px-3 py-1 text-[10px] font-semibold tracking-[1px] uppercase">
                        Max size: 10MB
                      </span>
                      <span className="bg-surface-high font-inter text-on-surface-variant rounded-sm px-3 py-1 text-[10px] font-semibold tracking-[1px] uppercase">
                        Format: .csv only
                      </span>
                    </div>
                    {isUploading && (
                      <div className="bg-surface-low/70 absolute inset-0 flex items-center justify-center rounded-lg">
                        <Spinner />
                      </div>
                    )}
                  </div>
                </>
              )}
            />

            {errors.file ? (
              <p className="font-inter text-error text-sm">
                {errors.file.message}
              </p>
            ) : null}
          </form>
        </FormSection>
      </div>

      <div>
        <h2 className="font-manrope text-on-surface mb-6 text-2xl font-bold">
          Uploads
        </h2>

        <div className="hidden items-center gap-8 px-6 pb-3 sm:flex">
          {COLUMN_HEADERS.map((col) => (
            <div
              key={col.label}
              className={`${col.className} font-inter text-on-surface-variant text-xs font-semibold tracking-[0.6px] uppercase`}
            >
              {col.label}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="text-on-surface-variant flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : uploads.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="font-inter text-on-surface-variant text-sm">
              No uploads yet.
            </p>
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
