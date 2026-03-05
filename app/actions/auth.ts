"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    return { error: "Vui lòng nhập đầy đủ thông tin" };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Email này đã được sử dụng" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return { success: true, user: { id: newUser.id, email: newUser.email } };
  } catch (error) {
    console.error("[Auth] Lỗi tạo tài khoản", error);
    return { error: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau" };
  }
}

export async function forgotPassword(email: string) {
  if (!email) {
    return { error: "Vui lòng cung cấp email." };
  }

  // 1. Kiểm tra User tồn tại không
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    // Để bảo mật, không thông báo user có tồn tại hay không, chỉ phản hồi chung
    return {
      success: true,
      message: "Email đặt lại mật khẩu đã được gửi nếu tài khoản tồn tại.",
    };
  }

  // 2. Tạo Token và gửi Mock Email
  try {
    const { generatePasswordResetToken } = await import("@/lib/tokens");
    const { sendPasswordResetEmail } = await import("@/lib/mail");

    const passwordResetToken = await generatePasswordResetToken(email);

    // Gửi email Console Simulator
    await sendPasswordResetEmail(
      passwordResetToken.email,
      passwordResetToken.token,
    );

    return {
      success: true,
      message: "Email đặt lại mật khẩu đã được gửi nếu tài khoản tồn tại.",
    };
  } catch (error) {
    console.error("[Auth] Lỗi khởi tạo token reset", error);
    return { error: "Đã có lỗi hệ thống, không thể đặt lại ngay lúc này." };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  if (!token || !newPassword) {
    return { error: "Thiếu dữ liệu" };
  }

  try {
    const existingToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!existingToken) {
      return { error: "Mã khôi phục không hợp lệ hoặc đã hết hạn." };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
      return { error: "Mã khôi phục đã hết hạn." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: existingToken.email },
    });

    if (!existingUser) {
      return { error: "Tài khoản không tồn tại." };
    }

    // Mã hoá mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật Database
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    });

    // Dọn dẹp Token reset
    await prisma.passwordResetToken.delete({
      where: { id: existingToken.id },
    });

    return { success: "Mật khẩu của bạn đã được cập nhật thành công!" };
  } catch (error) {
    console.error("[Auth] Error updating password", error);
    return { error: "Lỗi cập nhật mật khẩu, vui lòng thử lại." };
  }
}
