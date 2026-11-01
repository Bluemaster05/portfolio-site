import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import type { CodeTab } from '../../types';
import { CodeTabsNodeView } from './CodeTabsNodeView';

export const DEFAULT_CODE_TABS: CodeTab[] = [{ label: 'example.ts', language: 'typescript', code: '' }];

/**
 * A block of tabbed code snippets. Stored as `{ type: 'codeTabs', attrs: { tabs: CodeTab[] } }`
 * and rendered on the public site by RichTextRenderer (see docs/RichContent.md).
 */
export const CodeTabsExtension = Node.create({
  name: 'codeTabs',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      tabs: {
        default: DEFAULT_CODE_TABS,
        // Kept in a data attribute so copy/paste between editors round-trips
        parseHTML: (element) => {
          try {
            return JSON.parse(element.getAttribute('data-tabs') ?? '[]');
          } catch {
            return DEFAULT_CODE_TABS;
          }
        },
        renderHTML: (attributes) => ({ 'data-tabs': JSON.stringify(attributes.tabs) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-code-tabs]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-code-tabs': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeTabsNodeView);
  },
});
