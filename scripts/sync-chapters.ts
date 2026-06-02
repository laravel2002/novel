import { AwsClient } from "aws4fetch";
import { prisma } from "../src/lib/prisma";

// 1. Khởi tạo kết nối R2
const aws = new AwsClient({
  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  region: "auto",
  service: "s3",
});

// Hàm hỗ trợ: Chia một danh sách lớn thành nhiều nhóm nhỏ
// Ví dụ: chia 1000 công việc thành 10 nhóm, mỗi nhóm 100 công việc
function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

async function syncMassiveChapters() {
  console.log("🚀 Bắt đầu đồng bộ dữ liệu lớn từ R2...");

  // 2. Cấu hình các biến số
  const accountId = process.env.R2_ACCOUNT_ID!;
  const bucketName = "novel"; // Tên bucket cập nhật theo ảnh của bạn
  const prefix = "stories/";
  const domain = "https://data.novel.id.vn";

  let isTruncated = true;
  let continuationToken = "";
  let totalFilesScanned = 0;
  let totalChaptersSaved = 0;

  try {
    // 3. Vòng lặp lấy dữ liệu từ R2 (Mỗi lần lấy tối đa 1000 files)
    while (isTruncated) {
      let url = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}?list-type=2&prefix=${prefix}`;
      if (continuationToken) {
        url += `&continuation-token=${encodeURIComponent(continuationToken)}`;
      }

      const response = await aws.fetch(url, { method: "GET" });
      if (!response.ok) throw new Error(`Lỗi R2: ${response.status}`);

      const xmlText = await response.text();

      // Lấy tất cả đường dẫn (Keys) từ XML
      const keys = Array.from(xmlText.matchAll(/<Key>(.*?)<\/Key>/g)).map(
        (m) => m[1],
      );
      totalFilesScanned += keys.length;
      console.log(
        `📥 Đang tải từ R2... Đã lấy được ${totalFilesScanned} / ~175,000 files.`,
      );

      // Tạo một danh sách chứa các công việc cần lưu vào DB
      const dbOperations = [];

      for (const key of keys) {
        // Tách đường dẫn để lấy thông tin
        const match = key.match(/stories\/([^\/]+)\/chapters\/(\d+)\.html/);

        if (match) {
          const [_, storySlug, chapterNum] = match;
          const fullUrl = `${domain}/${key}`;

          // Tạo một công việc (Promise) và đẩy vào danh sách
          const operation = prisma.story
            .findUnique({
              where: { slug: storySlug },
              select: { id: true },
            })
            .then((story) => {
              if (story) {
                return prisma.chapter
                  .upsert({
                    where: {
                      storyId_chapterNum: {
                        storyId: story.id,
                        chapterNum: parseInt(chapterNum, 10),
                      },
                    },
                    update: { cloudflarer2Key: key },
                    create: {
                      storyId: story.id,
                      chapterNum: parseInt(chapterNum, 10),
                      title: `Chương ${chapterNum}`,
                      cloudflarer2Key: key,
                      content: "",
                    },
                  })
                  .then(() => {
                    totalChaptersSaved++;
                  });
              }
            });

          dbOperations.push(operation);
        }
      }

      // 4. Xử lý lưu Database theo nhóm (Batching)
      // Chia danh sách công việc thành các nhóm, mỗi nhóm 50 công việc chạy song song
      const batches = chunkArray(dbOperations, 50);
      for (const batch of batches) {
        // Đợi 50 công việc chạy xong mới chạy tiếp 50 công việc khác
        // Điều này giúp Database của bạn không bị sập vì quá tải
        await Promise.all(batch);
      }

      // 5. Kiểm tra xem R2 còn trang nào không để tiếp tục vòng lặp
      const isTruncatedMatch = xmlText.match(
        /<IsTruncated>(.*?)<\/IsTruncated>/,
      );
      isTruncated = isTruncatedMatch ? isTruncatedMatch[1] === "true" : false;

      if (isTruncated) {
        const tokenMatch = xmlText.match(
          /<NextContinuationToken>(.*?)<\/NextContinuationToken>/,
        );
        continuationToken = tokenMatch ? tokenMatch[1] : "";
      }
    }

    console.log(
      `✅ TUYỆT VỜI! Đã quét ${totalFilesScanned} files. Đã lưu ${totalChaptersSaved} chương vào DB.`,
    );
  } catch (error) {
    console.error("❌ Có lỗi xảy ra:", error);
  }
}

syncMassiveChapters();
