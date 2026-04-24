import StoryListItemTop3 from "@/features/story/components/shared/StoryListItemTop3";

interface PodiumItemProps {
  story: any;
  index: number; // 0, 1, 2
  variant?: "desktop" | "tablet" | "mobile";
}

export function PodiumItem({
  story,
  index,
  variant = "desktop",
}: PodiumItemProps) {
  const isRank1 = index === 0;

  // Cấu hình style dùng chung cho các thứ hạng
  const rankStyles = [
    // Rank 1
    {
      wrapper: "order-1 relative group w-full z-10",
      desktopTop:
        "absolute left-1/2 -translate-x-1/2 flex items-center justify-center font-serif font-black shadow-[0_0_30px_rgba(234,179,8,0.5)] z-20 rounded-full",
      desktopColors:
        "from-[#fef08a] via-[#eab308] to-[#a16207] text-[#422006] border-[6px] border-[#713f12] ring-4 ring-[#fef08a]",
      desktopSize: "-top-14 w-24 h-24 text-5xl",
      tabletSize: "-top-12 w-20 h-20 text-4xl border-4 ring-2",
      mobileTop:
        "absolute -top-6 left-4 flex items-center justify-center font-serif font-black shadow-lg z-20 rounded-full",
      mobileSize: "w-12 h-12 text-2xl border-2 ring-2",
      mobileColors:
        "from-[#fef08a] via-[#eab308] to-[#a16207] text-[#422006] ring-[#fef08a] border-[#713f12]",
    },
    // Rank 2
    {
      wrapper: "order-2 relative group w-full",
      desktopTop:
        "absolute left-1/2 -translate-x-1/2 flex items-center justify-center font-serif font-black shadow-[0_0_20px_rgba(148,163,184,0.4)] z-20 rounded-full",
      desktopColors:
        "from-[#94a3b8] via-[#e2e8f0] to-[#cbd5e1] text-[#0f172a] border-4 border-[#334155] ring-2 ring-slate-400",
      desktopSize: "-top-10 w-16 h-16 text-3xl",
      tabletSize: "-top-8 w-14 h-14 text-2xl border-2 ring-2 shadow-md",
      mobileTop:
        "absolute -top-6 left-4 flex items-center justify-center font-serif font-black shadow-lg z-20 rounded-full",
      mobileSize: "w-12 h-12 text-2xl border-2 ring-2",
      mobileColors:
        "from-[#94a3b8] via-[#e2e8f0] to-[#cbd5e1] text-[#0f172a] ring-slate-400 border-[#334155]",
    },
    // Rank 3
    {
      wrapper: "order-3 relative group w-full",
      desktopTop:
        "absolute left-1/2 -translate-x-1/2 flex items-center justify-center font-serif font-black shadow-[0_0_15px_rgba(234,88,12,0.4)] z-20 rounded-full",
      desktopColors:
        "from-[#fdba74] via-[#ea580c] to-[#9a3412] text-[#fffbeb] border-4 border-[#431407] ring-2 ring-orange-400",
      desktopSize: "-top-8 w-14 h-14 text-2xl",
      tabletSize: "-top-6 w-12 h-12 text-xl border-2 ring-2 shadow-sm",
      mobileTop:
        "absolute -top-6 left-4 flex items-center justify-center font-serif font-black shadow-lg z-20 rounded-full",
      mobileSize: "w-12 h-12 text-2xl border-2 ring-2",
      mobileColors:
        "from-[#fdba74] via-[#ea580c] to-[#9a3412] text-[#fffbeb] ring-orange-400 border-[#431407]",
    },
  ];

  const style = rankStyles[index];

  if (variant === "mobile") {
    return (
      <div className="relative w-full">
        <div
          className={`${style.mobileTop} ${style.mobileSize} bg-gradient-to-br ${style.mobileColors}`}
        >
          <span>{index + 1}</span>
          {isRank1 && (
            <div className="absolute -top-4 text-[#eab308]">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
              </svg>
            </div>
          )}
        </div>
        <div className="pt-2">
          <StoryListItemTop3 story={story as any} index={index} />
        </div>
      </div>
    );
  }

  // Desktop or Tablet Output
  const isTablet = variant === "tablet";
  const sizeClass = isTablet ? style.tabletSize : style.desktopSize;
  const crownSize = isTablet ? "24" : "32";
  const crownTop = isTablet ? "-top-4" : "-top-5";

  // Các hiệu ứng scale khi hover của Desktop/Tablet
  const rank1ScaleClasses = isTablet
    ? "scale-105 group-hover:scale-105"
    : "scale-105 md:scale-110 group-hover:scale-105";
  const rank2ScaleClasses = "scale-95 group-hover:scale-100";
  const rank3ScaleClasses = "scale-90 group-hover:scale-95";

  const scaleClasses =
    index === 0
      ? rank1ScaleClasses
      : index === 1
        ? rank2ScaleClasses
        : rank3ScaleClasses;

  // Transform base styles cho các cột (đẩy 2 và 3 thấp xuống 1 xíu)
  const transformClasses =
    index === 1
      ? isTablet
        ? "sm:order-1 transform sm:translate-y-4"
        : "md:order-1 transform md:translate-y-6"
      : index === 2
        ? isTablet
          ? "sm:order-3 transform sm:translate-y-8"
          : "md:order-3 transform md:translate-y-10"
        : isTablet
          ? "sm:order-2"
          : "md:order-2";

  return (
    <div className={`${style.wrapper} ${transformClasses}`}>
      <div
        className={`${style.desktopTop} ${sizeClass} bg-gradient-to-br ${style.desktopColors}`}
      >
        <span className="drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]">
          {index + 1}
        </span>
        {isRank1 && (
          <div
            className={`absolute ${crownTop} text-[#eab308] drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={crownSize}
              height={crownSize}
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
            </svg>
          </div>
        )}
      </div>
      <div
        className={`${scaleClasses} transition-transform duration-500 ${isRank1 ? "shadow-2xl shadow-yellow-500/10 rounded-[1.5rem]" : ""}`}
      >
        <StoryListItemTop3 story={story as any} index={index} />
      </div>
    </div>
  );
}
