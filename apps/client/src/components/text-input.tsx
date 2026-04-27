import { forwardRef, useId, type ComponentPropsWithoutRef } from 'react';
import InputLabel from '@/components/input-label';

type TextInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'className'> & {
  label?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  error?: string;
};

const INPUT_BASE_CLASS = 'mt-2 h-12 w-full rounded-lg border bg-surface-low px-4 font-inter text-base text-on-surface outline-none placeholder:text-on-surface-variant/40';
const INPUT_BORDER_CLASS = 'border-outline-variant/20 focus:border-primary/50';
const ERROR_INPUT_CLASS = 'border-error/40 focus:border-error/60';

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    { label, wrapperClassName, inputClassName, error, id, ...inputProps },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className={wrapperClassName ? `block ${wrapperClassName}` : 'block'}>
        {label ? <InputLabel htmlFor={inputId}>{label}</InputLabel> : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : inputProps['aria-invalid']}
          aria-describedby={error ? errorId : inputProps['aria-describedby']}
          className={[
            INPUT_BASE_CLASS,
            error ? ERROR_INPUT_CLASS : INPUT_BORDER_CLASS,
            inputClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          {...inputProps}
        />
        {error ? (
          <p id={errorId} className="font-inter text-error mt-2 text-sm">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

TextInput.displayName = 'TextInput';

export default TextInput;
