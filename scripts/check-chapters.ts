import { prisma } from "../src/lib/prisma";

async function checkChapterCount() {
  console.log("Checking chapterCount consistency...");

  const stories = await prisma.story.findMany({
    select: {
      id: true,
      title: true,
      chapterCount: true,
      _count: {
        select: { Chapter: true },
      },
    },
  });

  let inconsistentCount = 0;
  for (const story of stories) {
    if (story.chapterCount !== story._count.Chapter) {
      console.log(`Inconsistent: "${story.title}" (ID: ${story.id})`);
      console.log(`  - chapterCount field: ${story.chapterCount}`);
      console.log(`  - Actual chapters: ${story._count.Chapter}`);
      inconsistentCount++;
    }
  }

  console.log(
    `\nTotal inconsistent stories: ${inconsistentCount}/${stories.length}`,
  );

  if (inconsistentCount > 0) {
    console.log(
      "\nProposing to fix: update chapterCount to match actual chapter count.",
    );
  }
}

checkChapterCount()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
