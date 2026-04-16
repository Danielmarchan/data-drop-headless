type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  isDestructive = false,
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-on-surface/30"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="relative bg-surface-lowest shadow-card rounded-xl p-6 w-full max-w-sm mx-4">
        <h2 className="font-manrope font-extrabold text-lg text-on-surface mb-2">{title}</h2>
        <p className="font-inter text-sm text-on-surface-variant mb-6">{description}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="h-10 px-4 rounded-lg font-inter font-semibold text-sm text-on-surface-variant hover:bg-surface-high transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`h-10 px-4 rounded-lg font-inter font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50 ${
              isDestructive ? 'bg-error' : 'bg-linear-to-br from-primary to-primary-accent'
            }`}
          >
            {isPending ? 'Loading...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
