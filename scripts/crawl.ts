import * as cheerio from "cheerio";
import { prisma } from "../src/lib/prisma"; // HTTP adapter — không cần transaction
import { uploadChapterContent } from "../src/features/chapter/services/storage";

// ============================================================================
// 🔧 CẤU HÌNH & KIỂU DỮ LIỆU
// ============================================================================
const BASE_URL = "https://www.tiemtruyenchu.com";
const DELAY_MS = 1500; // Delay cơ bản giữa các batch (ms)
const DELAY_JITTER = 0.5; // Jitter ±50% cho random delay
const DEFAULT_CONCURRENCY = 10; // Số chương cào song song mặc định

// 🛡️ Pool User-Agent xoay vòng — giả lập nhiều trình duyệt khác nhau
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/115.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.5; rv:132.0) Gecko/20100101 Firefox/132.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
];

// Lấy User-Agent ngẫu nhiên
function getRandomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// Kiểu dữ liệu từ AJAX API danh sách truyện
interface ScrapedStory {
  id: string | number;
  title: string;
  author: string;
  category: string;
  total_chapters: string | number;
  status: string;
  formattedDate?: string;
}

// Kiểu dữ liệu chi tiết truyện (parse từ HTML)
interface StoryDetail {
  coverUrl: string | null;
  description: string | null;
  categories: string[];
  views: number;
  chapterCount: number;
}

// Kiểu dữ liệu nội dung chương (parse từ HTML)
interface ChapterData {
  chapterNum: number;
  title: string;
  content: string;
}

// ============================================================================
// 🛠️ HÀM TIỆN ÍCH
// ============================================================================

// Tạo slug chuẩn SEO từ text tiếng Việt
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

// Chuẩn hoá Unicode NFD → NFC cho tiếng Việt
function nfc(text: string): string {
  return text.normalize("NFC");
}

// Delay helper — có random jitter để tránh pattern đều đặn
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function randomDelay(baseMs: number = DELAY_MS): Promise<void> {
  const jitter = baseMs * DELAY_JITTER;
  const actual = baseMs + (Math.random() * 2 - 1) * jitter; // ±50%
  await delay(Math.max(500, Math.round(actual)));
}

// Thống kê request để theo dõi rate limiting
let requestCount = 0;
let rateLimitHits = 0;
let connectionErrors = 0;

// Hỗ trợ fetch có Timeout (tránh 1 request bị kẹt vĩnh viễn làm treo 1 băng chuyền)
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 10000,
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal as unknown as AbortSignal, // Type check
    });
    clearTimeout(id);
    return response;
  } catch (error: unknown) {
    clearTimeout(id);
    if ((error as Error).name === "AbortError") {
      throw new Error(`Request Timeout sau ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Lấy Headers ngẫu nhiên mượt hơn, giống trình duyệt xịn
function getRandomHeaders(): Record<string, string> {
  const isMobile = Math.random() > 0.8; // 20% giả lập mobile
  const ua = getRandomUA();

  const headers: Record<string, string> = {
    "User-Agent": ua,
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    DNT: "1",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
    Referer: "https://www.google.com/", // Đa dạng referer (từ google hoặc từ trang chủ)
  };

  // Nếu là trình duyệt xịn đời mới (Chromium >= 110)
  if (ua.includes("Chrome/") && parseInt(ua.split("Chrome/")[1]) >= 110) {
    headers["sec-ch-ua"] = '"Chromium";v="131", "Not_A Brand";v="24"';
    headers["sec-ch-ua-mobile"] = isMobile ? "?1" : "?0";
    headers["sec-ch-ua-platform"] = isMobile ? '"Android"' : '"Windows"';
  }

  return headers;
}

// Fetch wrapper chống block (Phiên bản cực xịn cho BĂNG CHUYỀN)
async function fetchWithRetry(url: string, retries = 5): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      requestCount++;
      const res = await fetchWithTimeout(
        url,
        {
          method: "GET",
          headers: getRandomHeaders(),
          redirect: "follow",
        },
        12000,
      ); // Tối đa 12s cho 1 request

      // Xử lý Rate-Limit (429) hoặc Server tạch (503/502/504) hoặc Blocked (403)
      if ([429, 503, 502, 504, 403].includes(res.status)) {
        rateLimitHits++;
        const retryAfter = res.headers.get("Retry-After");
        // Nếu dính 403 (Cloudflare chặn) -> delay lâu hơn để qua mặt thuật toán
        const waitSec = retryAfter
          ? parseInt(retryAfter)
          : res.status === 403
            ? 15 + i * 20
            : 5 + i * 10;

        console.log(
          `  🛑 HTTP ${res.status} — server chặn/quá tải! Chờ ${waitSec}s... (hit #${rateLimitHits})`,
        );
        await delay(waitSec * 1000);
        continue; // Chạy lại loop hiện tại
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res; // Thành công thì trả về
    } catch (err: unknown) {
      connectionErrors++;
      if (i === retries - 1) throw err;

      // Lỗi kết nối, timeout, DNS.. (Không phải trả về HTTP code)
      // Exponential backoff + Jitter: 2s, 4s, 8s, 16s... + random(0-2s)
      const baseBackoff = Math.min(2000 * Math.pow(2, i), 30000);
      const backoffWithJitter = baseBackoff + Math.floor(Math.random() * 2000);

      console.log(
        `  ⟳ [Lỗi mạng] Retry ${i + 1}/${retries} cho ${url} (chờ ${(backoffWithJitter / 1000).toFixed(1)}s): ${(err as Error).message}`,
      );
      await delay(backoffWithJitter);
    }
  }
  throw new Error("Unreachable");
}

