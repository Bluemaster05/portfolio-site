'use client';

import { notFound, useParams } from 'next/navigation';
import { isResourceKey, withResource } from '@/lib/admin/resources';
import { ContentEditContainer } from '../ContentContainers';

export function ResourceNewPage() {
  const { resource } = useParams<{ resource: string }>();
  if (!isResourceKey(resource)) notFound();
  return withResource(resource, (definition) => <ContentEditContainer resource={definition} />);
}
