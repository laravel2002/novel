import "dotenv/config";
import * as cheerio from "cheerio";
import { prisma } from "../src/lib/prisma"; // HTTP adapter
import {
  uploadChapterContent,
  uploadCoverImage,
} from "../src/features/chapter/services/storage";

// --- IMPORT BỘ VŨ KHÍ PUPPETEER ---
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page } from "puppeteer";

// Kích hoạt chế độ tàng hình chống Cloudflare
puppeteer.use(StealthPlugin());

// ============================================================================
// 🔧 CẤU HÌNH & KIỂU DỮ LIỆU
// ============================================================================
const BASE_URL = "https://tiemtruyenchu.com"; // Đã bỏ www để chuẩn URL gốc
const DEFAULT_CONCURRENCY = 5; // PUPPETEER TỐN RAM, CHỈ NÊN CHẠY 3-5 TAB SONG SONG

let globalBrowser: Browser | null = null;
let isAuthenticated = false;
let requestCount = 0;

interface ScrapedStory {
  id: string | number;
  title: string;
  author: string;
  category?: string;
  total_chapters: string | number;
  status: string;
  coverUrl?: string;
}

interface StoryDetail {
  coverUrl: string | null;
  description: string | null;
  categories: string[];
  views: number;
  chapterCount: number;
}

interface ChapterData {
  chapterNum: number;
  title: string;
  content: string;
}

