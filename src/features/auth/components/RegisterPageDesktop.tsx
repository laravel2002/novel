"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconBrandGoogle, IconLoader2 } from "@tabler/icons-react";
import { registerUser } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const FormMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return <p className="text-[13px] font-medium text-destructive mt-1">{message}</p>;
};

export function RegisterPageDesktop() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

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
          router.push("/");
        }, 1000);
      } else {
        setErrorMsg(
          "Không thể tự đăng nhập sau khi đăng ký, vui lòng đăng nhập tay.",
        );
        setIsLoading(false);
      }
    }
  };

  const loginWithProvider = async (provider: "google") => {
    if (provider === "google") setIsGoogleLoading(true);
    await signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="container max-w-md mx-auto py-20 px-4">
      <div className="glass-panel p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold font-heading text-center mb-2">
          Tạo tài khoản mới
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-6">
          Tham gia cùng cộng đồng để không bỏ lỡ những bộ truyện tuyệt vời nhất.
        </p>

        <Button
          variant="outline"
          className="w-full h-11 relative mb-4"
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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Hoặc sử dụng Email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-md border border-red-200">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm rounded-md border border-green-200">
              {successMsg}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Tên hiển thị</Label>
            <Input
              id="name"
              type="text"
              placeholder="Vương Lâm"
              disabled={isLoading}
              {...register("name")}
            />
            <FormMessage message={errors.name?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="laptrinhvien@example.com"
              disabled={isLoading}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              {...register("email")}
            />
            <FormMessage message={errors.email?.message} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register("password")}
            />
            <FormMessage message={errors.password?.message} />
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-bold mt-2"
            disabled={isLoading}
          >
            {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tạo tài khoản
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-6">
          Đã có tài khoản?{" "}
          <Link
            href="/dang-nhap"
            className="text-primary font-semibold hover:underline"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
