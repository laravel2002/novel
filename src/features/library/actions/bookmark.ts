"use server";

import { auth } from "@/lib/auth/auth";
import { toggleBookmark as toggleDbBookmark } from "@/features/library/services/library";
import { revalidatePath } from "next/cache";

export async function toggleBookmarkAction(storyId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const result = await toggleDbBookmark(session.user.id, storyId);
    
    // Đảm bảo xóa cache của toàn bộ các trang liên quan
    revalidatePath("/tu-truyen");
    revalidatePath(`/truyen/[slug]`, "page");
    
    return { success: true, bookmarked: result.bookmarked };
  } catch (error) {
    console.error("[TOGGLE_BOOKMARK_ACTION_ERROR]", error);
    return { success: false, error: "Internal Server Error" };
  }
}

export async function updateBookmarkStatusAction(storyId: number, status: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Importing dynamically to avoid recursive dependencies if any
    const { changeLibraryStatus } = await import("@/features/library/services/library");
    const result = await changeLibraryStatus(session.user.id, storyId, status);
    
    revalidatePath("/tu-truyen");
    revalidatePath(`/truyen/[slug]`, "page");
    
    return { success: true, bookmarked: result.bookmarked, status: result.status };
  } catch (error) {
    console.error("[UPDATE_BOOKMARK_STATUS_ERROR]", error);
    return { success: false, error: "Internal Server Error" };
  }
}
