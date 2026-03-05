import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getChapter } from "@/features/story/services/story";
import { auth } from "@/auth";
import { StoryDetailChapter } from "@/features/chapter/components/StoryDetailChapter";

interface PageProps {
  params: Promise<{
    slug: string;
    chapter: string;
  }>;
}

export const revalidate = 3600; // Cache chapter for 1 hour

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, chapter } = await params;
  const chapterMatch = chapter.match(/chuong-([\d.]+)/);
  if (!chapterMatch) return { title: "Không tìm thấy chương | Novel" };

  const chapterNum = parseFloat(chapterMatch[1]);
  const data = await getChapter(slug, chapterNum);

  if (!data || !data.chapter) {
    return { title: "Không tìm thấy chương | Novel" };
  }

  const { story, chapter: currentChapter } = data;
  const title = `${story.title} - Chương ${currentChapter.chapterNum}: ${currentChapter.title || ""} | Novel`;

  return {
    title,
    description: `Đọc online Chương ${currentChapter.chapterNum} của truyện ${story.title} - Tác giả ${story.author || "Đang cập nhật"}.`,
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug, chapter } = await params;
  const session = await auth();

  const chapterMatch = chapter.match(/chuong-([\d.]+)/);
  if (!chapterMatch) {
    notFound();
  }

  const chapterNum = parseFloat(chapterMatch[1]);
  const data = await getChapter(slug, chapterNum);

  if (!data || !data.chapter) {
    notFound();
  }

  const {
    story,
    chapter: currentChapter,
    prevChapter,
    nextChapter,
    chapters,
  } = data;

  return (
    <StoryDetailChapter
      storyId={story.id}
      chapterId={currentChapter.id}
      userId={session?.user?.id || null}
      storyTitle={story.title}
      storySlug={slug}
      author={story.author}
      coverUrl={story.coverUrl}
      chapterNum={currentChapter.chapterNum}
      chapterTitle={currentChapter.title}
      content={currentChapter.content}
      nextChapterUrl={
        nextChapter ? `/truyen/${slug}/chuong-${nextChapter}` : null
      }
      prevChapterUrl={
        prevChapter ? `/truyen/${slug}/chuong-${prevChapter}` : null
      }
      chapters={chapters}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
    />
  );
}
