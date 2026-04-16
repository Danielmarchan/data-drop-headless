import { useNavigate, useSearchParams } from 'react-router';
import { useUsers } from '@/api/users';
import UserRow from './components/user-row';
import Pagination from './components/pagination';

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
