import { z } from 'zod';
import { TUser } from '../user/user.type';
import { EUserRoleAssociation } from '@/user/constants/associations/user-role.constant';

export const roleSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1).max(32),
});

export const roleCreateSchema = z.object({
  name: roleSchema.shape.name,
});

export const roleUpdateSchema = z.object({
  name: roleSchema.shape.name,
});

export type TRole = z.infer<typeof roleSchema> & {
  [EUserRoleAssociation.usersAssociationKey]?: TUser[];
};
export type TRoleCreate = z.infer<typeof roleCreateSchema>;
export type TRoleUpdate = z.infer<typeof roleUpdateSchema>;
