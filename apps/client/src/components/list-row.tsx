export default function ListRow({children}: {children: React.ReactNode}) {
  return (
    <div className="flex items-center gap-8 border-outline-variant/10 bg-surface-lowest py-4 px-6 shadow-sm rounded-lg">
      {children}
    </div>
  );
}
