import { Link } from 'react-router';

import { type DatasetDto } from '@data-drop/api-schema';
import { ChevronRightIcon } from '@/components/icons';
import ListRow from '@/components/list-row';

type DatasetRowProps = {
  d: DatasetDto;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function DatasetRow({ d }: DatasetRowProps) {
  return (
    <Link to={`/admin/datasets/${d.id}/uploads`} className="block">
      <ListRow>
        <div className="flex-1 min-w-0">
          <span className="font-inter font-semibold text-base text-on-surface">{d.title}</span>
        </div>

        <div className="hidden sm:block sm:w-44 sm:shrink-0">
          <span className="font-inter text-sm text-on-surface-variant">{formatDate(d.createdAt)}</span>
        </div>

        <div className="w-6 shrink-0 flex items-center justify-center text-on-surface-variant/40">
          <div className="cursor-pointer">
            <ChevronRightIcon />
          </div>
        </div>
      </ListRow>
    </Link>
  );
}
