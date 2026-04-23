import { Link, useLocation } from 'react-router';

const links = [
  { label: 'Users', href: '/admin/users' },
  { label: 'Datasets', href: '/admin/datasets' },
];

export default function AdminNavLinks() {
  const { pathname } = useLocation();

  return (
    <nav className="flex items-stretch gap-3 sm:gap-4">
      {links.map(({ label, href }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            to={href}
            className={`flex items-center text-base leading-6 pb-[2px] border-b-2 transition-colors ${
              isActive
                ? 'font-semibold text-primary border-primary'
                : 'font-normal text-on-surface-variant border-transparent'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
