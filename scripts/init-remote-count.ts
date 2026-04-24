import { prisma } from "../src/lib/prisma";

async function initializeRemoteChapterCount() {
  console.log("🚀 Initializing remoteChapterCount...");

  // Đối với các truyện đã có, tạm thời đặt remoteChapterCount bằng chapterCount (số chương hiện có)
  // Người dùng có thể chạy crawler Phase 1/2 để cập nhật lại số lượng chương thực tế từ nguồn.
  const result =
    await prisma.$executeRaw`UPDATE "Story" SET "remoteChapterCount" = "chapterCount" WHERE "remoteChapterCount" = 0`;

  console.log(`✅ Updated ${result} stories.`);
}

initializeRemoteChapterCount()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
