import { type UserDto } from '@data-drop/api-schema';

export default function RoleBadge({ role }: { role: UserDto['role'] | null }) {
  return (
    <span className="inline-flex items-center bg-surface-high text-primary font-inter font-semibold text-xs rounded-full px-3 py-1 shrink-0">
      {role?.name ?? 'No role'}
    </span>
  );
}
