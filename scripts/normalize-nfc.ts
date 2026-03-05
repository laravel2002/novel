import { prisma } from "../lib/prisma";
import * as cheerio from "cheerio";

// ============================================================================
// 🔤 Script làm sạch HTML và chuẩn hoá Unicode NFD → NFC trong DB
// ============================================================================

function nfc(text: string): string {
  if (!text) return "";
  return text.normalize("NFC");
}

function hasHtmlTags(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

function cleanHtmlAndNfc(htmlStr: string): string {
  if (!htmlStr) return "";

  if (!hasHtmlTags(htmlStr)) {
    return nfc(htmlStr);
  }

  const $ = cheerio.load(htmlStr);

  // Xóa các elements không liên quan đến nội dung văn bản thuần
  $("script, style, iframe, ins, noscript, nav, header, footer").remove();

  // Chuyển thẻ <br> thành ký tự xuống dòng
  $("br").replaceWith("\n");

  // Đảm bảo các khối phân đoạn sẽ có dòng trống phía sau để tách đoạn
  $("p, div, h1, h2, h3, h4, h5, h6, li").each((_, el) => {
    $(el).append("\n");
  });

  const rawText = $.text();

  // Loại bỏ khoảng trắng & dòng trống dư thừa
  const cleanedText = rawText
    .replace(/\n\s*\n+/g, "\n\n") // Tối đa 2 dấu xuống dòng liên tiếp
    .replace(/&nbsp;/g, " ")
    .trim();

  return nfc(cleanedText);
}

// Hàm hỗ trợ kiểm tra xem có sự thay đổi sau khi dọn dẹp hoặc chuẩn hóa hay không
function isDirty(original: string, cleaned: string): boolean {
  return original !== cleaned;
}

async function normalizeStories() {
  const stories = await prisma.story.findMany({
    select: { id: true, title: true, author: true, description: true },
  });

  let count = 0;
  for (const story of stories) {
    const updates: Record<string, string> = {};

    if (story.title) {
      const cTitle = nfc(story.title);
      if (isDirty(story.title, cTitle)) updates.title = cTitle;
    }

    if (story.author) {
      const cAuthor = nfc(story.author);
      if (isDirty(story.author, cAuthor)) updates.author = cAuthor;
    }

    if (story.description) {
      const cDesc = cleanHtmlAndNfc(story.description);
      if (isDirty(story.description, cDesc)) updates.description = cDesc;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.story.update({ where: { id: story.id }, data: updates });
      count++;
    }
  }

  console.log(
    `✅ Đã làm sạch & chuẩn hoá NFC cho ${count}/${stories.length} truyện.`,
  );
}

async function normalizeCategories() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, description: true },
  });

  let count = 0;
  for (const cat of categories) {
    const updates: Record<string, string> = {};

    if (cat.name) {
      const cName = nfc(cat.name);
      if (isDirty(cat.name, cName)) updates.name = cName;
    }

    if (cat.description) {
      const cDesc = cleanHtmlAndNfc(cat.description);
      if (isDirty(cat.description, cDesc)) updates.description = cDesc;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.category.update({ where: { id: cat.id }, data: updates });
      count++;
    }
  }

  console.log(
    `✅ Đã làm sạch & chuẩn hoá NFC cho ${count}/${categories.length} thể loại.`,
  );
}

async function normalizeChapters() {
  const BATCH_SIZE = 500;
  let skip = 0;
  let totalUpdated = 0;
  let totalProcessed = 0;

  const totalChapters = await prisma.chapter.count();
  console.log(`📄 Tổng ${totalChapters} chương cần kiểm tra...`);

  while (true) {
    const chapters = await prisma.chapter.findMany({
      select: { id: true, title: true, content: true },
      skip,
      take: BATCH_SIZE,
      orderBy: { id: "asc" },
    });

    if (chapters.length === 0) break;

    for (const chap of chapters) {
      const updates: Record<string, string> = {};

      if (chap.title) {
        const cTitle = nfc(chap.title);
        // Chapter title đôi khi có rác HTML
        const cTitleHtmlCleaned = cleanHtmlAndNfc(chap.title);
        if (isDirty(chap.title, cTitleHtmlCleaned)) {
          updates.title = cTitleHtmlCleaned;
        } else if (isDirty(chap.title, cTitle)) {
          updates.title = cTitle;
        }
      }

      if (chap.content) {
        const cContent = cleanHtmlAndNfc(chap.content);
        if (isDirty(chap.content, cContent)) updates.content = cContent;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.chapter.update({ where: { id: chap.id }, data: updates });
        totalUpdated++;
      }
    }

    totalProcessed += chapters.length;
    skip += BATCH_SIZE;

    // Log tiến trình (overwrite cùng 1 dòng)
    const percent = Math.round((totalProcessed / totalChapters) * 100);
    process.stdout.write(
      `\r  ⏳ ${totalProcessed}/${totalChapters} (${percent}%) — đã sửa ${totalUpdated} chương`,
    );
  }

  console.log(
    `\n✅ Đã làm sạch HTML & chuẩn hoá NFC cho ${totalUpdated}/${totalChapters} chương.`,
  );
}

async function normalizeComments() {
  const comments = await prisma.comment.findMany({
    select: { id: true, content: true },
  });

  let count = 0;
  for (const c of comments) {
    if (c.content) {
      const cContent = cleanHtmlAndNfc(c.content);
      if (isDirty(c.content, cContent)) {
        await prisma.comment.update({
          where: { id: c.id },
          data: { content: cContent },
        });
        count++;
      }
    }
  }

  console.log(
    `✅ Đã làm sạch & chuẩn hoá NFC cho ${count}/${comments.length} bình luận.`,
  );
}

async function main() {
  console.log("🔤🛠️ Bắt đầu quét dọn HTML rác và chuẩn hoá Unicode NFC...\n");

  await normalizeCategories();
  await normalizeStories();
  await normalizeChapters();
  await normalizeComments();

  console.log("\n🎉 Đoạn cuối... Đóng kết nối DB.");
  await prisma.$disconnect();
  console.log(
    "✅ Hoàn tất! Toàn bộ Database đã gọn gàng, sạch sẽ HTML và ở dạng NFC chuẩn tiếng Việt.",
  );
}

main().catch((e) => {
  console.error("💀 Lỗi nghiêm trọng trong quá trình sửa dọn DB:", e);
  process.exit(1);
});
