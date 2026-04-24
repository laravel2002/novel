import { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { RegisterPageUI } from "@/features/auth/components/RegisterPageUI";

export const metadata: Metadata = {
  title: "Đăng ký | Novel",
  description: "Tạo tài khoản để tham gia cộng đồng",
};

export default async function RegisterPage() {
  const session = await auth();

  // Đã đăng nhập thì chuyển về trang chủ
  if (session?.user) {
    redirect("/");
  }

  return <RegisterPageUI />;
}
