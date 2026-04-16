export default function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2 4h12M5.333 4V2.667A.667.667 0 0 1 6 2h4a.667.667 0 0 1 .667.667V4m1.333 0v9.333A1.333 1.333 0 0 1 10.667 14H5.333A1.333 1.333 0 0 1 4 13.333V4h8Z"
        stroke="var(--color-on-surface-variant)"
        strokeWidth="1.333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
