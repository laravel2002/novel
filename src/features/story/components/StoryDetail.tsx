"use client";

import { useDevice } from "@/components/providers/DeviceProvider";

import { StoryDetailMobile } from "./mobile/StoryDetailMobile";
import { StoryDetailDesktop } from "./desktop/StoryDetailDesktop";

export interface StoryDetailProps {
  story: any;
  slug: string;
  firstChapterNum: number | undefined;
  initialLibraryStatus: string | null;
  userRatingScore: number | null;
  nominatedToday: boolean;
  remainingNominations: number;
  totalNominations: number;
  isLoggedIn: boolean;
  topFans: any[];
  comments: any[];
  relatedStoriesPromise?: Promise<any[]>;
  initialChaptersPromise?: Promise<any[]>;
}

export function StoryDetail(props: StoryDetailProps) {
  const { isMobile } = useDevice();

  if (isMobile) {
    return <StoryDetailMobile {...props} />;
  }

  // Mặc định trả về bản Desktop cho các màn hình >= Tablet
  return <StoryDetailDesktop {...props} />;
}