// ============================================================================
// 📋 PHASE 1: CÀO DANH SÁCH TRUYỆN (AJAX API → DB + CSV)
// ============================================================================
async function phase1_crawlStoryList() {
  console.log("\n" + "=".repeat(60));
  console.log("📋 PHASE 1: Cào danh sách truyện từ AJAX API");
  console.log("=".repeat(60));

  let currentPage = 1;
  let totalPages = 1;
  let totalStories = 0;

  while (currentPage <= totalPages) {
    try {
      console.log(`\n⏳ Đang cào trang ${currentPage}/${totalPages}...`);

      const url = new URL(`${BASE_URL}/danh-sach`);
      url.searchParams.set("page", currentPage.toString());
      url.searchParams.set("ajax", "1");

      const response = await fetchWithRetry(url.toString());
      const data = await response.json();

      if (data.success && data.stories && data.stories.length > 0) {
        if (currentPage === 1 && data.totalPages) {
          totalPages = parseInt(data.totalPages);
        }

        // Lưu Database
        await saveStoryListToDB(data.stories);
        totalStories += data.stories.length;
        console.log(
          `✅ Trang ${currentPage}: ${data.stories.length} truyện → DB`,
        );
      } else {
        console.log(`⚠️ Không có dữ liệu ở trang ${currentPage}. Dừng.`);
        break;
      }

      currentPage++;
      await randomDelay();
    } catch (error) {
      console.error(`❌ Lỗi ở trang ${currentPage}:`, error);
      break;
    }
  }

  console.log(
    `\n🎉 Phase 1 hoàn thành: ${totalStories} truyện trên ${currentPage - 1} trang.`,
  );
}

// ============================================================================
// 📋 PHASE 1.5: CÀO TRUYỆN THEO THỂ LOẠI (AJAX API → DB)
// ============================================================================
async function phase1_crawlStoryListByCategory(categorySlug: string) {
  if (categorySlug === "all") {
    console.log("\n" + "=".repeat(60));
    console.log(`📋 PHASE 1.5: Cào 10 truyện MỚI NHẤT cho TẤT CẢ thể loại`);
    console.log("=".repeat(60));

    // Bước 1: Fetch danh sách Thể loại trực tiếp từ DB nếu có, hoặc tạo list cứng tạm
    // Vì trang gốc yêu cầu gọi API the-loai, ta sẽ cào danh sách thể loại từ DB
    const categories = await prisma.category.findMany({
      select: { slug: true, name: true },
    });

    if (categories.length === 0) {
      console.log(
        "⚠️ Trong DB chưa có thẻ category nào. Vui lòng chạy phase 1 trước để có danh sách thể loại.",
      );
      return;
    }

    console.log(
      `📚 Đã tải ${categories.length} thể loại từ Database. Bắt đầu duyệt...`,
    );

    for (const cat of categories) {
      console.log(`\n⏳ [${cat.name}] Đang lấy 10 truyện mới nhất...`);
      await fetchStoryListForCategory(cat.slug, 10);
      await randomDelay(2000); // Đợi 2s trước khi qua thể loại khác
    }
  } else {
    console.log("\n" + "=".repeat(60));
    console.log(`📋 PHASE 1.5: Cào truyện theo thể loại [${categorySlug}]`);
    console.log("=".repeat(60));

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
      const url = new URL(`${BASE_URL}/danh-sach`);
      url.searchParams.set("category", categorySlug);
      url.searchParams.set("page", currentPage.toString());
      url.searchParams.set("ajax", "1");
      url.searchParams.set("sort", "new_update"); // Truyện mới cập nhật

      const response = await fetchWithRetry(url.toString());
      const data = await response.json();

      if (data.success && data.stories && data.stories.length > 0) {
        // Chỉ lấy đủ số lượng target
        const needed = targetStories - totalStories;
        const storiesToSave = data.stories.slice(0, needed);

        // Lưu Database
        await saveStoryListToDB(storiesToSave);

        const addedCount = storiesToSave.length;
        totalStories += addedCount;

        console.log(
          `  ✅ Trang ${currentPage}: ${addedCount} truyện → DB (Tổng: ${totalStories}/${targetStories})`,
        );

        if (
          currentPage >= (data.totalPages ? parseInt(data.totalPages) : 999)
        ) {
          console.log(`  ⚠️ Đã hết trang của thể loại này.`);
          break;
        }
      } else {
        console.log(`  ⚠️ Không có dữ liệu ở trang ${currentPage}. Bỏ qua.`);
        break;
      }

      if (totalStories < targetStories) {
        currentPage++;
        await randomDelay();
      }
    } catch (error) {
      console.error(`  ❌ Lỗi ở trang ${currentPage}:`, error);
      break;
    }
  }
}

