import { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { GuestLibrary } from "@/features/library/components/GuestLibrary";
import { LibraryListUI } from "@/features/library/components/Library";
import { headers } from "next/headers";
import { getDeviceTypeFromHeaders } from "@/lib/device";
import {
  getReadingHistory,
  getBookmarks,
  getWaitlist,
  getCompletedStories,
} from "@/features/library/services/library";

export const metadata: Metadata = {
  title: "Tủ Truyện | Novel",
  description: "Quản lý lịch sử đọc và truyện đang theo dõi của bạn",
};

export default async function LibraryPage() {
  const session = await auth();
  const headersList = await headers();
  const deviceType = getDeviceTypeFromHeaders(headersList);
  const isMobile = deviceType === "mobile";

  // Đảm bảo user đã đăng nhập, nếu chưa -> hiển thị trang khách
  if (!session || !session.user || !session.user.id) {
    return <GuestLibrary />;
  }

  const userId = session.user.id;

  const [history, bookmarks, waitlist, completed] = await Promise.all([
    getReadingHistory(userId),
    getBookmarks(userId),
    getWaitlist(userId),
    getCompletedStories(userId),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <LibraryListUI 
        userId={userId}
        readingHistory={history}
        bookmarks={bookmarks}
        waitlist={waitlist}
        completed={completed}
      />
    </div>
  );
}
