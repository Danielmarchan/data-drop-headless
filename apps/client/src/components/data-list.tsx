export function DataList({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

export function DataListRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 bg-surface-lowest rounded-lg px-4 py-3 hover:bg-surface-high transition-colors cursor-default">
      {children}
    </div>
  );
}
