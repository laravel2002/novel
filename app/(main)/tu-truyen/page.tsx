import { Metadata } from "next";
import {
  getBookmarks,
  getReadingHistory,
  getWaitlist,
  getCompletedStories,
} from "@/services/library";
import { auth } from "@/auth";
import { GuestLibrary } from "@/features/library/components/GuestLibrary";
import { LibraryListUI } from "@/features/library/components/Library";

export const metadata: Metadata = {
  title: "Tủ Truyện | Novel",
  description: "Quản lý lịch sử đọc và truyện đang theo dõi của bạn",
};

export default async function LibraryPage() {
  const session = await auth();

  // Đảm bảo user đã đăng nhập, nếu chưa -> chuyển trang login
  if (!session || !session.user || !session.user.id) {
    return <GuestLibrary />;
  }

  const userId = session.user.id;

  const [readingHistory, bookmarks, waitlist, completed] = await Promise.all([
    getReadingHistory(userId),
    getBookmarks(userId),
    getWaitlist(userId),
    getCompletedStories(userId),
  ]);

  return (
    <LibraryListUI
      readingHistory={readingHistory}
      bookmarks={bookmarks}
      waitlist={waitlist}
      completed={completed}
    />
  );
}
