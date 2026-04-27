export default function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.607a.75.75 0 0 0-1.214-.886l-3.483 4.77-1.803-1.804a.75.75 0 0 0-1.06 1.061l2.418 2.417a.75.75 0 0 0 1.137-.087l4.005-5.47Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
