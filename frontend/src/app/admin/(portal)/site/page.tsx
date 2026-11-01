import { SiteSettingsPage } from './SiteSettingsPage';

// The admin renders in the browser after sign-in, so instant-navigation validation can't render it
export const instant = false;

export default function AdminSiteSettingsPage() {
  return <SiteSettingsPage />;
}
