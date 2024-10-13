import { z } from 'zod';

export const timestampSchema = () => ({
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
