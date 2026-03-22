import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import {
  IconBrandFacebook,
  IconBrandDiscord,
  IconBrandGithub,
  IconArrowRight,
} from "@tabler/icons-react";

export function Footer() {
  return (
    <footer className="hidden md:block w-full relative bg-[#0a0f12] text-white pt-20 pb-10 mt-auto overflow-hidden border-t-4 border-green-600">
      {/* 
        ====================================================
        1. BACKGROUND EFFECTS: Deep, Luxurious Atmosphere
        ====================================================
      */}
      {/* Texture overlay for luxury magazine feel */}
      <div
        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-green-500/10 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2" />

      <div className="container max-w-7xl mx-auto px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 mb-20">
          {/* Brand Column (Span 5) */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group text-white"
            >
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                N
              </span>
              <span className="font-heading font-black text-3xl tracking-tighter">
                Novel
              </span>
            </Link>

            <p className="mt-8 text-white/50 text-base leading-relaxed max-w-sm font-serif italic border-l-2 border-white/10 pl-4">
              &quot;Khám phá hàng ngàn câu chuyện tĩnh lặng nhưng đong đầy thế
              giới quan vĩ đại. Đọc, thả hồn và chìm đắm.&quot;
            </p>

            {/* Newsletter Input */}
            <div className="mt-8 w-full max-w-sm relative group">
              <input
                type="email"
                placeholder="Tham gia bản tin..."
                className="w-full bg-white/5 border border-white/10 rounded-full h-12 px-5 text-sm font-medium text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              />
              <button className="absolute right-1 top-1 bottom-1 w-10 bg-green-500 hover:bg-green-400 text-white rounded-full flex items-center justify-center transition-colors shadow-md">
                <IconArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Links Column */}
          <div className="md:col-span-3 md:col-start-7 lg:col-start-8">
            <h3 className="font-heading font-black text-lg text-white mb-6 uppercase tracking-widest flex items-center gap-3 opacity-90">
              Khám Phá
            </h3>
            <nav className="flex flex-col gap-4">
              {["Trang Chủ", "Bảng Xếp Hạng", "Thể Loại", "Tủ Truyện"].map(
                (item, i) => (
                  <Link
                    key={item}
                    href="#"
                    className="text-white/60 hover:text-green-400 transition-colors text-sm font-bold flex items-center gap-3 group"
                  >
                    <span className="w-0 h-0.5 bg-green-500 group-hover:w-4 transition-all duration-300" />
                    {item}
                  </Link>
                ),
              )}
            </nav>
          </div>

          {/* Connect Column */}
          <div className="md:col-span-3 lg:col-span-2">
            <h3 className="font-heading font-black text-lg text-white mb-6 uppercase tracking-widest opacity-90">
              Kết Nối
            </h3>
            <div className="flex flex-col gap-4">
              <Link
                href="#"
                className="group flex items-center gap-3 text-white/60 hover:text-white transition-colors"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-[#1877F2] group-hover:scale-110 transition-all duration-300 border border-white/10 group-hover:border-transparent">
                  <IconBrandFacebook className="h-5 w-5" />
                </div>
                <span className="font-bold text-sm">Facebook</span>
              </Link>
              <Link
                href="#"
                className="group flex items-center gap-3 text-white/60 hover:text-white transition-colors"
              >
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-[#5865F2] group-hover:scale-110 transition-all duration-300 border border-white/10 group-hover:border-transparent">
                  <IconBrandDiscord className="h-5 w-5" />
                </div>
                <span className="font-bold text-sm">Discord</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar Content */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-white/40 tracking-wider text-center md:text-left uppercase">
            &copy; {new Date().getFullYear()} NOVEL MAG. MÃ NGUỒN MỞ.
          </p>
          <div className="flex items-center gap-8 text-sm font-bold text-white/40 uppercase tracking-widest">
            <Link href="#" className="hover:text-white transition-colors">
              Điều khoản
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Bảo mật
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Liên hệ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
