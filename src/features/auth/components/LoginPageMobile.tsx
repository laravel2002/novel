"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconBrandGoogle,
  IconLoader2,
  IconChevronLeft,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LoginPageMobile() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim().toLowerCase();
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      redirect: false, // Ngăn chặn tự động reload form trên mobile để xử lý mượt
      email,
      password,
    });

    if (res?.error) {
      if (res.error === "CredentialsSignin") {
        setErrorMsg("Email hoặc mật khẩu không chính xác.");
      } else {
        setErrorMsg(`Lỗi hệ thống: ${res.error}. Vui lòng kiểm tra kết nối.`);
      }
      setIsLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  const loginWithProvider = async (provider: "google") => {
    if (provider === "google") setIsGoogleLoading(true);
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col md:hidden overflow-y-auto pb-safe animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center justify-between p-4 border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-md z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.history.back()}
          className="rounded-full"
        >
          <IconChevronLeft className="w-6 h-6" />
        </Button>
        <span className="font-heading font-bold mr-10">Đăng Nhập</span>
      </div>

      <div className="flex-1 px-5 pt-10 pb-6">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold font-heading mb-2">
            Chào mừng trở lại
          </h1>
          <p className="text-muted-foreground text-sm px-4">
            Đăng nhập để lưu lịch sử đọc và đánh dấu truyện.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-md border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="laptrinhvien@example.com"
              required
              disabled={isLoading}
              className="h-12 bg-muted/40 rounded-xl"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Mật khẩu</Label>
              <Link
                href="/dat-lai-mat-khau"
                className="text-xs text-primary font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              minLength={6}
              className="h-12 bg-muted/40 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 font-bold rounded-xl mt-6 shadow-md"
            disabled={isLoading}
          >
            {isLoading && <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />}
            Đăng nhập
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
            <span className="bg-background px-3 text-muted-foreground">
              Hoặc sử dụng
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full h-12 relative rounded-xl font-semibold border-border/60 shadow-sm"
          onClick={() => loginWithProvider("google")}
          disabled={isGoogleLoading || isLoading}
          type="button"
        >
          {isGoogleLoading ? (
            <IconLoader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <IconBrandGoogle className="mr-2 h-5 w-5 text-red-500 absolute left-4" />
          )}
          Tiếp tục với Google
        </Button>

        <div className="text-center text-sm text-foreground mt-8 font-medium">
          Chưa có tài khoản?{" "}
          <Link href="/dang-ky" className="text-primary font-bold">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