// ============================================================================
// 🛠️ HÀM TIỆN ÍCH & TRÌNH DUYỆT
// ============================================================================

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function nfc(text: string): string {
  return text.normalize("NFC");
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Khởi động Trình duyệt Ảo
async function initBrowser() {
  if (!globalBrowser) {
    console.log("⚙️  Khởi động Trình duyệt ảo (Puppeteer Stealth)...");
    globalBrowser = await puppeteer.launch({
      headless: true, // Đổi thành false nếu bạn muốn xem nó tự động click Cloudflare
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }
  return globalBrowser;
}

// Hàm đăng nhập
async function loginTiemTruyenChu() {
  if (isAuthenticated) return;

  const browser = await initBrowser();

  // ƯU TIÊN 1: Đăng nhập bằng COOKIE (Dành cho tài khoản Google hoặc khi Form thất bại)
  const cookiesJson = process.env.TTC_COOKIES_JSON;
  if (cookiesJson && cookiesJson !== "your_cookies_json_here") {
    try {
      console.log("🍪 Đang nạp Session từ Cookies...");
      const cookies = JSON.parse(cookiesJson);
      const page = await browser.newPage();
      
      // Puppeteer yêu cầu cookies phải có domain đúng
      await page.setCookie(...cookies);
      
      // Kiểm tra xem cookie có hoạt động không bằng cách vào trang chủ
      await page.goto(BASE_URL, { waitUntil: "networkidle2" });
      const html = await page.content();
      
      // Kiểm tra sự tồn tại của link Logout (chỉ có khi đã đăng nhập)
      if (html.includes('href="/logout"') || html.includes("ĐĂNG XUẤT")) {
        console.log("✅ Nạp Cookie thành công! Đã nhận session.");
        isAuthenticated = true;
        await page.close();
        return;
      } else {
        console.log("⚠️  Cookie hết hạn hoặc không hợp lệ. Thử đăng nhập bằng Form...");
      }
      await page.close();
    } catch (err) {
      console.error("❌ Lỗi khi nạp Cookie:", (err as Error).message);
    }
  }

  // ƯU TIÊN 2: Đăng nhập bằng FORM (Username/Password)
  const username = process.env.TTC_USERNAME;
  const password = process.env.TTC_PASSWORD;

  if (!username || !password || username === "your_username_here") {
    console.log("⚠️  Không có Cookie và cũng không có thông tin Login Form. Chạy ở chế độ Guest.");
    return;
  }

  const page = await browser.newPage();
  try {
    console.log(`🔐 Đang đăng nhập vào Tiệm Truyện Chữ via Form: ${username}...`);
    await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });

    // Đợi input xuất hiện để tránh lỗi "not clickable"
    await page.waitForSelector("input[name='username']", { timeout: 10000 });

    // Điền form
    await page.type("input[name='username']", username);
    await page.type("input[name='password']", password);

    // Click login
    await Promise.all([
      page.click("button[type='submit']"),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    const html = await page.content();
    if (html.includes('href="/logout"') || html.includes("ĐĂNG XUẤT")) {
      console.log("✅ Đăng nhập Form thành công!");
      isAuthenticated = true;
    } else {
      console.log("❌ Đăng nhập Form thất bại. Có thể tài khoản của bạn là tài khoản Google?");
    }
  } catch (error) {
    console.error("❌ Lỗi khi đăng nhập Form:", (error as Error).message);
  } finally {
    await page.close();
  }
}

// Đóng Trình duyệt
async function closeBrowser() {
  if (globalBrowser) {
    console.log("⚙️  Đang đóng Trình duyệt ảo...");
    await globalBrowser.close();
    globalBrowser = null;
  }
}

// Hàm lấy HTML vượt rào Cloudflare bằng Puppeteer
async function fetchHtmlWithPuppeteer(
  url: string,
  retries = 3,
  waitForSelector?: string,
): Promise<string> {
  const browser = await initBrowser();

  for (let i = 0; i < retries; i++) {
    let page: Page | null = null;
    try {
      requestCount++;
      page = await browser.newPage();

      // Tối ưu hóa: Chặn load ảnh/css/fonts thừa thãi để cào lẹ hơn (Tùy chọn)
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        if (["image", "stylesheet", "font"].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Điều hướng đến trang web
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });

      // Đợi element cụ thể thay vì delay cứng 2s
      if (waitForSelector) {
        try {
          await page.waitForSelector(waitForSelector, { timeout: 10000 });
        } catch (e) {
          console.log(`⚠️  Timeout khi chờ selector: ${waitForSelector}`);
        }
      } else {
        await delay(500);
      }

      const html = await page.content();

      // Kiểm tra xem có bị kẹt ở trang Cloudflare không
      if (
        html.includes("Just a moment...") ||
        html.includes("cf-browser-verification")
      ) {
        throw new Error("Vẫn bị kẹt ở Cloudflare Challenge.");
      }

      // Kiểm tra xem có bị redirect về trang login không (Logic mới: Dựa trên link /logout)
      if (!html.includes('href="/logout"') && !html.includes("ĐĂNG XUẤT")) {
         if (url.includes("/danh-sach") && !url.includes("/login")) {
            console.log("⚠️  Không tìm thấy session. Đang thử đăng nhập lại...");
            await page.close();
            isAuthenticated = false;
            await loginTiemTruyenChu();
            return fetchHtmlWithPuppeteer(url, retries - 1, waitForSelector);
         }
      }

      await page.close();
      return html;
    } catch (error) {
      if (page) await page.close();
      console.log(
        `  ⟳ [Lỗi Tab] Retry ${i + 1}/${retries} cho ${url}: ${(error as Error).message}`,
      );
      await delay(3000 * (i + 1));
      if (i === retries - 1) throw error;
    }
  }
  return "";
}

// Tải ảnh (Vẫn dùng fetch thường vì file ảnh thường không bị Cloudflare chặn)
async function fetchImageBuffer(
  url: string,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await res.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), contentType };
  } catch (error) {
    console.error(`  ❌ Lỗi tải ảnh bìa (${url}):`, (error as Error).message);
    return null;
  }
}

// Bóc tách truyện
function parseStoriesFromHTML($: cheerio.CheerioAPI): ScrapedStory[] {
  const stories: ScrapedStory[] = [];
  $(".story-item").each((_index, element) => {
    const link = $(element).find("a.story-poster-container").attr("href");
    const cover =
      $(element).find("img.story-poster").attr("src") ||
      $(element).find("img.story-poster").attr("data-src");
    const title =
      $(element).find("img.story-poster").attr("alt") ||
      $(element).find("h3.story-title").text().trim();
    const author = $(element)
      .find(".story-meta i.fa-user-edit")
      .parent()
      .text()
      .trim();
    const chaptersText = $(element)
      .find(".story-meta i.fa-list-ol")
      .parent()
      .text()
      .trim();
    const totalChapters = chaptersText.match(/\d+/)
      ? parseInt(chaptersText.match(/\d+/)![0])
      : 0;

    if (title && link) {
      const matchId = link.match(/\/truyen\/(\d+)/);
      const sourceId = matchId ? matchId[1] : null;

      if (sourceId) {
        stories.push({
          id: sourceId,
          title: title,
          author: author || "Đang cập nhật",
          total_chapters: totalChapters,
          status: "ONGOING",
          coverUrl: cover?.startsWith("http") ? cover : `${BASE_URL}${cover}`,
        });
      }
    }
  });
  return stories;
}

