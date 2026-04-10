import { Link, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { authClient } from '@/lib/auth';

interface UserMenuProps {
  email: string;
  userId: string;
}

export default function UserMenu({ email, userId }: UserMenuProps) {
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
        className="flex items-center gap-2 h-8 px-3 rounded bg-surface-low cursor-pointer border-0"
      >
        <span className="font-inter font-medium text-sm leading-5 text-on-surface-variant">{email}</span>
        <svg
          width="8"
          height="5"
          viewBox="0 0 8 5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M1 1L4 4L7 1" stroke="#424752" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg bg-surface-lowest z-50 border border-outline-variant/20 shadow-ghost">
          <Link
            to={`/admin/users/${userId}/edit`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 h-10 font-inter font-normal text-sm text-on-surface-variant hover:bg-surface rounded-t-lg"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8.5 1.5a1.414 1.414 0 0 1 2 2L3.5 10.5 1 11l.5-2.5 7-7Z"
                stroke="#424752"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Edit Profile
          </Link>

          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 h-11 font-inter font-medium text-sm text-primary hover:bg-surface"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7 1L13 7M13 7L7 13M13 7H1"
                stroke="#004596"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Go to Charts Viewer
          </Link>

          <div className="h-px bg-outline-variant/10 mx-px" />

          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 h-11 font-inter font-normal text-sm text-error hover:bg-error-surface rounded-b-lg cursor-pointer border-0 bg-transparent"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5 12H2.333A1.333 1.333 0 0 1 1 10.667V3.333A1.333 1.333 0 0 1 2.333 2H5M9.667 10 13 7m0 0L9.667 4M13 7H5"
                stroke="#ba1a1a"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
