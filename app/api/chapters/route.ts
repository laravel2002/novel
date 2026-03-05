import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Đảm bảo đường dẫn này trỏ đúng file prisma của bạn

export async function GET(request: Request) {
  // 1. Lấy các tham số từ URL (ví dụ: /api/chapters?storyId=1&page=2&limit=50)
  const { searchParams } = new URL(request.url);
  const storyId = Number(searchParams.get("storyId"));
  // Sử dụng page (mặc định là 1) và limit (mặc định là 50)
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 50;

  // Kiểm tra xem có ID truyện chưa
  if (!storyId) {
    return NextResponse.json(
      { error: "Vui lòng cung cấp storyId" },
      { status: 400 },
    );
  }

  try {
    // 2. Viết truy vấn Offset-based bằng Prisma
    const skip = (page - 1) * limit;

    const chapters = await prisma.chapter.findMany({
      where: {
        storyId: storyId,
      },
      take: limit, // Lấy `limit` số lượng chương
      skip: skip, // Bỏ qua `skip` số lượng chương
      orderBy: {
        chapterNum: "asc", // Sắp xếp từ chương nhỏ đến lớn
      },
      // Chỉ lấy đúng những cột cần hiển thị để tối ưu
      select: {
        id: true,
        chapterNum: true,
        title: true,
      },
    });

    // Option: Có thể đến tổng số chương của story để báo cho frontend biết max page
    // (Tuy front-end đã có totalChapters nhưng truyền ra từ đây sẽ chắc chắn hơn)
    const totalChaptersCount = await prisma.chapter.count({
      where: { storyId: storyId },
    });

    const totalPages = Math.ceil(totalChaptersCount / limit);

    // Trả dữ liệu về cho Frontend
    return NextResponse.json({
      data: chapters,
      meta: {
        currentPage: page,
        limit: limit,
        totalPages: totalPages,
        totalItems: totalChaptersCount,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách chương:", error);
    return NextResponse.json({ error: "Lỗi server cục bộ" }, { status: 500 });
  }
}