// ============================================================================
// 📋 PHASE 1 & 1.5: CÀO DANH SÁCH TRUYỆN
// ============================================================================
async function phase1_crawlStoryList() {
  console.log(
    "\n" +
      "=".repeat(60) +
      "\n📋 PHASE 1: Cào danh sách truyện\n" +
      "=".repeat(60),
  );
  let currentPage = 1;
  let totalPages = 1;
  let totalStories = 0;

  while (currentPage <= totalPages) {
    try {
      console.log(`\n⏳ Đang cào trang ${currentPage}/${totalPages}...`);
      const url = `${BASE_URL}/danh-sach?page=${currentPage}`;

      const html = await fetchHtmlWithPuppeteer(url, 3, ".story-item");
      const $ = cheerio.load(html);
      const stories = parseStoriesFromHTML($);

      if (currentPage === 1) {
        let maxPage = 1;
        $(".pagination .page-link").each((_, el) => {
          const num = parseInt($(el).text());
          if (!isNaN(num) && num > maxPage) maxPage = num;
        });
        totalPages = maxPage;
        console.log(`🔍 Tìm thấy tổng cộng ${totalPages} trang.`);
      }

      if (stories.length > 0) {
        await saveStoryListToDB(stories);
        totalStories += stories.length;
        console.log(`✅ Trang ${currentPage}: ${stories.length} truyện → DB`);
      } else {
        console.log(
          `⚠️ Không tìm thấy class truyện ở trang ${currentPage}. Dừng.`,
        );
        break;
      }
      currentPage++;
    } catch (error) {
      console.error(`❌ Lỗi ở trang ${currentPage}:`, error);
      break;
    }
  }
  console.log(`\n🎉 Phase 1 hoàn thành: ${totalStories} truyện.`);
}

async function phase1_crawlStoryListByCategory(categorySlug: string) {
  console.log(
    "\n" +
      "=".repeat(60) +
      `\n📋 PHASE 1.5: Cào truyện theo thể loại [${categorySlug}]\n` +
      "=".repeat(60),
  );

  if (categorySlug === "all") {
    const categories = await prisma.category.findMany({
      select: { slug: true, name: true },
    });
    if (categories.length === 0) return console.log("⚠️ DB chưa có thể loại.");
    for (const cat of categories) {
      console.log(`\n⏳ [${cat.name}] Đang lấy 10 truyện mới nhất...`);
      await fetchStoryListForCategory(cat.slug, 10);
    }
  } else {
    await fetchStoryListForCategory(categorySlug, 50);
  }
  console.log(`\n🎉 Phase 1.5 hoàn thành.`);
}

async function fetchStoryListForCategory(
  categorySlug: string,
  targetStories: number,
) {
  let currentPage = 1;
  let totalStories = 0;

  while (totalStories < targetStories) {
    try {
      const url = `${BASE_URL}/danh-sach?cat=${categorySlug}&page=${currentPage}&sort=new_update`;
      const html = await fetchHtmlWithPuppeteer(url, 3, ".story-item");
      const $ = cheerio.load(html);
      const stories = parseStoriesFromHTML($);
      stories.forEach((s) => (s.category = categorySlug));

      if (stories.length > 0) {
        const needed = targetStories - totalStories;
        const storiesToSave = stories.slice(0, needed);
        await saveStoryListToDB(storiesToSave);
        totalStories += storiesToSave.length;
        console.log(
          `  ✅ Trang ${currentPage}: ${storiesToSave.length} truyện → DB (Tổng: ${totalStories}/${targetStories})`,
        );

        const hasNextPage =
          $(".pagination .page-item:last-child").not(".disabled").length > 0;
        if (!hasNextPage || stories.length < 15) break;
      } else {
        break;
      }
      if (totalStories < targetStories) currentPage++;
    } catch (error) {
      console.error(`  ❌ Lỗi ở trang ${currentPage}:`, error);
      break;
    }
  }
}