// Hàm lưu danh sách truyện vào DB (findUnique + create/update)
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

    let categoryId: number | null = null;

    // Xử lý Thể loại
    if (story.category) {
      const catName = nfc(story.category);
      const catSlug = createSlug(catName);
      let cat = await prisma.category.findUnique({
        where: { slug: catSlug },
      });
      if (!cat) {
        cat = await prisma.category.create({
          data: { name: catName, slug: catSlug },
        });
      }
      categoryId = cat.id;
    }

    // Xử lý Truyện — tìm theo sourceId trước, rồi theo slug
    let dbStory =
      (await prisma.story.findUnique({ where: { sourceId } })) ||
      (await prisma.story.findUnique({ where: { slug } }));
    if (dbStory) {
      dbStory = await prisma.story.update({
        where: { id: dbStory.id },
        data: { title, author, status, remoteChapterCount, sourceId },
      });
    } else {
      dbStory = await prisma.story.create({
        data: { title, slug, author, status, remoteChapterCount, sourceId },
      });
    }

    // Liên kết Truyện - Thể loại
    if (categoryId) {
      const linking = await prisma.storyCategory.findUnique({
        where: {
          storyId_categoryId: {
            storyId: dbStory.id,
            categoryId: categoryId,
          },
        },
      });
      if (!linking) {
        await prisma.storyCategory.create({
          data: { storyId: dbStory.id, categoryId: categoryId },
        });
      }
    }
  }
}

// ============================================================================
// 📖 PHASE 2: CÀO CHI TIẾT TRUYỆN (HTML → DB)
// ============================================================================
async function phase2_crawlStoryDetails(storyId?: number) {
  console.log("\n" + "=".repeat(60));
  console.log("📖 PHASE 2: Cào chi tiết truyện từ trang HTML");
  console.log("=".repeat(60));

  // Lấy danh sách truyện cần crawl từ DB
  const stories = await prisma.story.findMany({
    where: storyId ? { id: storyId } : {},
    select: {
      id: true,
      sourceId: true,
      title: true,
      slug: true,
      description: true,
    },
  });

  console.log(`📚 Tìm thấy ${stories.length} truyện cần cào chi tiết.\n`);

  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];

    // Skip nếu không có sourceId (không biết URL gốc)
    if (!story.sourceId) {
      console.log(
        `⏭️  [${i + 1}/${stories.length}] "${story.title}" — không có sourceId, bỏ qua.`,
      );
      continue;
    }

    // Skip nếu đã có description (đã crawl rồi)
    if (story.description && !storyId) {
      console.log(
        `⏭️  [${i + 1}/${stories.length}] "${story.title}" — đã có chi tiết, bỏ qua.`,
      );
      continue;
    }

    try {
      console.log(
        `📖 [${i + 1}/${stories.length}] Đang cào chi tiết: "${story.title}" (source: ${story.sourceId})...`,
      );

      const detail = await scrapeStoryDetailPage(story.sourceId);
      if (!detail) {
        console.log(`  ⚠️ Không thể parse chi tiết.`);
        continue;
      }

      // Cập nhật Story trong DB
      await prisma.story.update({
        where: { id: story.id },
        data: {
          coverUrl: detail.coverUrl,
          description: detail.description,
          views: detail.views,
          remoteChapterCount: detail.chapterCount || undefined,
        },
      });

      // Cập nhật thêm categories
      for (const catName of detail.categories) {
        const normalizedCatName = nfc(catName);
        const catSlug = createSlug(normalizedCatName);
        let cat = await prisma.category.findUnique({
          where: { slug: catSlug },
        });
        if (!cat) {
          cat = await prisma.category.create({
            data: { name: normalizedCatName, slug: catSlug },
          });
        }
        const exists = await prisma.storyCategory.findUnique({
          where: {
            storyId_categoryId: { storyId: story.id, categoryId: cat.id },
          },
        });
        if (!exists) {
          await prisma.storyCategory.create({
            data: { storyId: story.id, categoryId: cat.id },
          });
        }
      }

      console.log(
        `  ✅ Cập nhật: cover=${detail.coverUrl ? "có" : "không"}, desc=${detail.description ? detail.description.length + " ký tự" : "không"}, views=${detail.views}, cats=[${detail.categories.join(", ")}]`,
      );

      await randomDelay();
    } catch (err) {
      console.error(`  ❌ Lỗi khi cào "${story.title}":`, err);
    }
  }

  console.log(`\n🎉 Phase 2 hoàn thành.`);
}

