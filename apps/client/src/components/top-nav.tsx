import { Link } from 'react-router';
import UserMenu from './user-menu';

type TopNavProps = {
  logoHref: string;
  email: string;
  userId: string;
  navLinks?: React.ReactNode;
  secondaryLink?: { label: string; href: string } | null;
  canEditProfile: boolean;
};

export default function TopNav({ logoHref, email, userId, navLinks, secondaryLink, canEditProfile }: TopNavProps) {
  return (
    <header className="w-full bg-surface-lowest z-1 flex items-center px-6 py-4">
      <div className="flex items-center gap-8 flex-1">
        <Link
          to={logoHref}
          className="font-manrope font-bold text-xl leading-7 tracking-[-0.5px] text-primary shrink-0"
        >
          DataDrop
        </Link>
        {navLinks}
      </div>
      <UserMenu
        email={email}
        userId={userId}
        secondaryLink={secondaryLink}
        canEditProfile={canEditProfile}
      />
    </header>
  );
}
