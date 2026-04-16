import { type ComponentPropsWithoutRef } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'destructive' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-linear-to-br from-primary to-primary-accent text-white hover:opacity-90 disabled:opacity-50 transition-opacity',
  ghost: 'text-on-surface-variant hover:bg-surface-high disabled:opacity-50 transition-colors',
  destructive: 'bg-error text-white hover:opacity-90 disabled:opacity-50 transition-opacity',
  icon: 'rounded-md p-1.5 text-on-surface-variant hover:bg-surface-high transition-colors',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-10 rounded-lg font-inter text-sm font-semibold',
  md: 'h-11 rounded-lg font-inter text-base font-semibold',
  lg: 'h-12 rounded-lg font-manrope text-base font-bold',
};

export default function Button({
  variant = 'primary',
  size = 'sm',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const sizeClass = variant === 'icon' ? '' : SIZE_CLASSES[size];
  const fullWidthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={[VARIANT_CLASSES[variant], sizeClass, fullWidthClass, className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