async function saveStoryListToDB(stories: ScrapedStory[]) {
  for (const story of stories) {
    const title = nfc(story.title);
    const slug = createSlug(title);
    const sourceId = parseInt(story.id.toString());
    const remoteChapterCount = story.total_chapters
      ? parseInt(story.total_chapters.toString())
      : 0;
    const author = nfc(story.author || "Đang cập nhật");
    const status = story.status === "full" ? "COMPLETED" : "ONGOING";
    const coverUrl = story.coverUrl || null;

    let categoryId: number | null = null;
    if (story.category) {
      const catSlug = createSlug(story.category);
      let cat = await prisma.category.findUnique({ where: { slug: catSlug } });
      if (!cat)
        cat = await prisma.category.create({
          data: { name: nfc(story.category), slug: catSlug },
        });
      categoryId = cat.id;
    }

    let dbStory =
      (await prisma.story.findUnique({ where: { sourceId } })) ||
      (await prisma.story.findUnique({ where: { slug } }));
    
    if (dbStory) {
      // User yêu cầu: bỏ qua các truyện đã cào tên (đã tồn tại)
      console.log(`    ⏭️ Bỏ qua truyện đã tồn tại: ${title}`);
      continue;
    } else {
      dbStory = await prisma.story.create({
        data: {
          title,
          slug,
          author,
          status,
          remoteChapterCount,
          sourceId,
          coverUrl,
        },
      });
    }

    if (categoryId) {
      const linking = await prisma.storyCategory.findUnique({
        where: {
          storyId_categoryId: { storyId: dbStory.id, categoryId: categoryId },
        },
      });
      if (!linking)
        await prisma.storyCategory.create({
          data: { storyId: dbStory.id, categoryId: categoryId },
        });
    }
  }
}

