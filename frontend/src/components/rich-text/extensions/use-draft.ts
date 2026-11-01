import { useState } from 'react';

/**
 * A text box's value inside a node view. Node attributes reach the view a render after the
 * keystroke that changed them, and a controlled box re-set to that value jumps its caret to the
 * end. Editing a local copy keeps the caret in place while every change still goes to the node.
 * The copy starts from `value` and doesn't follow later outside changes: give the component a
 * `key` that changes when it should start over (e.g. switching code tabs).
 */
export function useDraft(value: string, onChange: (next: string) => void): [string, (next: string) => void] {
  const [draft, setDraft] = useState(value);
  return [
    draft,
    (next) => {
      setDraft(next);
      onChange(next);
    },
  ];
}
