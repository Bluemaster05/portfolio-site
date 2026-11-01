import { ApiTokensPage } from './ApiTokensPage';

// The admin renders in the browser after sign-in, so instant-navigation validation can't render it
export const instant = false;

export default function AdminApiTokensPage() {
  return <ApiTokensPage />;
}
