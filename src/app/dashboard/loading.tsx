import { LoadingCard } from '@/components/shared/LoadingCard';

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col p-6">
      <div className="animate-shimmer rounded-2xl h-10 w-64 mb-8" />
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <LoadingCard height="h-56" />
        <LoadingCard height="h-48" />
        <LoadingCard height="h-48" />
        <div className="lg:col-span-3">
          <LoadingCard height="h-32" />
        </div>
        <LoadingCard height="h-64" />
        <div className="lg:col-span-2">
          <LoadingCard height="h-64" />
        </div>
        <div className="lg:col-span-3">
          <LoadingCard height="h-48" />
        </div>
      </div>
    </div>
  );
}
