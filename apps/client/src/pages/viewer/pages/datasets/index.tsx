import { useViewerDatasets } from '@/pages/viewer/api/use-viewer-datasets';
import Spinner from '@/components/spinner';
import ViewerDatasetRow from './components/viewer-dataset-row';

export default function ViewerDatasetsPage() {
  const { data, isLoading } = useViewerDatasets();
  const datasets = data ?? [];

  return (
    <div className="container px-6 py-12 mx-auto">
      <h1 className="font-manrope font-extrabold text-3xl text-on-surface tracking-tight mb-8">
        Select a Dataset to View Charts
      </h1>

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
    </div>
  );
}
