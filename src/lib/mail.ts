export const sendPasswordResetEmail = async (email: string, token: string) => {
  const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetLink = `${domain}/dat-lai-mat-khau?token=${token}`;

  // TRONG THỰC TẾ: Hãy sử dụng Resend, Nodemailer, v.v. để gửi email
  // import { Resend } from "resend";
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({...})

  // Ở môi trường phát triển hiện tại (Demo), chúng ta sẽ giả lập gửi email bằng console.log
  console.log("==========================================");
  console.log(`🚀 [MOCK EMAIL SYSTEM] Gửi tới: ${email}`);
  console.log(`Mã Token Đặt Lại Mật Khẩu đã được tạo!`);
  console.log(`🔗 Vui lòng nhấp vào đây để đổi mật khẩu:`);
  console.log(`   ${resetLink}`);
  console.log("==========================================");
};
