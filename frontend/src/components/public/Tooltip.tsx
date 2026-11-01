import { cloneElement, useId, type ReactElement } from 'react';

interface TooltipProps {
  /** A few words, e.g. "Read more" */
  label: string;
  /** One focusable element (usually a link); it gets aria-describedby pointing at the label */
  children: ReactElement<{ 'aria-describedby'?: string }>;
}

/**
 * A short label that fades and rises in above its child on hover or keyboard focus. Pure CSS, so it
 * works in server components; the global reduced-motion rule removes the movement.
 */
export function Tooltip({ label, children }: TooltipProps) {
  const id = useId();
  return (
    <span className="group/tooltip relative inline-flex">
      {cloneElement(children, { 'aria-describedby': id })}
      {/* aria-hidden keeps the label out of surrounding text (e.g. a heading's name);
          aria-describedby still reads it as the child's description */}
      <span
        aria-hidden="true"
        id={id}
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium leading-normal tracking-normal text-background opacity-0 shadow-md transition duration-150 ease-out group-hover/tooltip:translate-y-0 group-hover/tooltip:opacity-100 group-has-[:focus-visible]/tooltip:translate-y-0 group-has-[:focus-visible]/tooltip:opacity-100"
      >
        {label}
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground"
        />
      </span>
    </span>
  );
}
