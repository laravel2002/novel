import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ProfileLayout } from "@/features/profile/components/ProfileLayout";

export const metadata: Metadata = {
  title: "Hồ sơ cá nhân | AntiGravity",
  description: "Trang thông tin và cài đặt cá nhân của bạn",
};

export default async function ProfilePage() {
  const session = await auth();

  // Yêu cầu đăng nhập để vào Cá Nhân
  if (!session || !session.user) {
    redirect("/dang-nhap?callbackUrl=/ca-nhan");
  }

  const user = {
    id: session.user.id || "",
    name: session.user.name || null,
    email: session.user.email || null,
    image: session.user.image || null,
    role: session.user.role || "USER",
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="relative py-12 md:py-16 overflow-hidden mb-8 border-b border-primary/10 bg-[#141413]">
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
          }}
        />
        <div className="container relative z-10 mx-auto px-4 max-w-7xl">
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-3xl md:text-5xl font-serif text-[#faf9f5] font-bold tracking-tight">
              Hồ sơ cá nhân
            </h1>
            <p className="text-[#b0aea5] max-w-xl mx-auto text-sm md:text-base">
              Quản lý thông tin tài khoản và cập nhật bảo mật cá nhân
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        <ProfileLayout user={user} />
      </div>
    </div>
  );
}
