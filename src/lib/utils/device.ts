import { headers } from "next/headers";

type DeviceType = "desktop" | "mobile" | "tablet";

export interface IDeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: DeviceType;
}

export async function getDeviceInfo(): Promise<IDeviceInfo> {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  const isMobile = Boolean(
    userAgent.match(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
    ),
  );

  const isTablet = Boolean(userAgent.match(/iPad|Android(?!.*Mobile)|Tablet/i));

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    deviceType: isTablet ? "tablet" : isMobile ? "mobile" : "desktop",
  };
}
