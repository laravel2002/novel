"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { updatePassword } from "../services/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const securitySchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type SecurityFormValues = z.infer<typeof securitySchema>;

export function SecuritySettings() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SecurityFormValues) => {
    setIsLoading(true);
    const result = await updatePassword(data.currentPassword, data.newPassword);

    if (result.success) {
      toast.success(result.message);
      form.reset();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-semibold mb-6">Bảo mật tài khoản</h2>

      <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/20 mb-8">
        <p className="text-sm text-muted-foreground">
          Vì lý do bảo mật, bạn cần nhập mật khẩu hiện tại để có thể đặt mật
          khẩu mới. Nếu bạn đăng nhập bằng Google hoặc Facebook và chưa từng
          thiết lập mật khẩu, bạn sẽ không thể sử dụng chức năng này.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Mật khẩu hiện tại
          </label>
          <Input
            type="password"
            placeholder="Nhập mật khẩu hiện tại"
            {...form.register("currentPassword")}
            className={
              form.formState.errors.currentPassword ? "border-destructive" : ""
            }
          />
          {form.formState.errors.currentPassword && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Mật khẩu mới
          </label>
          <Input
            type="password"
            placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
            {...form.register("newPassword")}
            className={
              form.formState.errors.newPassword ? "border-destructive" : ""
            }
          />
          {form.formState.errors.newPassword && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Xác nhận mật khẩu mới
          </label>
          <Input
            type="password"
            placeholder="Nhập lại mật khẩu mới"
            {...form.register("confirmPassword")}
            className={
              form.formState.errors.confirmPassword ? "border-destructive" : ""
            }
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="destructive"
          disabled={isLoading}
          className="mt-4 rounded-full px-8 bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/80 dark:text-black"
        >
          {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </Button>
      </form>
    </div>
  );
}
