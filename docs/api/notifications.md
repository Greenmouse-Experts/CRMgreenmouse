# Notifications

The notification routes used by the frontend client. These endpoints are wired up in
the frontend client but are not part of the Postman collection. They are documented
here from `src/api/notifications-api.ts`. Paths are shown relative to the
[base URL](./README.md#base-url) and every route requires a bearer token.

### List notifications
`GET /notifications?limit=20&cursor=<token>`

List notifications for the current user (cursor-paginated).

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `limit` | integer | Number of notifications to return (defaults to `20`). |
  | `cursor` | string | Opaque cursor for the next page. Omit for the first page. |

**Responses**

- `200` — OK
  ```json
  {
    "data": {
      "notifications": [],
      "hasMore": true,
      "nextCursor": "string",
      "total": 0
    }
  }
  ```

  `data.notifications` is an array of [`Notification`](#notification-object) objects.
  `hasMore`, `nextCursor`, and `total` follow the cursor pagination convention
  described in the [house README](./README.md#pagination): pass the previous
  `nextCursor` as `cursor` to fetch the next page.

### Mark one notification as read
`PATCH /notifications/:id/read`

Mark a single notification as read.

- **Auth:** Bearer
- **Path params:** `id` — string

**Responses**

- `200` — OK

  The frontend client does not consume a response body here
  (`markNotificationRead` returns `void`).

### Mark all notifications as read
`PATCH /notifications/read-all`

Mark every notification for the current user as read.

- **Auth:** Bearer

**Responses**

- `200` — OK

  The frontend client does not consume a response body here
  (`markAllNotificationsRead` returns `void`).

### Unread notification count
`GET /notifications/unread-count`

Return the number of unread notifications.

- **Auth:** Bearer

**Responses**

- `200` — OK
  ```json
  {
    "data": {
      "count": 0
    }
  }
  ```

## Notification object

```ts
interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
}
```