// Parse HTML trang chi tiết truyện
async function scrapeStoryDetailPage(
  sourceId: number,
): Promise<StoryDetail | null> {
  const url = `${BASE_URL}/truyen/${sourceId}`;
  const res = await fetchWithRetry(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Cover image
  const coverUrl = $("img.story-poster").attr("src") || null;

  // Title — h2 > span.align-middle
  // (không cần vì đã có từ Phase 1)

  // Description — .content-text
  const descEl = $(".content-text");
  const description = descEl.length > 0 ? nfc(descEl.text().trim()) : null;

  // Categories — a.tag-pill.tag-active
  const categories: string[] = [];
  $("a.tag-pill.tag-active").each((_, el) => {
    const catName = nfc($(el).text().trim());
    if (catName) categories.push(catName);
  });

  // Views — .stat-item:first .stat-val
  const viewsText = $(".stat-item").first().find(".stat-val").text().trim();
  const views = parseInt(viewsText.replace(/[,.\s]/g, "")) || 0;

  // Chapter count — tab button text "Danh sách chương (N)"
  let chapterCount = 0;
  $("button.nav-link").each((_, el) => {
    const text = $(el).text();
    const match = text.match(/Danh sách chương\s*\((\d+)\)/);
    if (match) {
      chapterCount = parseInt(match[1]);
    }
  });

  return { coverUrl, description, categories, views, chapterCount };
}

// ============================================================================
// 📄 PHASE 3: CÀO NỘI DUNG CHƯƠNG — BĂNG CHUYỀN (WORKER POOL)
// ============================================================================

// Kiểu dữ liệu cho mỗi task trong hàng đợi
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
  console.log("\n" + "=".repeat(60));
  console.log("📄 PHASE 3: Cào nội dung chương (Băng Chuyền)");
  console.log(`🔀 Workers: ${concurrency} luồng song song liên tục`);
  console.log("=".repeat(60));

  // 1. Lấy truyện cần crawl chương
  const stories = await prisma.story.findMany({
    where: storyId
      ? { id: storyId }
      : { remoteChapterCount: { gt: 0 }, sourceId: { not: null } },
    select: { id: true, sourceId: true, title: true, remoteChapterCount: true },
    orderBy: { id: "asc" },
  });

  if (stories.length === 0) {
    console.log("Không tìm thấy truyện nào cần cào chương.");
    return;
  }

  // 2. GOM HÀNG ĐỢI KHỔNG LỒ — trộn lẫn chương từ nhiều truyện
  const allTasks: ScrapeTask[] = [];

  for (const story of stories) {
    if (!story.sourceId) continue;
    const limit = maxChapters || story.remoteChapterCount || 9999;

    // Tìm chương đã crawl cuối cùng trong DB để resume
    const lastChapter = await prisma.chapter.findFirst({
      where: { storyId: story.id },
      orderBy: { chapterNum: "desc" },
      select: { chapterNum: true },
    });
    const startChap = lastChapter ? Math.floor(lastChapter.chapterNum) + 1 : 1;

    if (startChap > limit) {
      console.log(
        `⏭️  "${story.title}" — đã đủ ${lastChapter?.chapterNum} chương, bỏ qua.`,
      );
      continue;
    }

    console.log(
      `📄 "${story.title}" (source: ${story.sourceId}) — thêm chương ${startChap} → ${limit} vào hàng đợi`,
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

  if (allTasks.length === 0) {
    console.log("\n✅ Tất cả truyện đã crawl đủ chương. Không có gì để làm.");
    return;
  }

  console.log(
    `\n📋 Tổng cộng ${allTasks.length} chương từ ${stories.length} truyện. Khởi động băng chuyền...`,
  );

  // 3. THIẾT LẬP BĂNG CHUYỀN (WORKER POOL)
  let successCount = 0;
  let errorCount = 0;
  let consecutiveErrors = 0;
  let processedCount = 0;
  let shouldAbort = false;
  const MAX_CONSECUTIVE_ERRORS = 15;
  const executing = new Set<Promise<void>>();

  // Hàm xử lý 1 task trọn vẹn: Cào HTML → Parse → Lưu DB
  const processTask = async (task: ScrapeTask): Promise<void> => {
    if (shouldAbort) return;

    try {
      const chapterData = await scrapeChapterPage(
        task.sourceId,
        task.chapterNum,
      );

      if (!chapterData) {
        errorCount++;
        consecutiveErrors++;
        console.log(
          `  ❌ [${task.storyTitle}] Chương ${task.chapterNum}: không parse được nội dung`,
        );

        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          shouldAbort = true;
          console.log(
            `\n🛑 ${MAX_CONSECUTIVE_ERRORS} lỗi liên tiếp! Dừng băng chuyền để tránh bị chặn.`,
          );
        }
        return;
      }

      // Reset lỗi liên tiếp khi thành công
      consecutiveErrors = 0;

      // Upsert: tạo nếu chưa có, bỏ qua nếu đã tồn tại
      const existing = await prisma.chapter.findUnique({
        where: {
          storyId_chapterNum: {
            storyId: task.storyId,
            chapterNum: chapterData.chapterNum,
          },
        },
      });

      if (!existing) {
        // --- Upload nội dung lên Cloudflare R2 ---
        const slugifiedTitle = createSlug(task.storyTitle);
        const r2Key = `stories/${slugifiedTitle}/chapters/${chapterData.chapterNum}.html`;

        console.log(
          `  ☁️  [${task.storyTitle}] Uploading chương ${task.chapterNum} lên R2...`,
        );
        const uploadSuccess = await uploadChapterContent(
          r2Key,
          chapterData.content,
        );

        if (!uploadSuccess) {
          console.warn(
            `  ⚠️  [${task.storyTitle}] Upload R2 thất bại chương ${task.chapterNum}. Fallback lưu vào Database.`,
          );
        }

        await prisma.chapter.create({
          data: {
            storyId: task.storyId,
            chapterNum: chapterData.chapterNum,
            title: chapterData.title,
            cloudflarer2Key: uploadSuccess ? r2Key : null,
            content: uploadSuccess ? null : chapterData.content, // Lỗi upload thì fallback lưu DB
          },
        });

        // Cập nhật chapterCount (số chương thực tế đã tải) cho Story
        await prisma.story.update({
          where: { id: task.storyId },
          data: { chapterCount: { increment: 1 } },
        });

        successCount++;
        // Ẩn log thành công để đỡ rối terminal
        // console.log(`  ✅ [${task.storyTitle}] Chương ${task.chapterNum} đã lưu`);
      } else {
        successCount++;
        // Ẩn log skip để đỡ rối terminal
        // console.log(`  ⏭️  [${task.storyTitle}] Chương ${task.chapterNum} đã tồn tại`);
      }
    } catch (err) {
      errorCount++;
      consecutiveErrors++;
      console.error(
        `  ❌ [${task.storyTitle}] Chương ${task.chapterNum}:`,
        err instanceof Error ? err.message : err,
      );

      if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        shouldAbort = true;
        console.log(
          `\n🛑 ${MAX_CONSECUTIVE_ERRORS} lỗi liên tiếp! Dừng băng chuyền để tránh bị chặn.`,
        );
      }
    }
  };

  // 4. CHẠY BĂNG CHUYỀN — luôn giữ đúng N worker chạy đồng thời
  for (const task of allTasks) {
    if (shouldAbort) break;

    // Tạo promise cho task hiện tại
    const promise = processTask(task).then(() => {
      // Tự xóa khỏi pool khi hoàn tất
      executing.delete(promise);
    });
    executing.add(promise);

    // Khi băng chuyền đầy → đợi worker nhanh nhất xong rồi thả task tiếp
    if (executing.size >= concurrency) {
      await Promise.race(executing);
      // Micro-delay (100-300ms) giữa các task để không dồn dập quá
      await delay(Math.floor(Math.random() * 200) + 100);
    }

    // Log tiến trình mỗi 50 task
    processedCount++;
    if (processedCount % 50 === 0) {
      console.log(
        `\n🔄 Tiến trình: ${processedCount}/${allTasks.length} đã đẩy lên băng chuyền | ✅ ${successCount} | ❌ ${errorCount}\n`,
      );
    }
  }

  // Chờ những worker cuối cùng trên băng chuyền hoàn tất
  await Promise.all(executing);

  console.log(
    `\n🎉 Phase 3 hoàn thành: ✅ ${successCount} thành công | ❌ ${errorCount} lỗi / ${allTasks.length} tổng chương!`,
  );
}

