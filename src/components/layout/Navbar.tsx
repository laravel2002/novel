"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDevice } from "@/components/providers/DeviceProvider";
import { DesktopNavbar } from "./DesktopNavbar";
import { MobileNavbar } from "./MobileNavbar";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const { isMobile } = useDevice();

  const isChapterPage = pathname?.includes("/chuong-");

  // Smart Header Logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Make visible at the top
      if (currentScrollY < 10) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Hide when scrolling down
      if (currentScrollY > lastScrollY) {
        setIsVisible(false); // Scrolling down
      } else {
        setIsVisible(true); // Scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Don't render Mobile Navbar on Chapter Page (to maximize reading space)
  if (isMobile && isChapterPage) {
    return null;
  }

  return (
    <header
      suppressHydrationWarning
      className={cn(
        "fixed top-0 left-0 z-50 w-full bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 subtle-border shadow-xs transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      {isMobile ? <MobileNavbar /> : <DesktopNavbar />}
    </header>
  );
}
