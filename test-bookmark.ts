import { toggleBookmark } from "./src/features/library/services/library";
import { prisma } from "./src/lib/prisma";

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found");
    return;
  }
  
  const story = await prisma.story.findFirst();
  if (!story) {
    console.log("No story found");
    return;
  }

  console.log(`Testing with User: ${user.id}, Story: ${story.id}`);
  
  try {
    const result = await toggleBookmark(user.id, story.id);
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

main().finally(() => prisma.$disconnect());
