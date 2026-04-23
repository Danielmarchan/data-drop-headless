import { type UserDto } from '@data-drop/api-schema';
import { PencilIcon, TrashIcon } from '@/components/icons';
import Button from '@/components/button';
import RoleBadge from './role-badge';
import ListRow from '@/components/list-row';

type UserRowProps = {
  u: UserDto;
  onEdit: () => void;
  onDelete: () => void;
};

export default function UserRow({ u, onEdit, onDelete }: UserRowProps) {
  return (
    <ListRow>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-inter font-semibold text-base text-on-surface">{u.name}</span>
        <span className="font-inter text-sm text-on-surface-variant mt-0.5">{u.email}</span>
      </div>

      <div className="w-20 sm:w-44 shrink-0">
        <RoleBadge role={u.role} />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="icon" type="button" onClick={onEdit} aria-label={`Edit ${u.name}`}>
          <PencilIcon className="cursor-pointer" />
        </Button>
        <Button variant="icon" type="button" onClick={onDelete} aria-label={`Delete ${u.name}`}>
          <TrashIcon className="cursor-pointer" />
        </Button>
      </div>
    </ListRow>
  );
}
