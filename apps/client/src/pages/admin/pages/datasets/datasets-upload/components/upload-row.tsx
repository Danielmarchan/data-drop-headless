import { useEffect, useRef, useState } from 'react';
import { type UploadDto } from '@data-drop/api-schema';
import { EyeIcon, EyeCrossedIcon, PencilIcon, TrashIcon } from '@/components/icons';
import Button from '@/components/button';
import ListRow from '@/components/list-row';

type UploadRowProps = {
  upload: UploadDto;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onRename: (title: string) => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export default function UploadRow({ upload, onDelete, onToggleVisibility, onRename }: UploadRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(upload.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) setDraft(upload.title);
  }, [upload.title, isEditing]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const commit = () => {
    const next = draft.trim();
    if (!next || next === upload.title) {
      setDraft(upload.title);
      setIsEditing(false);
      return;
    }
    onRename(next);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(upload.title);
    setIsEditing(false);
  };

  return (
    <ListRow>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') cancel();
              }}
              className="flex-1 min-w-0 h-7 rounded-md bg-surface-low px-2 font-inter font-semibold text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 border border-outline-variant/20 focus:border-primary/50"
            />
          ) : (
            <p className="font-inter font-semibold text-sm text-on-surface truncate">{upload.title}</p>
          )}
          <Button
            variant="icon"
            aria-label="Rename upload"
            onClick={() => setIsEditing(true)}
            disabled={isEditing}
          >
            <PencilIcon className="w-4" />
          </Button>
        </div>
        <p className="font-inter text-xs text-on-surface-variant mt-0.5">{upload.fileName}</p>
      </div>

      <div className="hidden sm:block sm:w-44 sm:shrink-0">
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
