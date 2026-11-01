'use client';

import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { Fragment, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import { getVersion, subscribe, tokensFor } from '../../client-highlight';
import { CODE_INDENT } from '../../languages';
import { codeTabsOf, type CodeTab } from '../../types';
import { LanguagePicker } from '../LanguagePicker';
import { useDraft } from '../use-draft';

/** Editing UI for a codeTabs block: rename, add, remove, and edit tabs. */
export function CodeTabsNodeView({ node, updateAttributes, deleteNode, selected }: ReactNodeViewProps) {
  const tabs = codeTabsOf({ type: 'codeTabs', attrs: node.attrs });
  const [active, setActive] = useState(0);
  const current = tabs[Math.min(active, tabs.length - 1)];

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
          {/* Starts over (fresh drafts) when a different tab is shown */}
          <TabEditor key={`${active}/${tabs.length}`} tab={current} onChange={updateCurrent} />
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

/** Label, language and code of one tab, edited through local drafts (see useDraft). */
function TabEditor({ tab, onChange }: { tab: CodeTab; onChange: (patch: Partial<CodeTab>) => void }) {
  const [label, setLabel] = useDraft(tab.label, (next) => onChange({ label: next }));
  const [language, setLanguage] = useState(tab.language);

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <label className="grid flex-1 gap-1 text-xs text-muted">
          Tab label
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="rounded border border-border bg-background px-2 py-1 font-mono text-sm text-foreground"
          />
        </label>
        <LanguagePicker
          value={language}
          onChange={(next) => {
            setLanguage(next);
            onChange({ language: next });
          }}
        />
      </div>
      <HighlightedTextarea
        initialCode={tab.code}
        language={language}
        label={`Code for ${label}`}
        onChange={(code) => onChange({ code })}
      />
    </>
  );
}

/**
 * A textarea with syntax colors: the colored code is drawn in a layer behind the textarea, whose own
 * text is transparent (the caret and selection still show). Both layers share font, padding and
 * line height, and the back layer follows the textarea's scroll.
 *
 * Tab indents instead of leaving the box (Shift+Tab outdents). Escape first to Tab out.
 */
function HighlightedTextarea({
  initialCode,
  language,
  label,
  onChange,
}: {
  initialCode: string;
  language: string;
  label: string;
  onChange: (code: string) => void;
}) {
  const [code, setCode] = useDraft(initialCode, onChange);
  // Re-render when Shiki or this language finishes loading
  useSyncExternalStore(subscribe, getVersion, getVersion);
  const lines = tokensFor(code, language);
  const backRef = useRef<HTMLDivElement>(null);
  const escaped = useRef(false);
  const hintId = useId();
  const layer = 'col-start-1 row-start-1 m-0 whitespace-pre p-3 font-mono text-sm leading-6';

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const wasEscaped = escaped.current;
    escaped.current = event.key === 'Escape';
    if (event.key !== 'Tab' || event.ctrlKey || event.altKey || event.metaKey || wasEscaped) return;
    event.preventDefault();
    indent(event.currentTarget, event.shiftKey);
  }

  return (
    <div className="grid overflow-hidden rounded border border-border bg-code">
      <div ref={backRef} aria-hidden="true" className={`${layer} pointer-events-none overflow-hidden text-foreground`}>
        {lines
          ? lines.map((line, index) => (
              <Fragment key={index}>
                {index > 0 && '\n'}
                {line.map((token, tokenIndex) => (
                  <span key={tokenIndex} style={{ color: token.color }}>
                    {token.content}
                  </span>
                ))}
              </Fragment>
            ))
          : code}
        {/* Keeps a trailing empty line as tall as it is in the textarea */}
        {'\n'}
      </div>
      <textarea
        value={code}
        onChange={(event) => setCode(event.target.value)}
        onKeyDown={onKeyDown}
        onScroll={(event) => {
          if (!backRef.current) return;
          backRef.current.scrollTop = event.currentTarget.scrollTop;
          backRef.current.scrollLeft = event.currentTarget.scrollLeft;
        }}
        wrap="off"
        spellCheck={false}
        rows={Math.min(24, Math.max(6, code.split('\n').length + 1))}
        aria-label={label}
        aria-describedby={hintId}
        className={`${layer} resize-none overflow-auto bg-transparent text-transparent caret-foreground selection:bg-accent-soft focus:outline-none`}
      />
      <span id={hintId} className="sr-only">
        Tab indents. Press Escape, then Tab, to move on.
      </span>
    </div>
  );
}

/**
 * Indents (or outdents) at the caret, or every selected line. Goes through insertText so the
 * browser's undo history and the textarea's input event both still work.
 */
function indent(textarea: HTMLTextAreaElement, outdent: boolean) {
  const { value, selectionStart: start, selectionEnd: end } = textarea;
  if (!outdent && start === end) {
    insertText(textarea, CODE_INDENT);
    return;
  }

  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const lines = value.slice(lineStart, end).split('\n');
  const leading = new RegExp(`^ {1,${CODE_INDENT.length}}`);
  const changed = lines.map((line) => (outdent ? line.replace(leading, '') : CODE_INDENT + line));
  const replacement = changed.join('\n');
  if (replacement === lines.join('\n')) return;

  textarea.setSelectionRange(lineStart, end);
  insertText(textarea, replacement);
  if (start === end) {
    // A caret stays where it was, minus what was removed in front of it
    const caret = Math.max(lineStart, start - (lines[0].length - changed[0].length));
    textarea.setSelectionRange(caret, caret);
  } else {
    textarea.setSelectionRange(lineStart, lineStart + replacement.length);
  }
}

function insertText(textarea: HTMLTextAreaElement, text: string) {
  // execCommand is deprecated but still the only way to edit a textarea with native undo
  if (document.execCommand('insertText', false, text)) return;
  textarea.setRangeText(text, textarea.selectionStart, textarea.selectionEnd, 'end');
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}
