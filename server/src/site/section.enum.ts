import { ApiScope } from '../api-tokens/api-scope.enum.js';

/** Public sections of the site; each can be switched off in site settings. */
export enum Section {
  Home = 'home',
  Projects = 'projects',
  Experience = 'experience',
  Education = 'education',
  Blog = 'blog',
  Honors = 'honors',
}

export const SECTION_SCOPES: Record<Exclude<Section, Section.Home>, ApiScope> = {
  [Section.Projects]: ApiScope.Projects,
  [Section.Experience]: ApiScope.Experience,
  [Section.Education]: ApiScope.Education,
  [Section.Blog]: ApiScope.Blog,
  [Section.Honors]: ApiScope.Honors,
};

export type SectionToggles = Record<Section, boolean>;

export const DEFAULT_SECTION_TOGGLES: SectionToggles = {
  [Section.Home]: true,
  [Section.Projects]: true,
  [Section.Experience]: true,
  [Section.Education]: true,
  [Section.Blog]: false,
  [Section.Honors]: true,
};
