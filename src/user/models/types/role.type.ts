import { z } from 'zod';

export const roleSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1).max(32),
});

export const roleUpdateSchema = z.object({
  name: z.string().min(1).max(32),
});

export type IRole = z.infer<typeof roleSchema>;
