import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { authClient } from '@/lib/auth';
import {
  ArrowRightIcon,
  CloseIcon,
  MenuIcon,
  PencilIcon,
  SignOutIcon,
} from '@/components/icons';
import UserMenu from './user-menu';

export type TopNavLink = {
  label: string;
  href: string;
};

type TopNavProps = {
  logoHref: string;
  email: string;
  userId: string;
  navLinks?: TopNavLink[];
  secondaryLink?: { label: string; href: string } | null;
  canEditProfile: boolean;
};

export default function TopNav({
  logoHref,
  email,
  userId,
  navLinks,
  secondaryLink,
  canEditProfile,
}: TopNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerId = 'mobile-navigation-drawer';
  const links = navLinks ?? [];

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  async function handleSignOut() {
    setMobileOpen(false);
    await authClient.signOut();
    void navigate('/login', { replace: true });
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <header className="bg-surface-lowest z-1 flex w-full items-center px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
        <Link
          to={logoHref}
          className="font-manrope text-primary shrink-0 text-xl leading-7 font-bold tracking-[-0.5px]"
        >
          DataDrop
        </Link>
        {links.length > 0 && (
          <nav className="hidden items-stretch gap-3 sm:flex sm:gap-4">
            {links.map(({ label, href }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center border-b-2 pb-[2px] text-base leading-6 transition-colors ${
                    isActive
                      ? 'text-primary border-primary font-semibold'
                      : 'text-on-surface-variant border-transparent font-normal'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
      <div className="hidden sm:block">
        <UserMenu
          email={email}
          userId={userId}
          secondaryLink={secondaryLink}
          canEditProfile={canEditProfile}
        />
      </div>
      <button
        type="button"
        aria-label="Open mobile navigation"
        aria-controls={drawerId}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className="text-on-surface-variant hover:bg-surface-high inline-flex size-9 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent sm:hidden"
      >
        <MenuIcon />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="bg-on-surface/30 absolute inset-0"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <aside
            id={drawerId}
            aria-label="Mobile navigation"
            className="bg-surface-lowest shadow-ghost absolute top-0 right-0 flex h-full w-[min(20rem,calc(100vw-2rem))] flex-col"
          >
            <div className="flex items-start gap-3 px-4 py-4">
              <div className="min-w-0 flex-1">
                <p className="font-inter text-on-surface-muted text-xs font-medium uppercase">
                  Signed in as
                </p>
                <p className="font-inter text-on-surface mt-1 text-sm leading-5 font-semibold break-all">
                  {email}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close mobile navigation"
                onClick={closeMobileMenu}
                className="text-on-surface-variant hover:bg-surface-high inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent"
              >
                <CloseIcon />
              </button>
            </div>

            {links.length > 0 && (
              <nav className="px-2 py-2" aria-label="Primary navigation">
                {links.map(({ label, href }) => {
                  const isActive = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      to={href}
                      onClick={closeMobileMenu}
                      className={`font-inter flex h-11 items-center rounded-md px-3 text-base transition-colors ${
                        isActive
                          ? 'bg-surface-low text-primary font-semibold'
                          : 'text-on-surface-variant hover:bg-surface font-medium'
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            )}

            <div className="bg-outline-variant/10 mx-2 h-px" />

            <div className="px-2 py-2">
              {canEditProfile && (
                <Link
                  to={`/admin/users/${userId}/edit`}
                  onClick={closeMobileMenu}
                  className="font-inter text-on-surface-variant hover:bg-surface flex h-11 items-center gap-3 rounded-md px-3 text-sm font-normal"
                >
                  <PencilIcon />
                  Edit Profile
                </Link>
              )}

              {secondaryLink && (
                <Link
                  to={secondaryLink.href}
                  onClick={closeMobileMenu}
                  className="font-inter text-primary hover:bg-surface flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium"
                >
                  <ArrowRightIcon />
                  {secondaryLink.label}
                </Link>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                className="font-inter text-error hover:bg-error-surface flex h-11 w-full cursor-pointer items-center gap-3 rounded-md border-0 bg-transparent px-3 text-sm font-normal"
              >
                <SignOutIcon />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
