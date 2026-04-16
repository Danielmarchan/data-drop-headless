import { type UserDto } from '@data-drop/api-schema';
import RoleBadge from './role-badge';

export default function UserRow({ u }: { u: UserDto }) {
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
