import { SearchIcon } from '@/components/icons';

type SearchInputProps = {
  placeholder?: string;
  name?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

const CONTAINER_BASE =
  'flex items-center h-11 gap-2.5 rounded-lg border border-outline-variant/20 px-3';
const INPUT_CLASS =
  'flex-1 bg-transparent font-inter text-sm text-on-surface outline-none placeholder:text-on-surface-variant/50';

export default function SearchInput({
  placeholder,
  name,
  defaultValue,
  value,
  onChange,
  className,
}: SearchInputProps) {
  return (
    <div className={className ? `${CONTAINER_BASE} ${className}` : CONTAINER_BASE}>
      <SearchIcon className="shrink-0 text-on-surface-variant/60" />
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        className={INPUT_CLASS}
      />
    </div>
  );
}
