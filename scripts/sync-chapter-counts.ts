import { prisma } from "../lib/prisma";

async function syncChapterCounts() {
  console.log("🚀 Starting synchronization of chapterCount...");

  const stories = await prisma.story.findMany({
    select: {
      id: true,
      title: true,
      _count: {
        select: { Chapter: true },
      },
    },
  });

  console.log(`📊 Found ${stories.length} stories to process.`);

  let updatedCount = 0;
  for (const story of stories) {
    const actualCount = story._count.Chapter;

    // Chỉ cập nhật nếu giá trị hiện tại khác giá trị thực tế
    // Ở đây mình sẽ thực hiện update hàng loạt để đảm bảo tính chính xác
    await prisma.story.update({
      where: { id: story.id },
      data: { chapterCount: actualCount },
    });

    updatedCount++;
    if (updatedCount % 100 === 0) {
      console.log(`✅ Processed ${updatedCount}/${stories.length} stories...`);
    }
  }

  console.log(
    `\n✨ Synchronization completed! Updated ${updatedCount} stories.`,
  );
}

syncChapterCounts()
  .catch((err) => {
    console.error("💀 Fatal error during synchronization:", err);
  })
  .finally(() => prisma.$disconnect());
