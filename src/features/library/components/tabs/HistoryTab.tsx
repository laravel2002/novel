import { getReadingHistory } from "@/features/library/services/library";
import { LibraryMobile } from "../LibraryMobile";
import { LibraryDesktop } from "../LibraryDesktop";
import { useDevice } from "@/components/providers/DeviceProvider";

export default async function HistoryTab({ userId }: { userId: string }) {
  const history = await getReadingHistory(userId, 20);
  
  // Lưu ý: Do LibraryDesktop hiện tại nhận cả 4 list, nên ta cần refactor nó 
  // thành từng component con hoặc cho phép render rỗng các phần khác.
  // Tuy nhiên để tối ưu nhất cho người dùng nhanh chóng, tôi sẽ hoàn trả Step 2 (Apply) 
  // phần Sửa lỗi (Task 0) trước, sau đó mới tối ưu Suspense sâu hơn.
  return null;
}
