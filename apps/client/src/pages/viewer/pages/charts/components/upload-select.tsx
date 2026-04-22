import { useState } from 'react';
import { type ViewerUploadListItem } from '@data-drop/api-schema';
import { ChevronDownIcon } from '@/components/icons';
import TruncatedTooltip from '@/components/truncated-tooltip';

type UploadSelectProps = {
  uploads: ViewerUploadListItem[];
  value: string | undefined;
  onChange: (id: string) => void;
  isLoading?: boolean;
};

export default function UploadSelect({
  uploads,
  value,
  onChange,
  isLoading = false,
}: UploadSelectProps) {
  const [open, setOpen] = useState(false);

  const selected = uploads.find((u) => u.id === value);
  const label = selected?.title ?? (isLoading ? 'Loading uploads…' : 'Please select an upload');
  const disabled = isLoading || uploads.length === 0;

  return (
    <div
      className="relative w-96"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-lg bg-surface-lowest px-4 py-3 text-left font-inter text-sm font-medium text-on-surface shadow-ghost transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
      >
        {selected ? (
          <TruncatedTooltip text={label} className="truncate" />
        ) : (
          <span className="truncate">{label}</span>
        )}
        <ChevronDownIcon
          className={`h-2 shrink-0 text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <>
          <div
            aria-hidden
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-20 overflow-hidden rounded-lg bg-surface-lowest py-1 shadow-card"
          >
            {uploads.map((u) => {
              const isSelected = u.id === value;
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(u.id);
                      setOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center px-4 py-2.5 text-left font-inter text-sm transition-colors hover:bg-surface-low ${
                      isSelected
                        ? 'bg-primary/5 font-semibold text-primary'
                        : 'font-medium text-on-surface-variant'
                    }`}
                  >
                    <TruncatedTooltip text={u.title} className="truncate" />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}
