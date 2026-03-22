import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Bat dau backfill chapterCount cho tat ca truyen...");

  // Lay danh sach tat ca cac truyen
  const stories = await prisma.story.findMany({
    select: {
      id: true,
      _count: {
        select: { Chapter: true },
      },
    },
  });

  console.log(`Tim thay ${stories.length} truyen. Dang tien hanh cap nhat...`);

  let updatedCount = 0;
  for (const story of stories) {
    const count = story._count.Chapter;
    await prisma.story.update({
      where: { id: story.id },
      data: { chapterCount: count },
    });
    updatedCount++;
    if (updatedCount % 50 === 0) {
      console.log(`Da cap nhat ${updatedCount} / ${stories.length} truyen...`);
    }
  }

  console.log("Hoan thanh backfill thanh cong!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
