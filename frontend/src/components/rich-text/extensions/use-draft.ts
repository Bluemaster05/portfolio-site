import { useState } from 'react';

/**
 * A value edited inside a node view (a text box's text, a list of images, …). Node attributes
 * reach the view a render after the keystroke that changed them, and a controlled box re-set to
 * that value jumps its caret to the end. Editing a local copy keeps the caret in place while every
 * change still goes to the node. The copy starts from `value` and doesn't follow later outside
 * changes: give the component a `key` that changes when it should start over (e.g. switching code
 * tabs).
 */
export function useDraft<T>(value: T, onChange: (next: T) => void): [T, (next: T) => void] {
  const [draft, setDraft] = useState(value);
  return [
    draft,
    (next) => {
      setDraft(next);
      onChange(next);
    },
  ];
}
