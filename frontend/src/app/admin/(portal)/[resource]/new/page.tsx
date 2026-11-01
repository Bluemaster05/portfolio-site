import { ResourceNewPage } from './ResourceNewPage';

// The admin renders in the browser after sign-in, so instant-navigation validation can't render it
export const instant = false;

export default function AdminResourceNewPage() {
  return <ResourceNewPage />;
}
