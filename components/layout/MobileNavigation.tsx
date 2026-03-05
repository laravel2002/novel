"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconCompass,
  IconBook2,
  IconUser,
  IconClock,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function MobileNavigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Ẩn Bottom Nav trên trang đọc truyện để tối đa màn hình
  const isReadingPage = pathname.match(/^\/truyen\/[^/]+\/.+$/);

  if (isReadingPage) {
    return null;
  }

  const navItems = [
    {
      href: "/",
      label: "Trang Chủ",
      icon: IconHome,
      isActive: pathname === "/",
    },
    {
      href: "/kham-pha",
      label: "Khám Phá",
      icon: IconCompass,
      isActive:
        pathname.startsWith("/kham-pha") ||
        pathname.startsWith("/the-loai") ||
        pathname.startsWith("/bang-xep-hang") ||
        pathname.startsWith("/tim-kiem") ||
        pathname.startsWith("/hoan-thanh"),
    },
    {
      href: "/tu-truyen",
      label: "Tủ Truyện",
      icon: IconBook2,
      isActive: pathname.startsWith("/tu-truyen"),
    },
    {
      href: "/lich-su",
      label: "Lịch Sử",
      icon: IconClock,
      isActive: pathname.startsWith("/lich-su"),
    },
    {
      href: session?.user ? "/ca-nhan" : "/dang-nhap",
      label: session?.user ? "Cá Nhân" : "Tài Khoản",
      icon: IconUser,
      isActive:
        pathname.startsWith("/ca-nhan") ||
        pathname.startsWith("/dang-nhap") ||
        pathname.startsWith("/dang-ky"),
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-t border-border/50 pb-safe">
      <nav className="flex items-center justify-around h-16 sm:h-18 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95",
                item.isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center transition-all duration-300",
                  item.isActive ? "scale-110" : "",
                )}
              >
                {item.isActive && (
                  <span className="absolute inset-0 bg-primary/20 blur-md rounded-full -z-10" />
                )}
                <Icon
                  className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 transition-all",
                    item.isActive ? "stroke-[2.5px]" : "stroke-[1.5px]",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-semibold transition-all transition-colors duration-300 pt-0.5",
                  item.isActive ? "font-bold text-primary" : "font-medium",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
