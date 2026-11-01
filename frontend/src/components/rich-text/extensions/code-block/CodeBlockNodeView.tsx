'use client';

import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react';
import { LanguageInput } from '../LanguageInput';

/** A code block in the editor: language field on top, editable (and colored) code below. */
export function CodeBlockNodeView({ node, updateAttributes }: ReactNodeViewProps) {
  const language = typeof node.attrs.language === 'string' ? node.attrs.language : '';

  return (
    <NodeViewWrapper className="code-block-editor my-4 overflow-clip rounded-card border border-border bg-code">
      <div contentEditable={false} className="flex justify-end border-b border-border bg-surface px-3 py-1.5">
        <LanguageInput
          inline
          value={language}
          onChange={(next) => updateAttributes({ language: next.trim() || null })}
        />
      </div>
      <pre spellCheck={false}>
        <NodeViewContent<'code'> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
