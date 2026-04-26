export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="shrink-0 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-2">
        <span className="font-inter text-sm text-on-surface-variant text-center">
          &copy; {year} DataDrop. All Rights Reserved
        </span>
      </div>
    </footer>
  );
}
