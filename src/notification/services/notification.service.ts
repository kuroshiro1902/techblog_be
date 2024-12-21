import {
  paginationOptions,
  paginationSchema,
  TPageInfo,
  TPagination,
} from '@/common/models/pagination/pagination.model';
import { DB } from '@/database/database';
import { COMMENT_PUBLIC_FIELDS, ECommentField } from '@/post/validators/comment.schema';
import { EPostField, POST_PUBLIC_FIELDS } from '@/post/validators/post.schema';
import { NotificationType, NotificationItemType, Notification, Prisma } from '@prisma/client';
import notificationServer from '../notification.server';
import { PostService } from '@/post/services/post.service';
import { ENotificationEvent } from '../constants/notification-event.const';
import { TNewPostCommentNotification, TNewPostNotification } from '../models/notification.model';
import { EUserField, userSchema } from '@/user/validators/user.schema';
import { z } from 'zod';
import { NotificationSocketService } from '@/notification/services/notification-socket.service';

type TMapFields = EPostField | ECommentField;
// const mapFields: Record<NotificationItemType, Record<TMapFields, true>> = {
//   [NotificationItemType.post]: [EPostField.id].reduce(
//     (prev, field) => ({ ...prev, [field]: true }),
//     {} as Record<TMapFields, true>
//   ),
//   [NotificationItemType.comment]: [ECommentField.id].reduce(
//     (prev, field) => ({ ...prev, [field]: true }),
//     {} as Record<TMapFields, true>
//   ),
// };

