"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconBrandGoogle,
  IconLoader2,
  IconArrowLeft,
} from "@tabler/icons-react";
import { registerUser, forgotPassword } from "@/app/actions/auth";

export function LoginModal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim().toLowerCase();
    const password = formData.get("password") as string;

    if (isForgotPasswordView) {
      const res = await forgotPassword(email);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(res.message || "Vui lòng kiểm tra email của bạn.");
      }
      setIsLoading(false);
      return;
    }

    if (isLoginView) {
      // Logic Đăng Nhập
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setErrorMsg("Email hoặc mật khẩu không chính xác.");
        setIsLoading(false);
      } else {
        setIsOpen(false);
        setIsLoading(false);
      }
    } else {
      // Logic Đăng Ký
      const registerRes = await registerUser(formData);
      if (registerRes.error) {
        setErrorMsg(registerRes.error);
        setIsLoading(false);
      } else {
        setSuccessMsg("Đăng ký thành công! Đang tự động đăng nhập...");
        // Sau khi đăng ký thành công, tự động đăng nhập luôn
        const loginRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        if (!loginRes?.error) {
          setTimeout(() => {
            setIsOpen(false);
            setIsLoading(false);
            setIsLoginView(true); // Reset state cho lần mở sau
            clearMessages();
          }, 1000);
        } else {
          setErrorMsg(
            "Không thể tự đăng nhập sau khi đăng ký, vui lòng thử lại.",
          );
          setIsLoading(false);
        }
      }
    }
  };

  const loginWithProvider = async (provider: "google") => {
    if (provider === "google") setIsGoogleLoading(true);

    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          // Reset về form đăng nhập khi đóng modal
          setTimeout(() => {
            setIsLoginView(true);
            setIsForgotPasswordView(false);
          }, 300);
          clearMessages();
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-center sm:text-center pt-4 pb-2">
          {isForgotPasswordView && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 h-8 w-8 rounded-full"
              onClick={() => {
                setIsForgotPasswordView(false);
                clearMessages();
              }}
            >
              <IconArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <DialogTitle className="text-2xl font-bold">
            {isForgotPasswordView
              ? "Khôi phục mật khẩu"
              : isLoginView
                ? "Chào mừng trở lại"
                : "Tạo tài khoản mới"}
          </DialogTitle>
          <DialogDescription>
            {isForgotPasswordView
              ? "Nhập email của bạn để nhận liên kết khôi phục mật khẩu."
              : isLoginView
                ? "Đăng nhập để lưu lịch sử đọc, đánh dấu truyện yêu thích và tham gia bình luận."
                : "Tham gia cùng cộng đồng để không bỏ lỡ những bộ truyện tuyệt vời nhất."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {!isForgotPasswordView && (
            <>
              <Button
                variant="outline"
                className="w-full h-11 relative"
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

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Hoặc sử dụng Email
                  </span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-md border border-red-200 dark:border-red-900/50">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm rounded-md border border-green-200 dark:border-green-900/50">
                {successMsg}
              </div>
            )}

            {!isLoginView && !isForgotPasswordView && (
              <div className="space-y-2">
                <Label htmlFor="name">Tên hiển thị</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Vương Lâm"
                  required={!isLoginView && !isForgotPasswordView}
                  disabled={isLoading}
                />
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
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
              />
            </div>
            {!isForgotPasswordView && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Mật khẩu</Label>
                  {isLoginView && (
                    <a
                      href="#"
                      className="text-xs text-primary hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsForgotPasswordView(true);
                        clearMessages();
                      }}
                    >
                      Quên mật khẩu?
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required={!isForgotPasswordView}
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-bold"
              disabled={isLoading}
            >
              {isLoading && (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isForgotPasswordView
                ? "Gửi link khôi phục"
                : isLoginView
                  ? "Đăng nhập"
                  : "Tạo tài khoản"}
            </Button>
          </form>

          {!isForgotPasswordView && (
            <div className="text-center text-sm text-muted-foreground mt-2">
              {isLoginView ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              <button
                type="button"
                className="text-primary font-semibold hover:underline"
                onClick={() => {
                  setIsLoginView(!isLoginView);
                  clearMessages();
                }}
                disabled={isLoading}
              >
                {isLoginView ? "Đăng ký ngay" : "Đăng nhập"}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
