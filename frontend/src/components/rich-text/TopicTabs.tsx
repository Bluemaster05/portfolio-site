"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

interface TopicTabsProps {
  /** Accessible name for the tab list */
  label: string;
  /** `key` keeps a panel's state with its tab when tabs move; defaults to the position */
  tabs: { key?: number; title: string; panel: ReactNode }[];
  /** Selected tab when the parent controls it (the admin editor); otherwise the tabs keep their own */
  active?: number;
  onSelect?: (index: number) => void;
  /** Shown at the end of the tab row, e.g. an Add button */
  actions?: ReactNode;
}

/**
 * A write-up's topics as underlined tabs (arrow keys move between them). Every panel stays in the
 * page, hidden, so its content is still indexed and editors keep their state. When the tabs are
 * wider than the column they scroll sideways, with ‹ › buttons to move along them.
 */
export function TopicTabs({
  label,
  tabs,
  active,
  onSelect,
  actions,
}: TopicTabsProps) {
  const [ownActive, setOwnActive] = useState(0);
  const id = useId();
  const current = Math.min(active ?? ownActive, tabs.length - 1);
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ left: false, right: false });

  // Which way the tab row can still scroll; rechecked on scroll and when the row or tabs resize
  useEffect(() => {
    const row = scroller.current;
    if (!row || !list.current) return;
    const update = () =>
      setOverflow({
        left: row.scrollLeft > 1,
        right: row.scrollLeft + row.clientWidth < row.scrollWidth - 1,
      });
    update();
    row.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(row);
    observer.observe(list.current);
    return () => {
      row.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  // Keep the selected tab in view, e.g. one just added at the end (without scrolling the page)
  useEffect(() => {
    const row = scroller.current;
    const tab = document.getElementById(`${id}-tab-${current}`);
    if (!row || !tab) return;
    if (tab.offsetLeft < row.scrollLeft) row.scrollLeft = tab.offsetLeft;
    else if (
      tab.offsetLeft + tab.offsetWidth >
      row.scrollLeft + row.clientWidth
    ) {
      row.scrollLeft = tab.offsetLeft + tab.offsetWidth - row.clientWidth;
    }
  }, [current, id, tabs.length]);

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

  function select(index: number) {
    setOwnActive(index);
    onSelect?.(index);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (current + step + tabs.length) % tabs.length;
    select(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  return (
    // The one column never grows past its container, so wide tabs or panel content (code, images)
    // scroll inside it instead of widening the page
    <div className="not-prose grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6">
      {/* The bottom line is an inset shadow, not a border, so the active underline can sit on it */}
      <div className="flex min-w-0 items-center shadow-[inset_0_-1px_0_var(--border)]">
        {scrolls && (
          <ScrollButton
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
          <div
            ref={list}
            role="tablist"
            aria-label={label}
            className="flex w-max"
          >
            {tabs.map((tab, index) => (
              <button
                key={tab.key ?? index}
                id={`${id}-tab-${index}`}
                role="tab"
                type="button"
                aria-selected={index === current}
                aria-controls={`${id}-panel-${index}`}
                tabIndex={index === current ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={onKeyDown}
                className={`whitespace-nowrap border-b-2 px-4 py-2 font-medium transition-colors ${
                  index === current
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tab.title.trim() || "Untitled"}
              </button>
            ))}
          </div>
        </div>
        {scrolls && (
          <ScrollButton
            direction={1}
            disabled={!overflow.right}
            onClick={() => scrollBy(1)}
          />
        )}
        {actions}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={tab.key ?? index}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          hidden={index !== current}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  );
}

function ScrollButton({
  direction,
  disabled,
  onClick,
}: {
  direction: -1 | 1;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction < 0 ? "Scroll topics left" : "Scroll topics right"}
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
