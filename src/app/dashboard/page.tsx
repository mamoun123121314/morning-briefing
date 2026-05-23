import { DashboardGrid } from '@/components/layout/DashboardGrid';
import { BreadcrumbJsonLd } from '@/components/shared/BreadcrumbJsonLd';

export default function DashboardPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Home', url: '/' },
        { name: 'Dashboard', url: '/dashboard' },
      ]} />
      <DashboardGrid />
    </>
  );
}
