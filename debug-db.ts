import { prisma } from "./lib/prisma";

async function checkUserAndHistory() {
  console.log("--- DEBUG DATABASE ---");
  
  // 1. Kiểm tra số lượng user
  const userCount = await prisma.user.count();
  console.log(`Total Users: ${userCount}`);

  // 2. Lấy 1 user bất kỳ để xem định dạng ID
  const sampleUser = await prisma.user.findFirst();
  console.log("Sample User ID:", sampleUser?.id);

  // 3. Kiểm tra các bản ghi ReadingHistory có userId không tồn tại
  const orphanedHistories = await prisma.$queryRaw`
    SELECT "userId" FROM "ReadingHistory" 
    WHERE "userId" NOT IN (SELECT "id" FROM "User")
  `;
  console.log("Orphaned Histories:", orphanedHistories);

  // 4. Kiểm tra các bản ghi ReadingHistory có storyId không tồn tại
  const orphanedStories = await prisma.$queryRaw`
    SELECT "storyId" FROM "ReadingHistory" 
    WHERE "storyId" NOT IN (SELECT "id" FROM "Story")
  `;
  console.log("Orphaned Stories:", orphanedStories);

  process.exit(0);
}

checkUserAndHistory().catch(err => {
  console.error(err);
  process.exit(1);
});
