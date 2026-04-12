import { Link, useNavigate, useSearchParams } from 'react-router';
import { useUsers } from '@/api/users';
import { type UserDto } from '@data-drop/api-schema';

const PER_PAGE = 10;

function RoleBadge({ role }: { role: UserDto['role'] | null }) {
  return (
    <span className="inline-flex items-center bg-surface-high text-primary font-inter font-semibold text-xs rounded-full px-3 py-1 shrink-0">
      {role?.name ?? 'No role'}
    </span>
  );
}

function UserRow({ u }: { u: UserDto }) {
  return (
    <div className="flex items-center gap-8 bg-surface-lowest rounded-lg px-6 py-6">
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-inter font-semibold text-base text-on-surface">{u.name}</span>
        <span className="font-inter text-sm text-on-surface-variant mt-0.5">{u.email}</span>
      </div>

      <div className="w-44 shrink-0">
        <RoleBadge role={u.role} />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-high transition-colors"
          aria-label={`Edit ${u.name}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M11.333 2a1.886 1.886 0 0 1 2.667 2.667L5.333 13.333 2 14l.667-3.333L11.333 2Z"
              stroke="currentColor"
              strokeWidth="1.333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-high transition-colors"
          aria-label={`Delete ${u.name}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M2 4h12M5.333 4V2.667A.667.667 0 0 1 6 2h4a.667.667 0 0 1 .667.667V4m1.333 0v9.333A1.333 1.333 0 0 1 10.667 14H5.333A1.333 1.333 0 0 1 4 13.333V4h8Z"
              stroke="currentColor"
              strokeWidth="1.333"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

function buildPageUrl(page: number, search: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (search) params.set('search', search);
  const qs = params.toString();
  return qs ? `?${qs}` : '?';
}

function Pagination({
  page,
  totalPages,
  total,
  search,
}: {
  page: number;
  totalPages: number;
  total: number;
  search: string;
}) {
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

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);

  const { data, isLoading } = useUsers();

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get('search') as string) ?? '';
    const params = new URLSearchParams();
    if (q) params.set('search', q);
    void navigate(`?${params.toString()}`);
  }

  const users = data?.nodes ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.pageInfo?.totalPages ?? 1;
  const safePage = data?.pageInfo?.page ?? page;

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-manrope font-extrabold text-3xl text-on-surface tracking-tight">
          Users
        </h1>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center h-11 w-72 bg-surface-lowest border border-outline-variant/20 rounded-lg px-3 gap-2.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0 text-on-surface-variant/60"
                aria-hidden="true"
              >
                <path
                  d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
                  stroke="currentColor"
                  strokeWidth="1.333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                name="search"
                type="text"
                defaultValue={search}
                placeholder="Search by name or email..."
                className="flex-1 bg-transparent font-inter text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
              />
            </div>
          </form>
          <button
            type="button"
            className="h-11 px-5 rounded-lg bg-primary-accent text-white font-inter font-semibold text-base transition-opacity hover:opacity-90 shrink-0"
          >
            New User
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-8 px-6 pb-3">
          <div className="flex-1 font-inter font-semibold text-xs text-on-surface-variant tracking-[0.6px] uppercase">
            User
          </div>
          <div className="w-44 shrink-0 font-inter font-semibold text-xs text-on-surface-variant tracking-[0.6px] uppercase">
            Role
          </div>
          <div className="w-15 shrink-0" />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <p className="font-inter text-sm">Loading...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <p className="font-inter text-sm">No users found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <UserRow key={u.id} u={u} />
            ))}
          </div>
        )}

        {total > 0 && (
          <Pagination page={safePage} totalPages={totalPages} total={total} search={search} />
        )}
      </div>
    </div>
  );
}
