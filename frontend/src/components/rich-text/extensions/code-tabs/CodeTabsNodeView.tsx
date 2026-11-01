'use client';

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { useId, useState } from 'react';
import { codeTabsOf, type CodeTab } from '../../types';

/** Common choices; any Shiki language id also works when typed in. */
const LANGUAGES = [
  'typescript', 'tsx', 'javascript', 'jsx', 'python', 'java', 'csharp', 'cpp', 'c', 'go', 'rust',
  'kotlin', 'swift', 'php', 'ruby', 'sql', 'html', 'css', 'json', 'yaml', 'bash', 'powershell',
  'markdown', 'dockerfile', 'text',
];

/** Editing UI for a codeTabs block: rename, add, remove, and edit tabs. */
export function CodeTabsNodeView({ node, updateAttributes, deleteNode, selected }: ReactNodeViewProps) {
  const tabs = codeTabsOf({ type: 'codeTabs', attrs: node.attrs });
  const [active, setActive] = useState(0);
  const current = tabs[Math.min(active, tabs.length - 1)];
  const listId = useId();

  function setTabs(next: CodeTab[]) {
    updateAttributes({ tabs: next });
  }

  function updateCurrent(patch: Partial<CodeTab>) {
    setTabs(tabs.map((tab, index) => (index === active ? { ...tab, ...patch } : tab)));
  }

  function addTab() {
    setTabs([...tabs, { label: `file${tabs.length + 1}.txt`, language: 'text', code: '' }]);
    setActive(tabs.length);
  }

  function removeTab() {
    if (tabs.length <= 1) {
      deleteNode();
      return;
    }
    setTabs(tabs.filter((_, index) => index !== active));
    setActive(Math.max(0, active - 1));
  }

  return (
    <NodeViewWrapper
      className={`my-4 rounded-card border bg-surface p-3 ${selected ? 'border-accent' : 'border-border'}`}
      contentEditable={false}
    >
      <div className="mb-2 flex flex-wrap items-center gap-1">
        {tabs.map((tab, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setActive(index)}
            className={`rounded px-2 py-1 font-mono text-sm ${
              index === active ? 'bg-accent-soft text-foreground' : 'text-muted hover:text-foreground'
            }`}
          >
            {tab.label || 'Untitled'}
          </button>
        ))}
        <button type="button" onClick={addTab} className="rounded px-2 py-1 text-sm text-accent">
          + Tab
        </button>
      </div>

      {current && (
        <div className="grid gap-2">
          <div className="flex flex-wrap gap-2">
            <label className="grid flex-1 gap-1 text-xs text-muted">
              Tab label
              <input
                value={current.label}
                onChange={(event) => updateCurrent({ label: event.target.value })}
                className="rounded border border-border bg-background px-2 py-1 font-mono text-sm text-foreground"
              />
            </label>
            <label className="grid gap-1 text-xs text-muted">
              Language
              <input
                list={listId}
                value={current.language}
                onChange={(event) => updateCurrent({ language: event.target.value })}
                className="rounded border border-border bg-background px-2 py-1 font-mono text-sm text-foreground"
              />
              <datalist id={listId}>
                {LANGUAGES.map((language) => (
                  <option key={language} value={language} />
                ))}
              </datalist>
            </label>
          </div>
          <textarea
            value={current.code}
            onChange={(event) => updateCurrent({ code: event.target.value })}
            spellCheck={false}
            rows={Math.min(24, Math.max(6, current.code.split('\n').length + 1))}
            aria-label={`Code for ${current.label}`}
            className="w-full rounded border border-border bg-code p-3 font-mono text-sm text-foreground"
          />
          <div className="flex justify-end">
            <button type="button" onClick={removeTab} className="text-sm text-muted hover:text-red-600">
              {tabs.length <= 1 ? 'Remove code block' : 'Remove this tab'}
            </button>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}
