import { Link } from 'react-router';
import { type ViewerDatasetWithUploadCount } from '@data-drop/api-schema';
import { ChevronRightIcon } from '@/components/icons';
import ListRow from '@/components/list-row';

type ViewerDatasetRowProps = { d: ViewerDatasetWithUploadCount };

export default function ViewerDatasetRow({ d }: ViewerDatasetRowProps) {
  return (
    <Link to={`/datasets/${d.id}/charts`} className="block">
      <ListRow>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-inter font-semibold text-base text-on-surface">{d.title}</span>
          <span className="font-inter text-sm text-on-surface-variant mt-0.5">{d.uploadCount} {d.uploadCount === 1 ? 'Upload' : 'Uploads'}</span>
        </div>
        <div>
          <ChevronRightIcon />
        </div>
      </ListRow>
    </Link>
  );
}
