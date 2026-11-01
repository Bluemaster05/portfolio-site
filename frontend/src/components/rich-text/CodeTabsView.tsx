'use client';

import { useId, useState, type KeyboardEvent } from 'react';

interface HighlightedTab {
  label: string;
  html: string;
}

/** Accessible tab list (arrow keys move between tabs) over pre-highlighted snippets. */
export function CodeTabsView({ tabs }: { tabs: HighlightedTab[] }) {
  const [active, setActive] = useState(0);
  const id = useId();

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + tabs.length) % tabs.length;
    setActive(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  return (
    <div className="code-window not-prose overflow-hidden rounded-card border border-border bg-code">
      <div
        role="tablist"
        aria-label="Code samples"
        className="flex overflow-x-auto border-b border-border bg-surface"
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            id={`${id}-tab-${index}`}
            role="tab"
            type="button"
            aria-selected={index === active}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={onKeyDown}
            className={`border-r border-border px-4 py-2 font-mono text-sm transition-colors ${
              index === active
                ? 'bg-code text-foreground shadow-[inset_0_-2px_0_var(--accent)]'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div
          key={index}
          id={`${id}-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${index}`}
          hidden={index !== active}
          className="code-block"
          dangerouslySetInnerHTML={{ __html: tab.html }}
        />
      ))}
    </div>
  );
}
