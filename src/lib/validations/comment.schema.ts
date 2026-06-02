import { z } from "zod";

export const commentSchema = z.object({
  content: z.string().min(1, { message: "Nội dung bình luận không được để trống" }),
  isSpoiler: z.boolean().default(false).optional(),
});

export type CommentFormData = z.infer<typeof commentSchema>;
