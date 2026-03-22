import { notFound } from "next/navigation"
import { Metadata } from "next"
import { getCategoryBySlug, getStoriesPaginated } from "@/features/story/services/discovery"
import { RankingList } from "@/features/ranking/components/RankingList"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    return { title: "Không tìm thấy thể loại | Novel" }
  }

  return {
    title: `Truyện ${category.name} | Novel`,
    description: category.description || `Danh sách truyện chữ ${category.name} hay nhất, mới nhất được cập nhật liên tục.`,
  }
}

// 1 Hour ISR cho danh sách truyện trong thể loại
export const revalidate = 3600

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ cursor?: string, sort?: "views" | "updatedAt" | "rating" }>
}) {
  const { slug } = await params
  const { cursor, sort } = await searchParams
  
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  // Xử lý cursor từ URL string sang number
  const parsedCursor = cursor ? parseInt(cursor, 10) : undefined
  const sortBy = sort || "views"

  // Fetch dữ liệu qua Keyset Pagination
  const { data: stories, nextCursor } = await getStoriesPaginated({
    categoryId: category.id,
    limit: 20,
    cursor: parsedCursor,
    sortBy: sortBy,
  })

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl min-h-[70vh]">
      <div className="mb-8">
        <Link 
          href="/the-loai" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <IconChevronLeft className="w-4 h-4 mr-1" /> Tất cả thể loại
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          Truyện {category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>

      {/* Filter/Sort Navigation (Demo Client-side URLs) */}
      <div className="flex gap-2 mb-6 border-b border-border/60 pb-4">
        <Link href={`/the-loai/${slug}?sort=views`}>
           <Button variant={sortBy === "views" ? "default" : "outline"} size="sm" className="rounded-full">
             Xem nhiều
           </Button>
        </Link>
        <Link href={`/the-loai/${slug}?sort=updatedAt`}>
           <Button variant={sortBy === "updatedAt" ? "default" : "outline"} size="sm" className="rounded-full">
             Mới cập nhật
           </Button>
        </Link>
        <Link href={`/the-loai/${slug}?sort=rating`}>
           <Button variant={sortBy === "rating" ? "default" : "outline"} size="sm" className="rounded-full">
             Đánh giá cao
           </Button>
        </Link>
      </div>

      <div className="bg-card w-full rounded-2xl border border-border/50 shadow-xs p-4 sm:p-6">
        {stories.length === 0 ? (
           <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
            Chưa có truyện nào thuộc thể loại này.
          </div>
        ) : (
          <RankingList stories={stories} type={sortBy === "views" ? "views" : "favorites"} />
        )}
        
        {/* Pagination Navigation */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-border/50">
          <Button variant="outline" disabled={!cursor} asChild={!!cursor}>
             {cursor ? (
                // Keyset pagination thường khó quay lại trang trước nếu không lưu history
                // Tạm thời nút quay lại sẽ đưa về trang 1
                <Link href={`/the-loai/${slug}?sort=${sortBy}`}>
                   <IconChevronLeft className="w-4 h-4 mr-2" /> Trang đầu
                </Link>
             ) : (
                <><IconChevronLeft className="w-4 h-4 mr-2" /> Trang trước</>
             )}
          </Button>

          {nextCursor ? (
            <Button variant="outline" asChild>
              <Link href={`/the-loai/${slug}?sort=${sortBy}&cursor=${nextCursor}`}>
                Trang tiếp <IconChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Trang tiếp <IconChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
