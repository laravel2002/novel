import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const generatePasswordResetToken = async (email: string) => {
  // Tạo token ngẫu nhiên
  const token = crypto.randomBytes(32).toString("hex");
  // Hết hạn sau 1 giờ
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  // Kiểm tra nếu người dùng đã có token cũ chưa hết hạn
  const existingToken = await prisma.passwordResetToken.findFirst({
    where: { email },
  });

  if (existingToken) {
    await prisma.passwordResetToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  // Lưu token mới
  const passwordResetToken = await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};
