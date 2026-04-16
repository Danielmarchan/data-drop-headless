import { type DatasetDto } from '@data-drop/api-schema';
import { ChevronRightIcon } from '@/components/icons';

type DatasetRowProps = {
  d: DatasetDto;
  onArrowClick: () => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function DatasetRow({ d, onArrowClick }: DatasetRowProps) {
  return (
    <div className="flex items-center gap-8 bg-surface-lowest rounded-lg px-6 py-6">
      <div className="flex-1 min-w-0">
        <span className="font-inter font-semibold text-sm text-on-surface">{d.title}</span>
      </div>

      <div className="w-44 shrink-0">
        <span className="font-inter text-sm text-on-surface-variant">{formatDate(d.createdAt)}</span>
      </div>

      <div className="w-6 shrink-0 flex items-center justify-center text-on-surface-variant/40">
        <div className="cursor-pointer" onClick={onArrowClick}>
          <ChevronRightIcon />
        </div>
      </div>
    </div>
  );
}
