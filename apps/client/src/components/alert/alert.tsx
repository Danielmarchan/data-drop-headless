import { CloseIcon, ErrorIcon, SuccessIcon } from '@/components/icons';

export type AlertVariant = 'success' | 'error';

type AlertProps = {
  variant: AlertVariant;
  title: string;
  message?: string;
  className?: string;
  onDismiss?: () => void;
};

const VARIANT_STYLES: Record<
  AlertVariant,
  {
    container: string;
    icon: string;
    title: string;
    message: string;
    button: string;
  }
> = {
  success: {
    container: 'bg-emerald-50 ring-1 ring-inset ring-emerald-600/20',
    icon: 'text-emerald-400',
    title: 'text-emerald-800',
    message: 'text-emerald-700',
    button:
      'text-emerald-500 hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600',
  },
  error: {
    container: 'bg-red-50 ring-1 ring-inset ring-red-600/20',
    icon: 'text-red-400',
    title: 'text-red-800',
    message: 'text-red-700',
    button:
      'text-red-500 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600',
  },
};

export default function Alert({
  variant,
  title,
  message,
  className,
  onDismiss,
}: AlertProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = variant === 'success' ? SuccessIcon : ErrorIcon;

  return (
    <div
      role="alert"
      className={['rounded-md p-4', styles.container, className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex gap-3">
        <div className="shrink-0">
          <Icon className={['size-5', styles.icon].join(' ')} />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={['font-inter text-sm font-semibold', styles.title].join(
              ' ',
            )}
          >
            {title}
          </h3>
          {message ? (
            <div
              className={['font-inter mt-2 text-sm', styles.message].join(' ')}
            >
              <p className="m-0">{message}</p>
            </div>
          ) : null}
        </div>

        {onDismiss ? (
          <div className="shrink-0">
            <button
              type="button"
              onClick={onDismiss}
              className={[
                'inline-flex rounded-md p-1.5 transition-colors focus-visible:outline cursor-pointer',
                styles.button,
              ].join(' ')}
              aria-label="Dismiss alert"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
