import apiClient from "./simpleApi";

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
}

export interface NotificationPage {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
}

export const getNotifications = async (params: {
  page?: number;
  limit?: number;
} = {}): Promise<NotificationPage> => {
  const { data } = await apiClient.get("/notifications", {
    params: { page: params.page ?? 1, limit: params.limit ?? 20 },
  });
  const result = data?.data ?? data;
  const notifications = Array.isArray(result) ? result :
    Array.isArray(result?.notifications) ? result.notifications :
    Array.isArray(result?.data) ? result.data : [];
  const pagination = result?.pagination ?? data?.pagination;
  const total = Number(pagination?.total ?? result?.total ?? notifications.length);
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  return {
    notifications,
    total,
    hasMore: typeof pagination?.hasMore === "boolean" ? pagination.hasMore :
      pagination?.total !== undefined || result?.total !== undefined
        ? page * limit < total
        : notifications.length === limit,
  };
};

export const getUnreadNotifications = async (page = 1, limit = 20): Promise<NotificationPage> => {
  const unread: Notification[] = [];
  const seen = new Set<string>();
  let currentPage = 1;

  while (true) {
    const batch = await getNotifications({ page: currentPage, limit: 20 });
    let newItems = 0;
    for (const notification of batch.notifications) {
      if (seen.has(notification.id)) continue;
      seen.add(notification.id);
      newItems++;
      if (!notification.isRead) unread.push(notification);
    }
    if (!batch.hasMore || newItems === 0) break;
    currentPage++;
  }

  const start = (page - 1) * limit;
  return {
    notifications: unread.slice(start, start + limit),
    total: unread.length,
    hasMore: start + limit < unread.length,
  };
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await apiClient.patch(`/notifications/${encodeURIComponent(id)}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await apiClient.patch("/notifications/read-all");
};

export const getUnreadCount = async (): Promise<number> => {
  const { data } = await apiClient.get("/notifications/unread-count");
  const result = data?.data ?? data;
  return Number(typeof result === "number" ? result : result?.count ?? result?.unreadCount ?? 0);
};
