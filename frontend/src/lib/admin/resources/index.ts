import type { ReactNode } from 'react';
import { blogResource } from './blog';
import { educationResource } from './education';
import { experienceResource } from './experience';
import { honorsResource } from './honors';
import { projectsResource } from './projects';
import type { ContentItemBase, ContentResource } from './resource';

export type ResourceKey = ContentResource<ContentItemBase>['key'];

export const RESOURCE_KEYS: ResourceKey[] = ['projects', 'experience', 'education', 'honors', 'blog'];

export function isResourceKey(value: string): value is ResourceKey {
  return RESOURCE_KEYS.some((key) => key === value);
}

/**
 * Calls `render` with the resource for `key`. Each branch keeps its own item type, which a plain
 * lookup table (a union of resources) would lose.
 */
export function withResource(
  key: ResourceKey,
  render: <Item extends ContentItemBase>(resource: ContentResource<Item>) => ReactNode,
): ReactNode {
  switch (key) {
    case 'projects':
      return render(projectsResource);
    case 'experience':
      return render(experienceResource);
    case 'education':
      return render(educationResource);
    case 'honors':
      return render(honorsResource);
    case 'blog':
      return render(blogResource);
  }
}

export const RESOURCE_LABELS: Record<ResourceKey, string> = {
  projects: projectsResource.label,
  experience: experienceResource.label,
  education: educationResource.label,
  honors: honorsResource.label,
  blog: blogResource.label,
};