// ============================================================================
// 📖 PHASE 2: CÀO CHI TIẾT TRUYỆN
// ============================================================================
async function phase2_crawlStoryDetails(storyId?: number) {
  console.log(
    "\n" +
      "=".repeat(60) +
      "\n📖 PHASE 2: Cào lại chi tiết & Upload R2\n" +
      "=".repeat(60),
  );

  const stories = await prisma.story.findMany({
    where: storyId ? { id: storyId } : {},
    select: {
      id: true,
      sourceId: true,
      title: true,
      slug: true,
      description: true,
      coverUrl: true,
    },
  });

  console.log(`📚 Tìm thấy ${stories.length} truyện. Bắt đầu xử lý...\n`);

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    if (!story.sourceId) continue;

    const isAlreadyOnR2 =
      story.coverUrl && !story.coverUrl.includes("tiemtruyenchu");
    if (story.description && isAlreadyOnR2) continue;

    try {
      console.log(
        `📖 [${i + 1}/${stories.length}] Đang lấy dữ liệu mới: "${story.title}"...`,
      );

      const url = `${BASE_URL}/truyen/${story.sourceId}`;
      const html = await fetchHtmlWithPuppeteer(url, 3, ".content-text");
      const $ = cheerio.load(html);

      const coverUrlRaw =
        $("img.story-poster").attr("data-src") ||
        $("img.story-poster").attr("src") ||
        null;
      const descEl = $(".content-text");
      const description = descEl.length > 0 ? nfc(descEl.text().trim()) : null;
      const views =
        parseInt(
          $(".stat-item")
            .first()
            .find(".stat-val")
            .text()
            .trim()
            .replace(/[,.\s]/g, ""),
        ) || 0;

      let chapterCount = 0;
      $("button.nav-link").each((_, el) => {
        const match = $(el)
          .text()
          .match(/Danh sách chương\s*\((\d+)\)/);
        if (match) chapterCount = parseInt(match[1]);
      });

      const categories: string[] = [];
      $('a[href*="?cat="]').each((_, el) => {
        const catName = $(el).text().trim();
        if (catName && !categories.includes(catName)) {
          categories.push(catName);
        }
      });

      // Xử lý Upload Ảnh Bìa
      let finalCoverUrl = story.coverUrl;
      let sourceCoverUrl = coverUrlRaw || story.coverUrl;

      if (sourceCoverUrl) {
        if (sourceCoverUrl.startsWith("//"))
          sourceCoverUrl = "https:" + sourceCoverUrl;
        else if (!sourceCoverUrl.startsWith("http"))
          sourceCoverUrl = `${BASE_URL}${sourceCoverUrl.startsWith("/") ? "" : "/"}${sourceCoverUrl}`;
      }

      if (sourceCoverUrl && (!isAlreadyOnR2 || !finalCoverUrl)) {
        console.log(`  🖼️  Đang tải ảnh bìa: ${sourceCoverUrl}`);
        const imageData = await fetchImageBuffer(sourceCoverUrl);
        if (imageData) {
          let ext =
            sourceCoverUrl
              .split(".")
              .pop()
              ?.split("?")[0]
              .replace(/[^a-zA-Z0-9]/g, "")
              .slice(0, 4) || "jpg";
          const r2Key = `covers/${story.slug}-cover.${ext}`;

          const uploadedUrl = await uploadCoverImage(
            r2Key,
            imageData.buffer,
            imageData.contentType,
          );
          if (uploadedUrl) {
            finalCoverUrl = uploadedUrl;
            console.log(`  ✅ Đã lên R2: ${r2Key}`);
          }
        } else {
          finalCoverUrl = sourceCoverUrl;
        }
      }

      await prisma.story.update({
        where: { id: story.id },
        data: {
          coverUrl: finalCoverUrl,
          description,
          views,
          remoteChapterCount: chapterCount || undefined,
        },
      });

      // Xử lý Thể loại (Categories)
      if (categories.length > 0) {
        for (const catName of categories) {
          const rawCatName = nfc(catName);
          const catSlug = createSlug(rawCatName);
          let cat = await prisma.category.findUnique({ where: { slug: catSlug } });
          if (!cat) {
            cat = await prisma.category.create({
              data: { name: rawCatName, slug: catSlug },
            });
          }

          const linking = await prisma.storyCategory.findUnique({
            where: {
              storyId_categoryId: { storyId: story.id, categoryId: cat.id },
            },
          });
          if (!linking) {
            await prisma.storyCategory.create({
              data: { storyId: story.id, categoryId: cat.id },
            });
          }
        }
        console.log(`  🏷️  Cập nhật ${categories.length} thể loại: ${categories.join(", ")}`);
      }

      console.log(`  ✨ Cập nhật thành công!`);
    } catch (err) {
      console.error(`  ❌ Lỗi khi xử lý truyện này:`, err);
    }
  }
}

// ============================================================================
// 📄 PHASE 3: CÀO NỘI DUNG CHƯƠNG — BĂNG CHUYỀN (WORKER POOL)
// ============================================================================
type ScrapeTask = {
  storyId: number;
  sourceId: number;
  chapterNum: number;
  storyTitle: string;
};

