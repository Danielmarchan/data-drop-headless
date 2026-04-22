import { Link, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { authClient } from '@/lib/auth';
import { PencilIcon, ChevronUpIcon, ArrowRightIcon, SignOutIcon } from '@/components/icons';

type UserMenuProps = {
  email: string;
  userId: string;
  secondaryLink?: { label: string; href: string } | null;
};

export default function UserMenu({ email, userId, secondaryLink }: UserMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    await authClient.signOut();
    void navigate('/login', { replace: true });
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 h-8 px-3 rounded bg-surface-low cursor-pointer border-0 border-surface-high"
      >
        <span className="font-inter font-medium text-sm leading-5 text-on-surface-variant">{email}</span>
        <ChevronUpIcon className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg bg-surface-lowest z-50 border border-outline-variant/20 shadow-ghost">
          <Link
            to={`/admin/users/${userId}/edit`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 h-10 font-inter font-normal text-sm text-on-surface-variant hover:bg-surface rounded-t-lg"
          >
            <PencilIcon />
            Edit Profile
          </Link>

          {secondaryLink && (
            <>
              <Link
                to={secondaryLink.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 h-11 font-inter font-medium text-sm text-primary hover:bg-surface"
              >
                <ArrowRightIcon />
                {secondaryLink.label}
              </Link>
              <div className="h-px bg-outline-variant/10 mx-px" />
            </>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 h-11 font-inter font-normal text-sm text-error hover:bg-error-surface rounded-b-lg cursor-pointer border-0 bg-transparent"
          >
            <SignOutIcon />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
