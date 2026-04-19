import { type UploadDto } from '@data-drop/api-schema';
import { EyeIcon, EyeCrossedIcon, TrashIcon } from '@/components/icons';
import Button from '@/components/button';
import ListRow from '@/components/list-row';

type UploadRowProps = {
  upload: UploadDto;
  onDelete: () => void;
  onToggleVisibility: () => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function UploadRow({ upload, onDelete, onToggleVisibility }: UploadRowProps) {
  return (
    <ListRow>
      <div className="flex-1 min-w-0">
        <p className="font-inter font-semibold text-sm text-on-surface">{upload.title}</p>
        <p className="font-inter text-xs text-on-surface-variant mt-0.5">{upload.fileName}</p>
      </div>

      <div className="w-44 shrink-0">
        <span className="font-inter text-sm text-on-surface-variant">{formatDate(upload.createdAt)}</span>
      </div>

      <div className="w-24 shrink-0 flex items-center justify-end gap-1">
        <Button
          variant="icon"
          aria-label={upload.visible ? 'Hide upload' : 'Show upload'}
          onClick={onToggleVisibility}
        >
          {upload.visible ? <EyeIcon className="w-4" /> : <EyeCrossedIcon className="w-4" />}
        </Button>
        <Button variant="icon" aria-label="Delete upload" onClick={onDelete}>
          <TrashIcon />
        </Button>
      </div>
    </ListRow>
  );
}
