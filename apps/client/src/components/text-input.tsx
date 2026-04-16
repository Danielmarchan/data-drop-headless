import { type ComponentPropsWithoutRef } from 'react';
import InputLabel from '@/components/input-label';

type TextInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'className'> & {
  label?: string;
  wrapperClassName?: string;
};

const INPUT_CLASS =
  'mt-2 h-12 w-full rounded-lg border border-outline-variant/20 bg-surface-low px-4 font-inter text-base text-on-surface outline-none placeholder:text-on-surface-variant/40 focus:border-primary/50';

export default function TextInput({ label, wrapperClassName, ...inputProps }: TextInputProps) {
  const Wrapper = label ? 'label' : 'div';
  return (
    <Wrapper className={wrapperClassName ? `block ${wrapperClassName}` : 'block'}>
      {label && <InputLabel>{label}</InputLabel>}
      <input className={INPUT_CLASS} {...inputProps} />
    </Wrapper>
  );
}