async function phase3_crawlChapters(
  storyId?: number,
  maxChapters?: number,
  concurrency: number = DEFAULT_CONCURRENCY,
) {
  console.log(
    "\n" +
      "=".repeat(60) +
      `\n📄 PHASE 3: Cào nội dung chương (🔀 ${concurrency} Tabs song song)\n` +
      "=".repeat(60),
  );

  const stories = await prisma.story.findMany({
    where: storyId
      ? { id: storyId }
      : { remoteChapterCount: { gt: 0 }, sourceId: { not: null } },
    select: { id: true, sourceId: true, title: true, remoteChapterCount: true },
    orderBy: { id: "asc" },
  });

  const allTasks: ScrapeTask[] = [];

  for (const story of stories) {
    if (!story.sourceId) continue;
    const limit = maxChapters || story.remoteChapterCount || 9999;
    const lastChapter = await prisma.chapter.findFirst({
      where: { storyId: story.id },
      orderBy: { chapterNum: "desc" },
      select: { chapterNum: true },
    });
    const startChap = lastChapter ? Math.floor(lastChapter.chapterNum) + 1 : 1;

    if (startChap > limit) continue;

    console.log(
      `📄 "${story.title}" — thêm chương ${startChap} → ${limit} vào hàng đợi`,
    );
    for (let i = startChap; i <= limit; i++) {
      allTasks.push({
        storyId: story.id,
        sourceId: story.sourceId,
        chapterNum: i,
        storyTitle: story.title,
      });
    }
  }

  if (allTasks.length === 0)
    return console.log("\n✅ Tất cả truyện đã crawl đủ chương.");

  let successCount = 0;
  let errorCount = 0;
  let processedCount = 0;
  let shouldAbort = false;
  const executing = new Set<Promise<void>>();

  const processTask = async (task: ScrapeTask): Promise<void> => {
    if (shouldAbort) return;
    try {
      const url = `${BASE_URL}/doc-truyen/${task.sourceId}/chuong/${task.chapterNum}`;
      const html = await fetchHtmlWithPuppeteer(url, 2, "div.chapter-content");
      const $ = cheerio.load(html);

      const contentEl = $("div.chapter-content");
      if (contentEl.length === 0)
        throw new Error("Không tìm thấy div.chapter-content");

      const content = nfc(
        contentEl
          .html()
          ?.replace(/<br\s*\/?>/gi, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .trim() || "",
      );

      const pageTitle = $("title").text();
      let title = `Chương ${task.chapterNum}`;
      const titleMatch = nfc(pageTitle).match(
        /^Chương\s*\d+[:.]\s*(.+?)\s*-\s*/,
      );
      if (titleMatch) title = titleMatch[1].trim();

      const existing = await prisma.chapter.findUnique({
        where: {
          storyId_chapterNum: {
            storyId: task.storyId,
            chapterNum: task.chapterNum,
          },
        },
      });

      if (!existing) {
        const slugifiedTitle = createSlug(task.storyTitle);
        const r2Key = `stories/${slugifiedTitle}/chapters/${task.chapterNum}.html`;

        const uploadSuccess = await uploadChapterContent(r2Key, content);
        await prisma.chapter.create({
          data: {
            storyId: task.storyId,
            chapterNum: task.chapterNum,
            title,
            cloudflarer2Key: uploadSuccess ? r2Key : null,
            content: uploadSuccess ? null : content,
          },
        });
        await prisma.story.update({
          where: { id: task.storyId },
          data: { chapterCount: { increment: 1 } },
        });
        successCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      errorCount++;
      console.error(
        `  ❌ [${task.storyTitle}] Chương ${task.chapterNum}:`,
        (err as Error).message,
      );
    }
  };

  for (const task of allTasks) {
    if (shouldAbort) break;
    const promise = processTask(task).then(() => {
      executing.delete(promise);
    });
    executing.add(promise);

    if (executing.size >= concurrency) await Promise.race(executing);

    processedCount++;
    if (processedCount % 10 === 0) {
      console.log(
        `\n🔄 Tiến trình: ${processedCount}/${allTasks.length} | ✅ ${successCount} | ❌ ${errorCount}\n`,
      );
    }
  }

  await Promise.all(executing);
  console.log(
    `\n🎉 Phase 3 hoàn thành: ✅ ${successCount} thành công | ❌ ${errorCount} lỗi / ${allTasks.length} tổng chương!`,
  );
}

// ============================================================================
// 🔍 KIỂM TRA DUNG LƯỢNG TRƯỚC KHI CRAWL
// ============================================================================
async function checkStorageLimits() {
  console.log(
    "\n" +
      "=".repeat(60) +
      "\n🔍 KIỂM TRA DUNG LƯỢNG LƯU TRỮ (DB & R2)\n" +
      "=".repeat(60),
  );

  const maxDbSizeMB = process.env.MAX_DB_SIZE_MB
    ? parseFloat(process.env.MAX_DB_SIZE_MB)
    : 450;
  const maxR2Files = process.env.MAX_R2_FILES
    ? parseInt(process.env.MAX_R2_FILES)
    : 100000;

  // 1. Kiểm tra Postgres DB Size
  try {
    const dbSizeResult: any = await prisma.$queryRaw`
      SELECT pg_database_size(current_database()) as size_bytes
    `;
    if (dbSizeResult && dbSizeResult.length > 0) {
      const sizeBytes = Number(dbSizeResult[0].size_bytes);
      const sizeMB = sizeBytes / (1024 * 1024);
      console.log(
        `🗄️  Dung lượng DB hiện tại: ${sizeMB.toFixed(2)} MB / ${maxDbSizeMB} MB`,
      );
      if (sizeMB > maxDbSizeMB) {
        console.error(
          `🚨 CẢNH BÁO: Dung lượng DB (${sizeMB.toFixed(2)} MB) vượt ngưỡng cho phép (${maxDbSizeMB} MB). DỪNG CRAWLER!`,
        );
        process.exit(1);
      }
    }
  } catch (error) {
    console.error("⚠️ Lỗi khi kiểm tra DB:", (error as Error).message);
  }

  // 2. Kiểm tra R2 Usage (Estimate qua count)
  try {
    const chaptersCount = await prisma.chapter.count({
      where: { cloudflarer2Key: { not: null } },
    });
    const coversCount = await prisma.story.count({
      where: { coverUrl: { not: null } },
    });

    const estimatedFiles = chaptersCount + coversCount;
    console.log(
      `☁️  Ước lượng file trên R2: ~${estimatedFiles} files / ${maxR2Files} files`,
    );

    if (estimatedFiles > maxR2Files) {
      console.error(
        `🚨 CẢNH BÁO: R2 vượt phần Free Tier (~${estimatedFiles} >= ${maxR2Files}). DỪNG CRAWLER!`,
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("⚠️ Lỗi ước lượng R2:", (error as Error).message);
  }

  console.log("✅ Hệ thống lưu trữ an toàn. Có thể tiếp tục.\n");
}

// ============================================================================
// 🚀 MAIN
// ============================================================================
async function main() {
  const args = process.argv.slice(2);
  const phaseArg = args.find((a) => a.startsWith("--phase="));
  const storyArg = args.find((a) => a.startsWith("--story="));
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const concurrencyArg = args.find((a) => a.startsWith("--concurrency="));
  const categoryArg = args.find((a) => a.startsWith("--category="));

  const phase = phaseArg ? parseInt(phaseArg.split("=")[1]) : 0;
  const storyId = storyArg ? parseInt(storyArg.split("=")[1]) : undefined;
  const maxChapters = limitArg ? parseInt(limitArg.split("=")[1]) : undefined;
  const concurrency = concurrencyArg
    ? parseInt(concurrencyArg.split("=")[1])
    : DEFAULT_CONCURRENCY;
  const categorySlug = categoryArg ? categoryArg.split("=")[1] : undefined;

  console.log("🚀 TiemTruyenChu Crawler v3.0 (Puppeteer Stealth Edition)");

  try {
    await checkStorageLimits(); // Kiểm tra dung lượng lưu trữ trước
    await loginTiemTruyenChu(); // Thực hiện đăng nhập đầu tiên

    if (phase === 0 || phase === 1) {
      if (categorySlug) await phase1_crawlStoryListByCategory(categorySlug);
      else await phase1_crawlStoryList();
    }
    if (phase === 0 || phase === 2) await phase2_crawlStoryDetails(storyId);
    if (phase === 0 || phase === 3)
      await phase3_crawlChapters(storyId, maxChapters, concurrency);
  } finally {
    await closeBrowser(); // QUAN TRỌNG: Đóng trình duyệt ảo để giải phóng RAM
    await prisma.$disconnect();
    console.log(`\n📊 Thống kê: ${requestCount} Tabs Puppeteer đã mở.`);
    console.log("🔌 Đã đóng kết nối an toàn.");
  }
}

main().catch(async (e) => {
  console.error("💀 Lỗi hệ thống nghiêm trọng:", e);
  await closeBrowser();
  process.exit(1);
});
