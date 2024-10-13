import { z } from 'zod';

export const timestampSchema = z.object({
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});
