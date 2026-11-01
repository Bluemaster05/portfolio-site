import { Fragment, type ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';
import { CodeTabs } from './CodeTabs';
import {
  childrenOf,
  codeTabsOf,
  numberAttr,
  safeHref,
  stringAttr,
  toDoc,
  type RichTextNode,
} from './types';

/**
 * Renders a stored TipTap document as semantic HTML on the server. Only the node and mark types
 * below are rendered; anything else is skipped, so stored content can't inject markup.
 * To add a block type see docs/RichContent.md.
 */
export function RichTextRenderer({ doc, className = '' }: { doc: unknown; className?: string }) {
  return <div className={`prose ${className}`}>{renderChildren(toDoc(doc))}</div>;
}

function renderChildren(node: RichTextNode): ReactNode[] {
  return childrenOf(node).map((child, index) => renderNode(child, index));
}

function plainText(node: RichTextNode): string {
  if (node.type === 'text') return node.text ?? '';
  return childrenOf(node).map(plainText).join('');
}

function renderNode(node: RichTextNode, key: number): ReactNode {
  switch (node.type) {
    case 'paragraph':
      return <p key={key}>{renderChildren(node)}</p>;
    case 'heading': {
      // h1 is the page title, so document headings start at h2
      const level = Math.min(Math.max(numberAttr(node, 'level') ?? 2, 2), 4);
      const Tag = `h${level}` as 'h2' | 'h3' | 'h4';
      return <Tag key={key}>{renderChildren(node)}</Tag>;
    }
    case 'bulletList':
      return <ul key={key}>{renderChildren(node)}</ul>;
    case 'orderedList':
      return (
        <ol key={key} start={numberAttr(node, 'start')}>
          {renderChildren(node)}
        </ol>
      );
    case 'listItem':
      return <li key={key}>{renderChildren(node)}</li>;
    case 'blockquote':
      return <blockquote key={key}>{renderChildren(node)}</blockquote>;
    case 'horizontalRule':
      return <hr key={key} />;
    case 'hardBreak':
      return <br key={key} />;
    case 'codeBlock':
      return (
        <CodeBlock key={key} code={plainText(node)} language={stringAttr(node, 'language') ?? 'text'} />
      );
    case 'codeTabs':
      return <CodeTabs key={key} tabs={codeTabsOf(node)} />;
    case 'image': {
      const src = stringAttr(node, 'src');
      if (!src || !/^https?:\/\//i.test(src)) return null;
      // Stored images can live on any host, so next/image's allow-list doesn't fit here
      // eslint-disable-next-line @next/next/no-img-element
      return <img key={key} src={src} alt={stringAttr(node, 'alt') ?? ''} loading="lazy" />;
    }
    case 'text':
      return renderText(node, key);
    default:
      return null;
  }
}

function renderText(node: RichTextNode, key: number): ReactNode {
  let content: ReactNode = node.text ?? '';
  for (const mark of node.marks ?? []) {
    switch (mark.type) {
      case 'bold':
        content = <strong>{content}</strong>;
        break;
      case 'italic':
        content = <em>{content}</em>;
        break;
      case 'underline':
        content = <u>{content}</u>;
        break;
      case 'strike':
        content = <s>{content}</s>;
        break;
      case 'code':
        content = <code>{content}</code>;
        break;
      case 'link': {
        const href = safeHref(stringAttr(mark, 'href'));
        if (href) {
          const external = /^https?:/i.test(href);
          content = (
            <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {content}
            </a>
          );
        }
        break;
      }
    }
  }
  return <Fragment key={key}>{content}</Fragment>;
}
