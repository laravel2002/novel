"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DeviceType, BREAKPOINTS } from "@/lib/device";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface DeviceContextProps {
  device: DeviceType;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const DeviceContext = createContext<DeviceContextProps | undefined>(undefined);

export function DeviceProvider({
  children,
  initialDevice,
}: {
  children: React.ReactNode;
  initialDevice: DeviceType;
}) {
  // Lấy giá trị SSR ban đầu làm state gốc (Two-pass Rendering để né Hydration Error)
  const [device, setDevice] = useState<DeviceType>(initialDevice);

  // Hook đo lường screen Real-time
  const isDesktopQuery = useMediaQuery(`(min-width: ${BREAKPOINTS.desktop}px)`);
  const isTabletQuery = useMediaQuery(
    `(min-width: ${BREAKPOINTS.tablet}px) and (max-width: ${BREAKPOINTS.desktop - 1}px)`,
  );
  const isMobileQuery = useMediaQuery(
    `(max-width: ${BREAKPOINTS.tablet - 1}px)`,
  );

  useEffect(() => {
    // Chỉ update device state khi viewport kích hoạt breakpoint mới thật sự (Client-side)
    if (isDesktopQuery) setDevice("desktop");
    else if (isTabletQuery) setDevice("tablet");
    else if (isMobileQuery) setDevice("mobile");
  }, [isDesktopQuery, isTabletQuery, isMobileQuery]);

  const value = {
    device,
    isMobile: device === "mobile",
    isTablet: device === "tablet",
    isDesktop: device === "desktop",
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}

/**
 * Hook để các component con đăng ký và truy cập thuộc tính Platform linh hoạt
 */
export function useDevice() {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error("useDevice phải được gọi bên trong <DeviceProvider>");
  }
  return context;
}
