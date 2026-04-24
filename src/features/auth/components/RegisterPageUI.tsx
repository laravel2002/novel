"use client";

import { useDevice } from "@/components/providers/DeviceProvider";
import { RegisterPageMobile } from "./RegisterPageMobile";
import { RegisterPageDesktop } from "./RegisterPageDesktop";

export function RegisterPageUI() {
  const { isMobile } = useDevice();

  if (isMobile) {
    return <RegisterPageMobile />;
  }

  return <RegisterPageDesktop />;
}
