import {
  paginationOptions,
  paginationSchema,
  TPagination,
} from '@/common/models/pagination/pagination.model';
import { DB } from '@/database/database';
import { COMMENT_PUBLIC_FIELDS, ECommentField } from '@/post/validators/comment.schema';
import { EPostField, POST_PUBLIC_FIELDS } from '@/post/validators/post.schema';
import { NotificationType, NotificationItemType, Notification, Prisma } from '@prisma/client';
import notificationServer from '../notification.server';
import { PostService } from '@/post/services/post.service';
import { ENotificationEvent } from '../constants/notification-event.const';
import { TNewPostCommentNotification } from '../model/new-post-comment-notification.model';

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
    // Lấy ra những subscribers
    await PostService.getFollowersWithNotification(postId)
      .then(async ({ followerIds, ...post }) => {
        // Tạo notifications cho các subscribers
        const messageTitle = 'Bình luận mới';
        const messageContent = `${user.name} đã bình luận trong bài viết <b>${post.title}</b>: ${comment.content.substring(0, 60)}`
        this.createNotifications(followerIds, 'COMMENT', 'post', postId, messageTitle, messageContent);
        const notification = { messageTitle, messageContent, post }
        // Emit sự kiện
        notificationServer
          .to(followerIds.map((id) => `${id}`))
          .emit(ENotificationEvent.POST_NEW_COMMENT, notification);
      })
      .catch((err) => { });
  },

  // Find notifications for a user
  async findUserNotifications(userId: number, pagination$: TPagination) {
    const pagination = paginationSchema.parse(pagination$);
    const { skip, take } = paginationOptions(pagination);
    return await DB.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
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
  async markAsRead(notificationId: number) {
    return await DB.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  },

  // Mark all notifications as read for a user
  async markAllAsRead(userId: number) {
    return await DB.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },

  // Get notification detail based on itemType and itemId
  async getNotificationDetail(notification: Notification) {
    if (notification.itemType && notification.itemId) {
      const item = await (DB[notification.itemType] as TNotificationItem).findFirst({
        where: { id: notification.itemId },
        select: { id: true } /*mapFields[notification.itemType]*/,
      });
      return item;
    }
    return null;
  },

  async getNotificationDetailByType(itemType: NotificationItemType, itemIds: number[]) {
    const items = await (DB[itemType] as TNotificationItem).findMany({
      where: { id: { in: itemIds } },
      select: { id: true } /*mapFields[itemType]*/,
    });
    return items;
  },
};
