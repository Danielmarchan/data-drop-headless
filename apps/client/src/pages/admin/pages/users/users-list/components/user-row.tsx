import { type UserDto } from '@data-drop/api-schema';
import { PencilIcon, TrashIcon } from '@/components/icons';
import RoleBadge from './role-badge';

type UserRowProps = {
  u: UserDto;
  onEdit: () => void;
  onDelete: () => void;
};

export default function UserRow({ u, onEdit, onDelete }: UserRowProps) {
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
          onClick={onEdit}
          className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-high transition-colors"
          aria-label={`Edit ${u.name}`}
        >
          <PencilIcon />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-high transition-colors"
          aria-label={`Delete ${u.name}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
