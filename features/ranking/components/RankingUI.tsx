"use client";

import { useDevice } from "@/components/providers/DeviceProvider";
import {
  RankingDesktop,
  type RankingViewProps,
} from "./desktop/RankingDesktop";
import { RankingMobile } from "./mobile/RankingMobile";

export function RankingUI(props: RankingViewProps) {
  const { isMobile } = useDevice();

  if (isMobile) {
    return <RankingMobile {...props} />;
  }

  return <RankingDesktop {...props} />;
}