type TNotificationItem = Prisma.CommentDelegate & Prisma.PostDelegate;
export const NotificationService = {
  async createNotifications(
    userIds: number[],
    type: NotificationType,
    itemType: NotificationItemType,
    itemId: number,
    messageTitle: string,
    messageContent: string
  ) {
    const notifications = await DB.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type,
        itemType,
        itemId,
        messageTitle,
        messageContent,
      })),
    });
    return notifications;
  },

  async handleNewPostComment(input: TNewPostCommentNotification) {
    const { postId, user, comment } = input;
    // Lấy danh sách subscribers
    const { followerIds, ...post } = await PostService.getPostFollowersWithNotification(postId);

    // Loại bỏ userId của người tạo comment khỏi danh sách followers
    const filteredFollowerIds = followerIds.filter((id) => id !== user.id);

    if (!filteredFollowerIds.length) {
      return;
    }

    // Tạo nội dung thông báo
    const messageTitle = 'Bình luận mới';
    const truncatedComment = comment.content.length > 60 ? `${comment.content.substring(0, 60)}...` : comment.content;
    const messageContent = `<b>${user.name}</b> đã bình luận trong bài viết <b>${post.title}</b>: ${truncatedComment}`;

    // Tạo thông báo trong database
    await this.createNotifications(filteredFollowerIds, 'COMMENT', 'post', postId, messageTitle, messageContent);

    // Chuẩn bị dữ liệu để emit
    const notification = { messageTitle, messageContent, post };

    // Gửi sự kiện qua socket
    notificationServer
      .to(filteredFollowerIds.map((id) => `${id}`))
      .emit(ENotificationEvent.POST_NEW_COMMENT, notification);

    console.log(
      `Notification sent for new comment on postId: ${postId} by userId: ${user.id} to followers: ${filteredFollowerIds}`
    );
  },

  async handleNewPost(input: TNewPostNotification, type: 'create' | 'update') {

    const { post } = input;
    console.log('Call handleNewPost', { post });
    // Lấy danh sách người theo dõi của người đăng bài viết
    const followers = await PostService.getUserFollowersWithNotification(post.author.id);
    console.log('followers', { followers });

    if (!followers.length) {
      return;
    }

    // Tạo nội dung thông báo
    const messageTitle = type === 'create' ? 'Bài viết mới' : 'Bài viết được cập nhật';
    const messageContent = type === 'create' ? `<b>${post.author.name}</b> đã đăng bài viết mới: <b>${post.title}</b>` : `<b>${post.author.name}</b> đã cập nhật bài viết: <b>${post.title}</b>`;
    // Tạo thông báo trong database
    await this.createNotifications(followers.map(({ id }) => id), 'POST', 'post', post.id, messageTitle, messageContent);

    // Chuẩn bị dữ liệu để emit
    const notification = { messageTitle, messageContent, post, itemType: 'post', createdAt: post.createdAt };

    // Gửi sự kiện qua socket
    notificationServer
      .to(followers.map(({ id }) => `${id}`))
      .emit(ENotificationEvent.POST_NEW, notification);
  },

  // Find notifications for a user
  async findUserNotifications(
    userId$: number,
    pagination$: TPagination
  ) {
    const userId = userSchema.shape[EUserField.id].parse(userId$);
    const pagination = paginationSchema.parse(pagination$);
    const { skip, take, pageIndex, pageSize } = paginationOptions(pagination);

    const where = { userId };
    // Lấy tất cả thông báo theo phân trang
    const [totalCount, notifications] = await Promise.all([
      DB.notification.count({ where }),
      DB.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      })
    ]);

    const hasNextPage = skip + notifications.length < totalCount;
    const totalPage = Math.ceil(totalCount / pageSize)

    // Chia nhỏ các thông báo dựa trên itemType
    const postNotificationIds = notifications
      .filter((n) => n.itemType === 'post' && n.itemId !== null)
      .map((n) => n.itemId!);

    const commentNotificationIds = notifications
      .filter((n) => n.itemType === 'comment' && n.itemId !== null)
      .map((n) => n.itemId!);

    // Truy vấn bài viết và bình luận cùng lúc
    const [posts, comments] = await Promise.all([
      postNotificationIds.length
        ? DB.post.findMany({
          where: { id: { in: postNotificationIds } },
          select: { id: true, title: true, thumbnailUrl: true, slug: true },
        })
        : Promise.resolve([]),

      commentNotificationIds.length
        ? DB.comment.findMany({
          where: { id: { in: commentNotificationIds } },
          select: {
            id: true,
            post: {
              select: { id: true, title: true, thumbnailUrl: true, slug: true },
            },
          },
        })
        : Promise.resolve([]),
    ]);

    // Map dữ liệu bài viết và bình luận vào thông báo
    const postMap = Object.fromEntries(posts.map((p) => [p.id, p]));
    const commentMap = Object.fromEntries(comments.map((c) => [c.id, c]));

    const enrichedNotifications = notifications.map((notification) => {
      if (notification.itemType === 'post') {
        return { ...notification, post: postMap[notification.itemId!] || null };
      }
      if (notification.itemType === 'comment') {
        return { ...notification, comment: commentMap[notification.itemId!] || null };
      }
      return { ...notification, post: null, comment: null };
    });

    return { data: enrichedNotifications, pageInfo: { pageIndex, pageSize, totalPage, hasNextPage } as TPageInfo };
  },

  // Find unread notifications for a user
  async findUnreadNotifications(userId: number) {
    const notifications = await DB.notification.findMany({
      where: { userId, read: false },
      orderBy: { createdAt: 'desc' },
    });

    // // Tạo map để nhóm itemId theo itemType
    // const itemsByType = notifications.reduce((acc, notification) => {
    //   if (notification.itemType && notification.itemId) {
    //     if (!acc[notification.itemType]) {
    //       acc[notification.itemType] = [];
    //     }
    //     acc[notification.itemType].push(notification.itemId);
    //   }
    //   return acc;
    // }, {} as Record<NotificationItemType, number[]>);

    // // Truy vấn chi tiết cho từng loại
    // const items = await Promise.all(Object.entries(itemsByType).map(([itemType, itemIds]) => this.getNotificationDetailByType(itemType as NotificationItemType, itemIds)));
    // return items;

    return notifications;
  },

  // Mark a notification as read
  async markAsRead(notificationId$: number, userId$: number) {
    const notificationId = z.number().int().positive().parse(notificationId$);
    const userId = userSchema.shape[EUserField.id].parse(userId$);
    return await DB.notification.update({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId$: number) {
    const userId = userSchema.shape[EUserField.id].parse(userId$);
    return await DB.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

};
