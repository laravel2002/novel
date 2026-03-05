import { Suspense } from "react";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt Lại Mật Khẩu | Novel",
  description: "Trang nhập mật khẩu mới để khôi phục tài khoản của bạn.",
};

export default function ResetPasswordPage() {
  return (
    <div className="container mx-auto flex h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md p-8 bg-card rounded-xl shadow-lg border">
        <h1 className="text-2xl font-bold text-center mb-6">
          Đặt Lại Mật Khẩu
        </h1>
        <Suspense
          fallback={
            <div className="text-center text-muted-foreground">
              Đang tải biểu mẫu...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
