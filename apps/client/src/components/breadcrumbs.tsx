import { Fragment } from 'react';
import { Link } from 'react-router';
import { ChevronRightIcon } from './icons';

export type BreadcrumbItem = {
  label: string;
  to?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 font-inter text-sm text-on-surface-variant ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-on-surface transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-on-surface" aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
            {!isLast ? (
              <ChevronRightIcon className="h-2.5 mt-0.5" />
            ) : null}
          </Fragment>
        );
      })}
    </nav>
  );
}
