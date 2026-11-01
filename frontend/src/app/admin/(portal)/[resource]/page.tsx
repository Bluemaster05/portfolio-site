'use client';

import { notFound, useParams } from 'next/navigation';
import { isResourceKey, withResource } from '@/lib/admin/resources';
import { ContentListContainer } from './ContentContainers';

export default function AdminResourceListPage() {
  const { resource } = useParams<{ resource: string }>();
  if (!isResourceKey(resource)) notFound();
  return withResource(resource, (definition) => <ContentListContainer resource={definition} />);
}
