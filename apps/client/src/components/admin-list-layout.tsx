import SearchInput from '@/components/search-input';
import Spinner from './spinner';

export type ColumnHeader = { label: string; className: string };

type AdminListLayoutProps = {
  title: string;
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  action?: React.ReactNode;
  columnHeaders: ColumnHeader[];
  isLoading: boolean;
  isEmpty: boolean;
  emptyMessage?: string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  modal?: React.ReactNode;
};

export default function AdminListLayout({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  action,
  columnHeaders,
  isLoading,
  isEmpty,
  emptyMessage = 'No results found.',
  hasNextPage,
  isFetchingNextPage,
  sentinelRef,
  children,
  modal,
}: AdminListLayoutProps) {
  return (
    <div className="container px-6 py-8 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-manrope font-extrabold text-3xl text-on-surface tracking-tight">
          {title}
        </h1>
        <div className="flex items-center gap-3">
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="w-72 bg-surface-lowest"
          />
          {action}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-8 px-6 pb-3">
          {columnHeaders.map((col) => (
            <div
              key={col.label}
              className={`${col.className} font-inter font-semibold text-xs text-on-surface-variant tracking-[0.6px] uppercase`}
            >
              {col.label}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <Spinner />
          </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <p className="font-inter text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">{children}</div>
        )}

        <div ref={sentinelRef} />
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-6 text-on-surface-variant">
            <Spinner />
          </div>
        )}
      </div>

      {modal}
    </div>
  );
}
