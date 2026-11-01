import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { subscribe, tokensFor } from '../../client-highlight';

const highlightKey = new PluginKey<DecorationSet>('codeHighlight');

function languageOf(node: ProseMirrorNode): string {
  return typeof node.attrs.language === 'string' ? node.attrs.language : '';
}

/** Colors every code block's text with inline decorations; the stored document is untouched. */
function decorate(doc: ProseMirrorNode, nodeName: string): DecorationSet {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name !== nodeName) return true;
    let from = pos + 1;
    for (const line of tokensFor(node.textContent, languageOf(node)) ?? []) {
      for (const token of line) {
        const to = from + token.content.length;
        if (token.color) decorations.push(Decoration.inline(from, to, { style: `color:${token.color}` }));
        from = to;
      }
      from += 1; // the newline between lines
    }
    return false;
  });
  return DecorationSet.create(doc, decorations);
}

export function codeHighlightPlugin(nodeName: string): Plugin<DecorationSet> {
  return new Plugin({
    key: highlightKey,
    state: {
      init: (_, { doc }) => decorate(doc, nodeName),
      apply: (tr, previous) => (tr.docChanged || tr.getMeta(highlightKey) ? decorate(tr.doc, nodeName) : previous),
    },
    props: {
      decorations: (state) => highlightKey.getState(state),
    },
    // Recolor once Shiki or a newly used language has loaded (this doesn't change the document)
    view: (view) => ({
      destroy: subscribe(() => view.dispatch(view.state.tr.setMeta(highlightKey, true))),
    }),
  });
}
