export interface NotificationPreferences {
  unreadOnly: boolean;
  pageSize: number;
}

const key = "tenant-notification-display";
export const defaultNotificationPreferences: NotificationPreferences = {
  unreadOnly: false,
  pageSize: 20,
};

export function getNotificationPreferences(): NotificationPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    return {
      unreadOnly: saved?.unreadOnly === true,
      pageSize: [10, 20, 50].includes(saved?.pageSize) ? saved.pageSize : 20,
    };
  } catch {
    return defaultNotificationPreferences;
  }
}

export function saveNotificationPreferences(value: NotificationPreferences) {
  localStorage.setItem(key, JSON.stringify(value));
}
