"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateGeneralProfile(data: {
  name?: string;
  image?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn phải đăng nhập để thực hiện chức năng này.",
      };
    }

    if (!data.name && !data.image) {
      return { success: false, error: "Không có thông tin nào để cập nhật." };
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.image) updateData.image = data.image;

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    revalidatePath("/ca-nhan");
    return { success: true, message: "Cập nhật hồ sơ thành công!" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Đã có lỗi xảy ra khi cập nhật hồ sơ." };
  }
}

export async function updatePassword(
  currentPassword?: string,
  newPassword?: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn phải đăng nhập để thực hiện chức năng này.",
      };
    }

    if (!currentPassword || !newPassword) {
      return {
        success: false,
        error: "Vui lòng nhập đầy đủ mật khẩu cũ và mới.",
      };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Mật khẩu mới phải có ít nhất 6 ký tự." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return { success: false, error: "Không tìm thấy người dùng." };
    }

    // Nếu user đăng nhập bằng Google/Facebook mà chưa từng tạo password
    if (!user.password) {
      return {
        success: false,
        error:
          "Tài khoản của bạn được liên kết qua mạng xã hội, chưa thể đổi mật khẩu tại đây.",
      };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return { success: false, error: "Mật khẩu cũ không chính xác." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Đổi mật khẩu thành công!" };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, error: "Đã có lỗi xảy ra khi cập nhật mật khẩu." };
  }
}
