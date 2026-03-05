"use client";

import { useDevice } from "@/components/providers/DeviceProvider";
import { LoginPageMobile } from "./LoginPageMobile";
import { LoginPageDesktop } from "./LoginPageDesktop";

export function LoginPageUI() {
  const { isMobile } = useDevice();

  if (isMobile) {
    return <LoginPageMobile />;
  }

  return <LoginPageDesktop />;
}
