import { z } from 'zod';
import { timestampSchema } from '@/common/models/timestamp/timestamp.type';

export const roleSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1).max(32),
  ...timestampSchema(),
});

export type TRole = z.infer<typeof roleSchema>;
