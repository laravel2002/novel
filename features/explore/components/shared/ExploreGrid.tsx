"use client";

import Link from "next/link";
import {
  IconCrown,
  IconCategory,
  IconChecklist,
  IconBooks,
} from "@tabler/icons-react";

export function ExploreGrid() {
  const gridItems = [
    {
      title: "Bảng Xếp Hạng",
      href: "/bang-xep-hang",
      icon: <IconCrown className="w-8 h-8 text-amber-500 mb-2" />,
      gradient: "from-amber-500/10 to-transparent border-amber-500/20",
    },
    {
      title: "Thể Loại",
      href: "/the-loai",
      icon: <IconCategory className="w-8 h-8 text-blue-500 mb-2" />,
      gradient: "from-blue-500/10 to-transparent border-blue-500/20",
    },
    {
      title: "Hoàn Thành",
      href: "/hoan-thanh",
      icon: <IconChecklist className="w-8 h-8 text-emerald-500 mb-2" />,
      gradient: "from-emerald-500/10 to-transparent border-emerald-500/20",
    },
    {
      title: "Tủ Truyện",
      href: "/tu-truyen",
      icon: <IconBooks className="w-8 h-8 text-purple-500 mb-2" />,
      gradient: "from-purple-500/10 to-transparent border-purple-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {gridItems.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
          className={`flex flex-col items-center justify-center p-6 rounded-3xl border bg-gradient-to-b ${item.gradient} hover:scale-[0.98] active:scale-95 transition-all shadow-sm`}
        >
          {item.icon}
          <span className="font-bold text-sm text-foreground tracking-tight">
            {item.title}
          </span>
        </Link>
      ))}
    </div>
  );
}
