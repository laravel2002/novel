import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getStoryBySlug,
  getRelatedStories,
  getTopStoriesByViews,
  getInitialChapters,
} from "@/features/story/services/story";
import { Metadata } from "next";
import {
  IconEye,
  IconStar,
  IconUser,
  IconList,
  IconShare,
  IconFlag,
  IconThumbUp,
  IconMessageCircle,
  IconChevronLeft,
  IconStarFilled,
} from "@tabler/icons-react";
import { cn, getImageUrl } from "@/lib/utils";
import { ReadNowButton } from "@/features/story/components/shared/ReadNowButton";
import ChapterList from "@/features/chapter/components/ChapterList";
import { BookmarkButton } from "@/features/story/components/shared/BookmarkButton";
import { RatingBox } from "@/features/story/components/shared/RatingBox";
import { NominationBox } from "@/features/story/components/shared/NominationBox";
import { checkIsBookmarked } from "@/services/library";
import {
  getUserRating,
  hasNominatedToday,
  getNominationCount,
  getRemainingNominations,
} from "@/services/interaction";
import { auth } from "@/lib/auth/auth";
import { BackButton } from "@/components/shared/BackButton";
import { StoryDetail } from "@/features/story/components/StoryDetail";

export const revalidate = 3600; // Regenerate page every hour

export async function generateStaticParams() {
  const topStories = await getTopStoriesByViews(100);
  return topStories.map((story) => ({
    slug: story.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    return { title: "Không tìm thấy truyện | Novel" };
  }

  return {
    title: `${story.title} - ${story.author} | Novel`,
    description:
      story.description?.substring(0, 160) ||
      `Đọc truyện ${story.title} của tác giả ${story.author}.`,
    openGraph: {
      title: story.title,
      description: story.description?.substring(0, 160) || "",
      images: story.coverUrl ? [{ url: getImageUrl(story.coverUrl) }] : [],
    },
  };
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  const categoryIds = story.categories.map((c) => c.id);
  const relatedStoriesPromise = getRelatedStories(story.id, categoryIds, 6);
  const initialChaptersPromise = getInitialChapters(story.id, 50);
  const firstChapterNum = story.chapters[0]?.chapterNum;

  // Kiểm tra trạng thái bookmark, rating, nomination của user
  let initialBookmarked = false;
  let userRatingScore: number | null = null;
  let nominatedToday = false;
  let remainingNominations = 0;
  if (session?.user?.id) {
    [initialBookmarked, userRatingScore, nominatedToday, remainingNominations] =
      await Promise.all([
        checkIsBookmarked(session.user.id, story.id),
        getUserRating(session.user.id, story.id),
        hasNominatedToday(session.user.id, story.id),
        getRemainingNominations(session.user.id),
      ]);
  }

  // Lấy tổng lượt đề cử
  const totalNominations = await getNominationCount(story.id);

  // Mock data cho Top Hâm Mộ
  const topFans = [
    {
      name: "Tư bản tu tiên",
      score: 778,
      avatar: "TB",
      color: "bg-yellow-500",
    },
    { name: "Tom Riddle", score: 596, avatar: "TR", color: "bg-slate-400" },
    { name: "mieuu mieuu", score: 555, avatar: "MM", color: "bg-orange-600" },
    { name: "Tung Pham", score: 544, avatar: "TP", color: "bg-blue-500" },
    {
      name: "Hung Nguyen Dan...",
      score: 525,
      avatar: "HN",
      color: "bg-green-500",
    },
  ];

  // Mock data cho Bình luận
  const comments = [
    {
      id: 1,
      user: "Đức Trần",
      content:
        "Bạn có thể thay Anh ấy thành họ Triệu, họ Lý và tôi thành ta thì đọc nó sẽ đỡ gượng hơn với mối quan hệ của 2 nv",
      time: "6 giờ trước",
      replies: 1,
    },
    {
      id: 2,
      user: "Huy Tôn",
      content:
        "Bộ này có kinh dị không mn? E nhát mà thấy truyện hot cũng tò mò",
      time: "11 giờ trước",
      replies: 1,
    },
    {
      id: 3,
      user: "Trọng Phan",
      content: "ai có link discord k mình xin vs",
      time: "11 giờ trước",
      replies: 0,
    },
  ];

  return (
    <StoryDetail
      story={story}
      slug={slug}
      firstChapterNum={firstChapterNum}
      initialBookmarked={initialBookmarked}
      userRatingScore={userRatingScore}
      nominatedToday={nominatedToday}
      remainingNominations={remainingNominations}
      totalNominations={totalNominations}
      isLoggedIn={!!session?.user}
      topFans={topFans}
      comments={comments}
      relatedStoriesPromise={relatedStoriesPromise}
      initialChaptersPromise={initialChaptersPromise}
    />
  );
}
