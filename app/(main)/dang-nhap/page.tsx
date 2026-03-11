import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LoginPageUI } from "@/features/auth/components/LoginPageUI";

export const metadata: Metadata = {
  title: "Đăng nhập | Novel",
  description: "Đăng nhập để trải nghiệm đọc truyện tốt hơn",
};

export default async function LoginPage() {
  const session = await auth();

  // Đã đăng nhập thì chuyển về trang chủ hoặc trang cá nhân
  if (session?.user) {
    redirect("/");
  }

  return <LoginPageUI />;
}
