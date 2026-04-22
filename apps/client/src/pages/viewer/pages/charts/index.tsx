import { useNavigate, useParams } from 'react-router';
import Breadcrumbs from '@/components/breadcrumbs';
import Spinner from '@/components/spinner';
import { useViewerDataset } from '@/pages/viewer/api/use-viewer-dataset';
import {
  useViewerUpload,
  useViewerUploads,
} from '@/pages/viewer/api/use-viewer-uploads';
import UploadSelect from './components/upload-select';

export default function ViewerChartsPage() {
  const { datasetId, chartId } = useParams<{ datasetId: string; chartId?: string }>();
  const navigate = useNavigate();

  const { data: dataset, isLoading: datasetLoading } = useViewerDataset(datasetId);
  const { data: uploadsPage, isLoading: uploadsLoading } = useViewerUploads(datasetId);
  const { data: upload, isLoading: uploadLoading } = useViewerUpload(datasetId, chartId);

  const uploads = uploadsPage?.nodes ?? [];
  const datasetTitle = dataset?.title ?? '';

  function handleSelect(uploadId: string) {
    void navigate(`/datasets/${datasetId}/charts/${uploadId}`);
  }

  if (datasetLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 py-10">
      <Breadcrumbs
        items={[
          { label: 'Datasets', to: '/datasets' },
          { label: `${datasetTitle} - Charts` },
        ]}
        className="mb-6"
      />

      <h1 className="mb-6 font-manrope text-5xl font-extrabold tracking-tight text-on-surface">
        {datasetTitle}
      </h1>

      <div className="mb-8">
        <UploadSelect
          uploads={uploads}
          value={chartId}
          onChange={handleSelect}
          isLoading={uploadsLoading}
        />
      </div>

      {!uploadsLoading && uploads.length === 0 ? (
        <p className="font-inter text-sm text-on-surface-variant">
          No uploads available for this dataset.
        </p>
      ) : null}

      {chartId ? (
        <div className="rounded-lg bg-surface-lowest p-8 shadow-ghost">
          {uploadLoading ? (
            <Spinner />
          ) : upload ? (
            <p className="font-inter text-sm text-on-surface-variant">
              <span className="font-semibold text-on-surface">
                {upload.rows.length.toLocaleString()}
              </span>{' '}
              rows loaded — charts coming soon.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
