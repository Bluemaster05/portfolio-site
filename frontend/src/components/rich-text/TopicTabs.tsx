"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
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
}: TopicTabsProps) {
  const [ownActive, setOwnActive] = useState(0);
  const id = useId();
  const current = Math.min(active ?? ownActive, tabs.length - 1);

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
            {tab.title.trim() || "Untitled"}
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
        </div>
      ))}
    </div>
  );
}
