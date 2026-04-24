import { prisma } from "../src/lib/prisma"; // Đảm bảo đường dẫn này đúng với dự án của bạn

async function resetDetails() {
  console.log("🧹 Bắt đầu dọn dẹp chi tiết truyện...");

  try {
    // Cập nhật toàn bộ truyện trong bảng Story
    const result = await prisma.story.updateMany({
      data: {
        description: null,
        coverUrl: null,
        // Reset luôn lượt xem nếu bạn muốn làm lại từ đầu (bỏ comment dòng dưới)
        // views: 0, 
      },
    });

    console.log(`✅ Đã xóa thành công chi tiết của ${result.count} truyện!`);
    console.log("🚀 Bây giờ bạn có thể chạy lại Phase 2 để cào và upload ảnh lên R2.");
  } catch (error) {
    console.error("❌ Lỗi khi reset:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDetails();