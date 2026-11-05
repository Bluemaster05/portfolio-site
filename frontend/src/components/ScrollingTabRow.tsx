"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface ScrollingTabRowProps {
  /** Accessible name for the tab list */
  label: string;
  /** What the ‹ › buttons scroll, for their labels, e.g. "topics" */
  itemsName: string;
  /** The selected tab's index; the `aria-selected` tab is kept in view when it changes or the tabs resize */
  selected: number;
  /** Shown at the end of the row, e.g. an Add button */
  actions?: ReactNode;
  /** The `role="tab"` buttons */
  children: ReactNode;
}

/**
 * A row of underlined tabs. When the tabs are wider than the column they scroll sideways, with
 * ‹ › buttons to move along them.
 */
export function ScrollingTabRow({
  label,
  itemsName,
  selected,
  actions,
  children,
}: ScrollingTabRowProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });
  // Keep the selected tab in view, e.g. one just added at the end (without scrolling the page)
  function keepSelectedInView() {
    const row = scroller.current;
    const tab = list.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!row || !tab) return;
    if (tab.offsetLeft < row.scrollLeft) row.scrollLeft = tab.offsetLeft;
    else if (
      tab.offsetLeft + tab.offsetWidth >
      row.scrollLeft + row.clientWidth
    ) {
      row.scrollLeft = tab.offsetLeft + tab.offsetWidth - row.clientWidth;
    }
  }

  useEffect(keepSelectedInView, [selected]);

  // Which way the tab row can still scroll; rechecked on scroll and when the row or tabs resize
  useEffect(() => {
    const row = scroller.current;
    if (!row || !list.current) return;
    const update = () =>
      setOverflow({
        left: row.scrollLeft > 1,
        right: row.scrollLeft + row.clientWidth < row.scrollWidth - 1,
      });
    const onResize = () => {
      keepSelectedInView();
      update();
    };
    update();
    row.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(onResize);
    observer.observe(row);
    observer.observe(list.current);
    return () => {
      row.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  function scrollBy(direction: -1 | 1) {
    const row = scroller.current;
    if (!row) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    row.scrollBy({
      left: direction * row.clientWidth * 0.75,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  const scrolls = overflow.left || overflow.right;

  return (
    // The bottom line is an inset shadow, not a border, so the active underline can sit on it
    <div className="flex min-w-0 items-center shadow-[inset_0_-1px_0_var(--border)]">
      {scrolls && (
        <ScrollButton
          label={`Scroll ${itemsName} left`}
          direction={-1}
          disabled={!overflow.left}
          onClick={() => scrollBy(-1)}
        />
      )}
      {/* Scrolled by swiping or the buttons, so the scrollbar is hidden */}
      <div
        ref={scroller}
        className="relative min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div ref={list} role="tablist" aria-label={label} className="flex w-max">
          {children}
        </div>
      </div>
      {scrolls && (
        <ScrollButton
          label={`Scroll ${itemsName} right`}
          direction={1}
          disabled={!overflow.right}
          onClick={() => scrollBy(1)}
        />
      )}
      {actions}
    </div>
  );
}

function ScrollButton({
  label,
  direction,
  disabled,
  onClick,
}: {
  label: string;
  direction: -1 | 1;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      // Keyboard users move between tabs with the arrow keys, which scroll the row themselves
      tabIndex={-1}
      disabled={disabled}
      onClick={onClick}
      className="shrink-0 self-stretch px-2 text-lg leading-none text-muted transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-muted"
    >
      <span aria-hidden="true">{direction < 0 ? "‹" : "›"}</span>
    </button>
  );
}
