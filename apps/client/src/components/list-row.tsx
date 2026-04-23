export default function ListRow({children}: {children: React.ReactNode}) {
  return (
    <div className="flex items-center gap-3 sm:gap-8 border-outline-variant/10 bg-surface-lowest py-3 sm:py-4 px-4 sm:px-6 shadow-sm rounded-lg">
      {children}
    </div>
  );
}