// Parse HTML trang đọc chương
async function scrapeChapterPage(
  sourceId: number,
  chapNum: number,
): Promise<ChapterData | null> {
  const url = `${BASE_URL}/doc-truyen/${sourceId}/chuong/${chapNum}`;

  try {
    const res = await fetchWithRetry(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Nội dung chương — div.chapter-content
    const contentEl = $("div.chapter-content");
    if (contentEl.length === 0) return null;

    // Lấy text thuần (giữ xuống dòng), loại bỏ HTML tags
    const content = nfc(
      contentEl
        .html()
        ?.replace(/<br\s*\/?>/gi, "\n") // Đổi <br> thành \n
        .replace(/<[^>]+>/g, "") // Xóa HTML tags còn lại
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim() || "",
    );

    // Parse title từ <title> tag: "Chương X: Title - StoryName"
    const pageTitle = $("title").text();
    let title = "";
    const titleMatch = nfc(pageTitle).match(/^Chương\s*\d+[:.]\s*(.+?)\s*-\s*/);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    return {
      chapterNum: chapNum,
      title: title || `Chương ${chapNum}`,
      content,
    };
  } catch (err) {
    return null;
  }
}

// ============================================================================
// 🚀 MAIN: ĐIỀU PHỐI CÁC PHASES
// ============================================================================
async function main() {
  // Parse tham số dòng lệnh
  const args = process.argv.slice(2);
  const phaseArg = args.find((a) => a.startsWith("--phase="));
  const storyArg = args.find((a) => a.startsWith("--story="));
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const concurrencyArg = args.find((a) => a.startsWith("--concurrency="));
  const categoryArg = args.find((a) => a.startsWith("--category="));

  const phase = phaseArg ? parseInt(phaseArg.split("=")[1]) : 0; // 0 = all
  const storyId = storyArg ? parseInt(storyArg.split("=")[1]) : undefined;
  const maxChapters = limitArg ? parseInt(limitArg.split("=")[1]) : undefined;
  const concurrency = concurrencyArg
    ? parseInt(concurrencyArg.split("=")[1])
    : DEFAULT_CONCURRENCY;
  const categorySlug = categoryArg ? categoryArg.split("=")[1] : undefined;

  console.log("🚀 TiemTruyenChu Crawler v2.0");
  console.log(
    `⚙️  Phase: ${phase || "ALL"} | Story: ${storyId || "ALL"} | Limit: ${maxChapters || "ALL"} | Concurrency: ${concurrency} | Category: ${categorySlug || "ALL"}`,
  );

  try {
    if (phase === 0 || phase === 1) {
      if (categorySlug) {
        await phase1_crawlStoryListByCategory(categorySlug);
      } else {
        await phase1_crawlStoryList();
      }
    }

    if (phase === 0 || phase === 2) {
      await phase2_crawlStoryDetails(storyId);
    }

    if (phase === 0 || phase === 3) {
      await phase3_crawlChapters(storyId, maxChapters, concurrency);
    }
  } finally {
    await prisma.$disconnect();
    console.log(
      `\n📊 Thống kê: ${requestCount} requests | ${rateLimitHits} rate-limit hits`,
    );
    console.log("🔌 Đã đóng kết nối Database an toàn.");
  }
}

// Kích hoạt
main().catch((e) => {
  console.error("💀 Lỗi hệ thống nghiêm trọng:", e);
  process.exit(1);
});
