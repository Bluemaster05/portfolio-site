"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ScrollingTabRow } from "@/components/ScrollingTabRow";

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
  /** Ends each panel with buttons to the previous and next topics (the public page) */
  pager?: boolean;
}

/**
 * A write-up's topics as underlined tabs (arrow keys move between them). Every panel stays in the
 * page, hidden, so its content is still indexed and editors keep their state. Tabs wider than the
 * column scroll sideways (see ScrollingTabRow).
 */
export function TopicTabs({
  label,
  tabs,
  active,
  onSelect,
  actions,
  pager = false,
}: TopicTabsProps) {
  const [ownActive, setOwnActive] = useState(0);
  const id = useId();
  const top = useRef<HTMLDivElement>(null);
  const current = Math.min(active ?? ownActive, tabs.length - 1);

  function select(index: number) {
    setOwnActive(index);
    onSelect?.(index);
  }

  // From the bottom of a panel: open that topic and bring its start (the tab row) back into view
  function turnTo(index: number) {
    select(index);
    const row = top.current;
    if (!row) return;
    if (row.getBoundingClientRect().top < 0) {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      row.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }
    document
      .getElementById(`${id}-tab-${index}`)
      ?.focus({ preventScroll: true });
  }

  const titleOf = (index: number) => tabs[index].title.trim() || "Untitled";

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
    <div
      ref={top}
      className="not-prose grid min-w-0 scroll-mt-24 grid-cols-[minmax(0,1fr)] gap-6"
    >
      <ScrollingTabRow
        label={label}
        itemsName="topics"
        selected={current}
        actions={actions}
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
            {titleOf(index)}
          </button>
        ))}
      </ScrollingTabRow>
      {tabs.map((tab, index) => (
        <div
          key={tab.key ?? index}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          hidden={index !== current}
        >
          {tab.panel}
          {pager && (
            <nav
              aria-label="Other topics"
              className="mt-8 flex flex-wrap justify-between gap-3"
            >
              {index > 0 && (
                <PagerButton
                  direction={-1}
                  title={titleOf(index - 1)}
                  onClick={() => turnTo(index - 1)}
                />
              )}
              {index < tabs.length - 1 && (
                <PagerButton
                  direction={1}
                  title={titleOf(index + 1)}
                  onClick={() => turnTo(index + 1)}
                />
              )}
            </nav>
          )}
        </div>
      ))}
    </div>
  );
}

function PagerButton({
  direction,
  title,
  onClick,
}: {
  direction: -1 | 1;
  title: string;
  onClick: () => void;
}) {
  const next = direction > 0;
  return (
    <button
      type="button"
      onClick={onClick}
      // The next button stays on the right even when it is the only one
      className={`group flex min-w-0 max-w-full items-center gap-2 rounded-card border border-border bg-surface px-3 py-1.5 transition-colors hover:border-accent ${
        next ? "ml-auto text-right" : "text-left"
      }`}
    >
      {!next && (
        <span aria-hidden="true" className="text-muted group-hover:text-foreground">
          ←
        </span>
      )}
      <span className="min-w-0">
        <span className="block text-xs text-muted">
          {next ? "Next topic" : "Previous topic"}
        </span>
        <span className="block break-words text-sm font-medium text-foreground">
          {title}
        </span>
      </span>
      {next && (
        <span aria-hidden="true" className="text-muted group-hover:text-foreground">
          →
        </span>
      )}
    </button>
  );
}
