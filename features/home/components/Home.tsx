"use client";

import { useDevice } from "@/components/providers/DeviceProvider";
import { HomeDesktop, type HomeViewProps } from "./HomeDesktop";
import { HomeMobile } from "./HomeMobile";

export function Home(props: HomeViewProps) {
  const { isMobile } = useDevice();

  if (isMobile) {
    return <HomeMobile {...props} />;
  }

  return <HomeDesktop {...props} />;
}
