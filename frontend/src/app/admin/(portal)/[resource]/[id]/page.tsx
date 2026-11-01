'use client';

import { notFound, useParams } from 'next/navigation';
import { isResourceKey, withResource } from '@/lib/admin/resources';
import { ContentEditContainer } from '../ContentContainers';

export default function AdminResourceEditPage() {
  const params = useParams<{ resource: string; id: string }>();
  const id = Number(params.id);
  if (!isResourceKey(params.resource) || !Number.isInteger(id)) notFound();
  return withResource(params.resource, (definition) => <ContentEditContainer resource={definition} id={id} />);
}
