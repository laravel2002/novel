"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { updateGeneralProfile } from "../services/profile";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(50, "Tên không quá 50 ký tự"),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function GeneralSettings({
  user,
}: {
  user: { name: string | null; email: string | null; image: string | null };
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { update } = useSession();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      image: user.image || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    const result = await updateGeneralProfile({
      name: data.name,
      image: data.image === "" ? undefined : data.image,
    });

    if (result.success) {
      toast.success(result.message);
      await update({
        name: data.name,
        image: data.image,
      });
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-semibold mb-6">Thông tin chung</h2>

      <div className="flex items-center gap-6 mb-8 p-4 bg-secondary/10 rounded-xl border border-secondary/20">
        <Avatar className="w-20 h-20 border-2 border-primary/20 bg-background">
          <AvatarImage src={form.watch("image") || user.image || ""} />
          <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
            {form.watch("name")?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-lg">
            {form.watch("name") || "Chưa đặt tên"}
          </h3>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Tên hiển thị
          </label>
          <Input
            placeholder="Nhập tên hiển thị của bạn"
            {...form.register("name")}
            className={form.formState.errors.name ? "border-destructive" : ""}
          />
          {form.formState.errors.name && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Avatar URL (Tùy chọn)
          </label>
          <Input
            placeholder="https://example.com/avatar.jpg"
            {...form.register("image")}
            className={form.formState.errors.image ? "border-destructive" : ""}
          />
          {form.formState.errors.image && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.image.message}
            </p>
          )}
          <p className="text-[13px] text-muted-foreground mt-2">
            (Tạm thời nhập Link ảnh. Chức năng Upload qua AWS S3/Cloudinary sẽ
            cung cấp sau).
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="mt-4 rounded-full px-8"
        >
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </form>
    </div>
  );
}
