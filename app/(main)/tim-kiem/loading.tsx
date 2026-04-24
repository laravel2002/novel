import StoryListItemSkeleton from "@/features/story/components/shared/StoryListItemSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#141413] pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header Skeleton */}
        <div className="mb-12 space-y-4">
          <div className="h-4 w-24 bg-[#b0aea5]/10 animate-pulse rounded" />
          <div className="h-10 w-64 bg-[#b0aea5]/10 animate-pulse rounded-lg" />
        </div>

        {/* Results Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
          {[...Array(10)].map((_, i) => (
            <StoryListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
