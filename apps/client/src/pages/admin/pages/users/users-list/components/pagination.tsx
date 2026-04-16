import { Link } from 'react-router';

const PER_PAGE = 10;

function buildPageUrl(page: number, search: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (search) params.set('search', search);
  const qs = params.toString();
  return qs ? `?${qs}` : '?';
}

type PaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  search: string;
};

export default function Pagination({ page, totalPages, total, search }: PaginationProps) {
  const from = (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  const pageNumbers: (number | null)[] = [];
  if (totalPages <= 6) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1, 2, 3);
    if (page > 4) pageNumbers.push(null);
    if (page > 3 && page < totalPages - 2) pageNumbers.push(page);
    if (page < totalPages - 2) pageNumbers.push(null);
    pageNumbers.push(totalPages);
  }

  const uniquePages = pageNumbers.filter(
    (p, i, arr) => p !== null || (i > 0 && arr[i - 1] !== null),
  );

  return (
    <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4 mt-2">
      <span className="font-inter text-sm text-on-surface-variant">
        Showing {from} to {to} of {total} users
      </span>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link
            to={buildPageUrl(page - 1, search)}
            className="px-3 h-9 flex items-center font-inter text-sm font-medium text-on-surface-variant hover:bg-surface-high rounded transition-colors"
          >
            Previous
          </Link>
        ) : (
          <span className="px-3 h-9 flex items-center font-inter text-sm font-medium text-on-surface-variant/40">
            Previous
          </span>
        )}

        <div className="flex items-center gap-1">
          {uniquePages.map((p, i) =>
            p === null ? (
              <span
                key={`ellipsis-${i}`}
                className="w-8 h-8 flex items-center justify-center font-inter text-sm text-on-surface-variant"
              >
                ...
              </span>
            ) : (
              <Link
                key={p}
                to={buildPageUrl(p, search)}
                className={`w-8 h-8 flex items-center justify-center rounded font-inter text-xs font-semibold transition-colors ${
                  p === page
                    ? 'bg-primary text-white'
                    : 'text-on-surface-variant hover:bg-surface-high'
                }`}
              >
                {p}
              </Link>
            ),
          )}
        </div>

        {page < totalPages ? (
          <Link
            to={buildPageUrl(page + 1, search)}
            className="px-3 h-9 flex items-center font-inter text-sm font-medium text-primary hover:bg-surface-high rounded transition-colors"
          >
            Next
          </Link>
        ) : (
          <span className="px-3 h-9 flex items-center font-inter text-sm font-medium text-on-surface-variant/40">
            Next
          </span>
        )}
      </div>
    </div>
  );
}
