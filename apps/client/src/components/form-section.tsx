import { type ReactNode } from 'react';

type FormSectionProps = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
};

export default function FormSection({ title, action, children }: FormSectionProps) {
  return (
    <section className="rounded-2xl border border-outline-variant/10 bg-surface-lowest p-6 shadow-sm">
      <div className={action ? 'flex items-center justify-between gap-4' : 'flex items-center gap-3.5'}>
        {title && (
        <div className="flex items-center gap-3.5">
          <div className="h-6 w-1.5 rounded-full bg-primary" aria-hidden="true" />
          <h2 className="font-manrope text-lg font-bold text-on-surface">{title}</h2>
        </div>

        )}
        {action}
      </div>
      {children}
    </section>
  );
}
