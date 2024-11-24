// // generate comment schema and types, following the post.schema.ts file
// model Comment {
//   id              Int       @id @default(autoincrement())
//   content         String    @db.Text
//   createdAt       DateTime  @default(now())
//   updatedAt       DateTime  @updatedAt
//   replies         Comment[] @relation("CommentReplies")
//   Post            Post      @relation(fields: [postId], references: [id])
//   userId          Int
//   user            User      @relation(fields: [userId], references: [id])
//   postId          Int
//   parentComment   Comment?  @relation("CommentReplies", fields: [parentCommentId], references: [id])
//   parentCommentId Int?
// }

import { z } from "zod";
import { timestampSchema } from '@/common/models/timestamp/timestamp.type';
import { EUserField, userSchema } from '@/user/validators/user.schema';
import { EPostField, postSchema } from './post.schema';

export enum ECommentField {
  id = 'id',
  content = 'content',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  replies = 'replies',
  post = 'post',
  postId = 'postId',
  user = 'user',
  userId = 'userId',
  parentComment = 'parentComment',
  parentCommentId = 'parentCommentId'
}

export const commentFieldSchema = z.nativeEnum(ECommentField);

export const commentSchema = z.object({
  [ECommentField.id]: z
    .number({ message: 'ID phải là chữ số lớn hơn 0.' })
    .positive({ message: 'ID phải là chữ số lớn hơn 0.' })
    .max(Number.MAX_SAFE_INTEGER),
  [ECommentField.content]: z
    .string()
    .min(1, { message: 'Nội dung bình luận không được bỏ trống.' }),
  [ECommentField.postId]: postSchema.shape[EPostField.id],
  [ECommentField.userId]: userSchema.shape[EUserField.id],
  [ECommentField.parentCommentId]: z
    .number()
    .positive()
    .nullable()
    .optional(),
  [ECommentField.user]: userSchema
    .pick({
      [EUserField.id]: true,
      [EUserField.name]: true,
      [EUserField.avatarUrl]: true
    }),

  ...timestampSchema(),
}).strict();

export const createCommentSchema = z.object({
  content: commentSchema.shape[ECommentField.content],
  postId: postSchema.shape[EPostField.id].optional(),
  parentCommentId: commentSchema.shape[ECommentField.parentCommentId].optional(),
}).strict().refine(data => {
  // Phải có ít nhất một trong hai trường postId hoặc parentCommentId
  return !!data.postId || !!data.parentCommentId;
}, {
  message: "Phải có ít nhất một trong hai trường: postId hoặc parentCommentId"
});

export const updateCommentSchema = commentSchema.pick({
  [ECommentField.content]: true
}).strict();

export const COMMENT_PUBLIC_FIELDS: ECommentField[] = [
  ECommentField.id,
  ECommentField.content,
  ECommentField.createdAt,
  ECommentField.user,
  ECommentField.replies
] as const;


