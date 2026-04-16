import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface gap-4">
      <span className="font-manrope font-extrabold text-2xl leading-8 tracking-[-0.6px] text-primary">
        DataDrop
      </span>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-manrope font-bold text-6xl text-on-surface">404</h1>
        <p className="font-inter text-base text-on-surface-variant">
          Page not found
        </p>
      </div>

      <Link
        to="/"
        className="font-inter text-sm font-medium text-primary hover:underline"
      >
        Go back home
      </Link>
    </div>
  );
}
