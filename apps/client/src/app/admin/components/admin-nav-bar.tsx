import { Link } from 'react-router';
import AdminNavLinks from './admin-nav-links';
import UserMenu from './user-menu';

interface AdminNavBarProps {
  email: string;
  userId: string;
}

export default function AdminNavBar({ email, userId }: AdminNavBarProps) {
  return (
    <header className="h-[58px] w-full bg-surface-lowest flex items-center px-6">
      <div className="flex items-center gap-8 flex-1">
        <Link to="/admin" className="font-inter font-bold text-xl leading-7 tracking-[-0.5px] text-primary shrink-0">
          DataDrop
        </Link>
        <AdminNavLinks />
      </div>

      <UserMenu email={email} userId={userId} />
    </header>
  );
}
