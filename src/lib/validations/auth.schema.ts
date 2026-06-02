import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Tên hiển thị phải có ít nhất 2 ký tự" }).max(50, { message: "Tên không được quá 50 ký tự" }),
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
