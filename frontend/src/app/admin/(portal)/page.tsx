import { DashboardPage } from './DashboardPage';

// The admin renders in the browser after sign-in, so instant-navigation validation can't render it
export const instant = false;

export default function AdminDashboardPage() {
  return <DashboardPage />;
}
