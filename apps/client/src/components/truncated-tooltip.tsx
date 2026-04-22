import { useRef, useState } from 'react';

type Placement = 'top' | 'bottom';

type TruncatedTooltipProps = {
  text: string;
  className?: string;
  placement?: Placement;
};

type TooltipPosition = {
  top: number;
  left: number;
  placement: Placement;
};

const TOOLTIP_OFFSET = 8;
const VIEWPORT_EDGE_PADDING = 12;

export default function TruncatedTooltip({
  text,
  className,
  placement = 'top',
}: TruncatedTooltipProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<TooltipPosition | null>(null);

  const handleEnter = () => {
    const el = spanRef.current;
    if (!el) return;
    if (el.scrollWidth <= el.clientWidth) return;

    const rect = el.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const resolvedPlacement: Placement =
      placement === 'top' && spaceAbove < 48 && spaceBelow > spaceAbove
        ? 'bottom'
        : placement === 'bottom' && spaceBelow < 48 && spaceAbove > spaceBelow
          ? 'top'
          : placement;

    const top =
      resolvedPlacement === 'top'
        ? rect.top - TOOLTIP_OFFSET
        : rect.bottom + TOOLTIP_OFFSET;
    const left = Math.min(
      Math.max(rect.left + rect.width / 2, VIEWPORT_EDGE_PADDING),
      window.innerWidth - VIEWPORT_EDGE_PADDING,
    );

    setPosition({ top, left, placement: resolvedPlacement });
  };

  const handleLeave = () => setPosition(null);

  return (
    <>
      <span
        ref={spanRef}
        className={className}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onFocus={handleEnter}
        onBlur={handleLeave}
      >
        {text}
      </span>
      {position ? (
        <div
          role="tooltip"
          style={{
            top: position.top,
            left: position.left,
            transform: `translate(-50%, ${position.placement === 'top' ? '-100%' : '0'})`,
          }}
          className="pointer-events-none fixed z-50 max-w-xs rounded-md bg-on-surface px-2.5 py-1.5 font-inter text-xs font-medium text-surface-lowest shadow-card whitespace-normal break-words"
        >
          {text}
        </div>
      ) : null}
    </>
  );
}
