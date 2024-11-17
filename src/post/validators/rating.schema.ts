import { timestampSchema } from "@/common/models/timestamp/timestamp.type";
import { z } from "zod";

export const ratingSchema = z.object({
  score: z.number().int().min(1).max(5),
  ...timestampSchema()
})

export type TRating = Partial<z.infer<typeof ratingSchema>>