import { Skeleton } from "@/components/ui/skeleton";

export default function StoryDetailLoading() {
  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Hero Header Skeleton */}
      <div className="relative w-full bg-slate-50 dark:bg-slate-900 text-foreground overflow-hidden py-12">
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Info Skeleton */}
            <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
              <Skeleton className="w-10 h-10 rounded-full mb-2" />
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>

              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-1/2" />

              <div className="flex flex-wrap gap-4 mt-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Skeleton className="h-12 w-40 rounded-full" />
                <Skeleton className="h-12 w-40 rounded-full" />
              </div>
            </div>

            {/* Right Cover Skeleton */}
            <div className="lg:col-span-4 flex justify-center lg:justify-start order-1 lg:order-2">
              <Skeleton className="w-48 md:w-64 aspect-2/3 rounded-lg rotate-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="container mx-auto py-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
