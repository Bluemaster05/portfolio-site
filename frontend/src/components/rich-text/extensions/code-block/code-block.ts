import CodeBlock from '@tiptap/extension-code-block';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { CODE_INDENT } from '../../languages';
import { CodeBlockNodeView } from './CodeBlockNodeView';
import { codeHighlightPlugin } from './highlight-plugin';

/**
 * The stock code block with a language field above it and syntax colors while editing. The
 * language is stored in `attrs.language` and used by the public renderer's Shiki highlighting.
 */
export const HighlightedCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView);
  },

  addProseMirrorPlugins() {
    return [...(this.parent?.() ?? []), codeHighlightPlugin(this.name)];
  },
  // Tab indents inside a code block (Shift+Tab outdents) instead of leaving the editor
}).configure({ enableTabIndentation: true, tabSize: CODE_INDENT.length });
