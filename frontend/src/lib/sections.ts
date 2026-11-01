import type { SectionKey, SectionToggles } from './api/types';

export interface SectionInfo {
  key: SectionKey;
  label: string;
  href: string;
}

/** Public sections in navigation order. */
export const SECTIONS: SectionInfo[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'projects', label: 'Projects', href: '/projects' },
  { key: 'experience', label: 'Experience', href: '/experience' },
  { key: 'education', label: 'Education', href: '/education' },
  { key: 'honors', label: 'Honors', href: '/honors' },
  { key: 'blog', label: 'Blog', href: '/blog' },
];

export function enabledSections(toggles: SectionToggles | undefined): SectionInfo[] {
  if (!toggles) return [];
  return SECTIONS.filter((section) => toggles[section.key]);
}
