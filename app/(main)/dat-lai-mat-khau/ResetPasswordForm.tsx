"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/app/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IconLoader2 } from "@tabler/icons-react";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!token) {
    return (
      <div className="text-center text-red-500 font-medium bg-red-100 p-4 rounded-md dark:bg-red-900/30 dark:text-red-400">
        Liên kết không hợp lệ hoặc thiếu Token bảo mật. Vui lòng yêu cầu lại
        đường dẫn khôi phục.
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await resetPassword(token, password);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg(res.success || "Đặt lại mật khẩu thành công!");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    }
    setIsLoading(false);
  };

  if (successMsg) {
    return (
      <div className="text-center space-y-4">
        <div className="p-4 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md border border-green-200 font-medium">
          {successMsg}
        </div>
        <p className="text-muted-foreground text-sm animate-pulse">
          Đang tự động chuyển hướng về trang chủ...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-sm rounded-md border border-red-200">
          {errorMsg}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu mới</Label>
        <Input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          placeholder="••••••••"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
        <Input
          id="confirmPassword"
          type="password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
          placeholder="••••••••"
        />
      </div>
      <Button
        type="submit"
        className="w-full h-11 font-bold"
        disabled={isLoading}
      >
        {isLoading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
        Cập nhật mật khẩu ngay
      </Button>
    </form>
  );
}
