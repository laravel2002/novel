"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type ResetPasswordFormData,
} from "@/lib/validations/auth.schema";

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

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignup,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    reset: resetResetPassword,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    clearMessages();

    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (res?.error) {
      setErrorMsg("Email hoặc mật khẩu không chính xác.");
      setIsLoading(false);
    } else {
      setIsOpen(false);
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    clearMessages();

    // Dùng formData vì server action mong đợi FormData
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);

    const registerRes = await registerUser(formData);
    if (registerRes.error) {
      setErrorMsg(registerRes.error);
      setIsLoading(false);
    } else {
      setSuccessMsg("Đăng ký thành công! Đang tự động đăng nhập...");
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (!loginRes?.error) {
        setTimeout(() => {
          setIsOpen(false);
          setIsLoading(false);
          setIsLoginView(true);
          clearMessages();
        }, 1000);
      } else {
        setErrorMsg("Không thể tự đăng nhập sau khi đăng ký, vui lòng thử lại.");
        setIsLoading(false);
      }
    }
  };

  const onResetSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    clearMessages();

    const res = await forgotPassword(data.email);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg(res.message || "Vui lòng kiểm tra email của bạn.");
    }
    setIsLoading(false);
  };

  const loginWithProvider = async (provider: "google") => {
    if (provider === "google") setIsGoogleLoading(true);
    await signIn(provider, { callbackUrl: "/" });
  };

  const resetAllForms = () => {
    resetLogin();
    resetSignup();
    resetResetPassword();
    clearMessages();
  };

  const FormMessage = ({ message }: { message?: string }) => {
    if (!message) return null;
    return <p className="text-[13px] font-medium text-destructive mt-1">{message}</p>;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setTimeout(() => {
            setIsLoginView(true);
            setIsForgotPasswordView(false);
          }, 300);
          resetAllForms();
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

          {/* Form Khôi phục mật khẩu */}
          {isForgotPasswordView && (
            <form onSubmit={handleResetSubmit(onResetSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="laptrinhvien@example.com"
                  disabled={isLoading}
                  {...registerReset("email")}
                />
                <FormMessage message={resetErrors.email?.message} />
              </div>
              <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
                {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gửi link khôi phục
              </Button>
            </form>
          )}

          {/* Form Đăng nhập */}
          {!isForgotPasswordView && isLoginView && (
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="laptrinhvien@example.com"
                  disabled={isLoading}
                  {...registerLogin("email")}
                />
                <FormMessage message={loginErrors.email?.message} />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="login-password">Mật khẩu</Label>
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
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...registerLogin("password")}
                />
                <FormMessage message={loginErrors.password?.message} />
              </div>
              <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
                {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                Đăng nhập
              </Button>
            </form>
          )}

          {/* Form Đăng ký */}
          {!isForgotPasswordView && !isLoginView && (
            <form onSubmit={handleSignupSubmit(onSignupSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Tên hiển thị</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Vương Lâm"
                  disabled={isLoading}
                  {...registerSignup("name")}
                />
                <FormMessage message={signupErrors.name?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="laptrinhvien@example.com"
                  disabled={isLoading}
                  {...registerSignup("email")}
                />
                <FormMessage message={signupErrors.email?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Mật khẩu</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  {...registerSignup("password")}
                />
                <FormMessage message={signupErrors.password?.message} />
              </div>
              <Button type="submit" className="w-full h-11 font-bold" disabled={isLoading}>
                {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo tài khoản
              </Button>
            </form>
          )}

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
