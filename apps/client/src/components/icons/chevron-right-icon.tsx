export default function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      width="8"
      height="12"
      viewBox="0 0 8 12"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M1.5 1L6.5 6L1.5 11"
        stroke="var(--color-on-surface-variant)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
