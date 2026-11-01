import { highlight } from './highlight';
import { CodeTabsView } from './CodeTabsView';
import type { CodeTab } from './types';

/** Highlights every tab on the server; only the tab switching runs in the browser. */
export async function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  if (tabs.length === 0) return null;
  const highlighted = await Promise.all(
    tabs.map(async (tab) => ({ label: tab.label, html: await highlight(tab.code, tab.language) })),
  );
  return <CodeTabsView tabs={highlighted} />;
}
