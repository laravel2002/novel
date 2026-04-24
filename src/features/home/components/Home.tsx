"use client";

import { useDevice } from "@/components/providers/DeviceProvider";
import { HomeDesktop } from "./HomeDesktop";
import { HomeMobile } from "./HomeMobile";

export interface HomeViewProps {
  featuredStoryPromise: Promise<any>;
  latestStoriesPromise: Promise<any[]>;
  topViewsSidebarPromise: Promise<any[]>;
  topRatedPromise: Promise<any[]>;
  completedStoriesPromise: Promise<any[]>;
}

export function Home(props: HomeViewProps) {
  const { isMobile } = useDevice();

  if (isMobile) {
    return <HomeMobile {...props} />;
  }

  return <HomeDesktop {...props} />;
}
