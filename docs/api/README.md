# Greenmouse CRM API

Reference documentation for the Greenmouse CRM backend, derived from
`Greenmouse CRM API.postman_collection.json` and the frontend API client in
`src/api/`.

The API is a multi-tenant SaaS backend for a CRM. It exposes two authentication
surfaces — one for the platform (super admin + staff) and one for businesses
(tenants) — plus shared resource routes for contacts, products, orders,
invoices, subscriptions, and analytics.

## Contents

| File | Covers |
| --- | --- |
| [`authentication.md`](./authentication.md) | System routes and platform auth (`/`, `/healthcheck`, `/auth/*`) |
| [`admin.md`](./admin.md) | Super admin setup, profile, permissions, plans, and tenant management (`/admin/*`) |
| [`staff-and-roles.md`](./staff-and-roles.md) | Staff members and role/permission management (`/staffs`, `/roles`) |
| [`media.md`](./media.md) | File/image upload to Cloudinary (`/multimedia/*`) |
| [`crm.md`](./crm.md) | Companies, contacts, and categories |
| [`finance.md`](./finance.md) | Income, expenses, and invoices |
| [`catalog.md`](./catalog.md) | Products and services |
| [`sales.md`](./sales.md) | Orders and quotes |
| [`support.md`](./support.md) | Support tickets and message threads (`/tickets`) |
| [`dashboard.md`](./dashboard.md) | Dashboard stat cards and chart data (`/dashboard/*`) |
| [`subscriptions.md`](./subscriptions.md) | Public plans, tenant subscription/billing, Paystack webhook |
| [`tenant.md`](./tenant.md) | Tenant onboarding, auth, and login activity (`/tenant/*`) |
| [`notifications.md`](./notifications.md) | Notifications endpoints used by the frontend client |

> The notification routes are not present in the Postman collection. They are
> documented separately from `src/api/notifications-api.ts`.

## Base URL

Requests are made against a single configurable base URL.

| Source | Value |
| --- | --- |
| `src/api/simpleApi.ts` (active client) | `import.meta.env.VITE_API_URL ?? "https://agbajo-backend.onrender.com/"` |
| `src/client/api.ts` (legacy client) | `https://crmgrenmouse-backend-api.onrender.com/` |

Set `VITE_API_URL` in `.env` / `.env.local` to point the frontend at your
environment. When the variable is unset, the active client falls back to the
Render deployment above.

All routes below are shown relative to that base URL using a `{{baseUrl}}`
placeholder, matching the collection.

## Client setup

The application talks to the API through a single Axios instance.

```ts
// src/api/simpleApi.ts
import apiClient from "@/api/simpleApi";

const { data } = await apiClient.get("/contacts");
```

Key behaviour of the active client (`src/api/simpleApi.ts`):

- `withCredentials: true` is enabled, so cookies are sent with requests.
- A request interceptor reads the stored user from the Jotai `user_atom`
  (`localStorage["user"]`) and attaches
  `Authorization: Bearer <accessToken>` to every request when a token exists.
- A response interceptor reacts to `401` responses by showing a
  "Session expired" toast and redirecting to `/home/auth/login`.
- The active client does **not** perform automatic token refresh. Call
  `POST /auth/refresh` (or `POST /tenant/auth/refresh`) yourself when the access
  token expires.
- `test_route(route)` is a small TanStack Query helper for ad-hoc GETs.

The legacy client (`src/client/api.ts`) additionally performs a transparent
refresh through `POST /auth/refresh` on `401` responses. Prefer the active
client for new code.

## Authentication

Two bearer-token surfaces exist:

| Surface | Login route | Token audience |
| --- | --- | --- |
| Platform (super admin / staff) | `POST /auth/admin/login`, `POST /auth/staff/login` | Platform users |
| Tenant (business owner) | `POST /tenant/auth/login` | Business accounts |

Both return `accessToken` / `refreshToken` pairs. Send the access token as:

```http
Authorization: Bearer <accessToken>
```

The token is stored on the frontend as part of the `user` object
(`accessToken`, `refreshToken`, `user`). See `src/store/authStore.ts`.

### Public routes

The following routes are used before authentication. Treat every other route as
requiring a bearer token, even when the collection does not set auth explicitly.

- `GET /`
- `GET /healthcheck`
- `POST /auth/admin/login`
- `POST /auth/staff/login`
- `POST /auth/refresh`
- `POST /admin/setup`
- `POST /tenant/auth/register`
- `POST /tenant/auth/verify-email`
- `POST /tenant/auth/resend-otp`
- `PATCH /tenant/auth/change-email`
- `POST /tenant/auth/login`
- `POST /tenant/auth/refresh`
- `POST /tenant/auth/forgot-password`
- `POST /tenant/auth/reset-password`
- `GET /subscriptions`
- `GET /subscriptions/:id`
- `POST /webhook/paystack`

The collection marks `bearer` auth explicitly on the tenant-scoped routes under
`/tenant/*`.

## Response envelopes

The frontend types responses with two envelopes. Exact shapes vary per endpoint;
treat the fields below as the common contract rather than a guarantee.

### Standard envelope

```ts
// src/api/simpleApi.ts
interface ApiResponse<T = any> {
  message: string;
  data: T;
  statusCode: number;
  path: string;
  pagination: Pagination;
}

interface Pagination {
  hasMore: boolean;
  limit: number;
  nextCursor: string | null;
  total: number;
}
```

`pagination` is populated on list endpoints that return a bare collection in
`data`.

### Nested envelope (v2)

```ts
interface ApiResponseV2<T = any> {
  message?: string;
  data: { data: T; pagination: Pagination } & { [key: string]: any };
  status: number;
  path: string;
}
```

### Type declarations

`types/api.d.ts` also declares global helpers used by older code:

```ts
interface APIRESPONSE<T = any> {
  data: T;
  message: string;
}

interface APIRESPONSEV2<T = any> {
  data: { data: T; message: string };
  meta: Record<string, any>;
}
```

Some endpoints (for example the subscription plan listing) return a plain
paginated object with `data`, `page`, `limit`, `total`, `totalPages`,
`hasNextPage`, and `hasPrevPage`. Where the collection provides an example
body, it is reproduced verbatim in the relevant file.

## Pagination

Two conventions are in use. Check the individual endpoint, since the same
resource can differ between routes.

- **Page/limit** — `?page=1&limit=10`. The subscription plan lists return
  `{ data, page, limit, total, totalPages, hasNextPage, hasPrevPage }`.
- **Cursor** — `?limit=20&cursor=<token>`. The notification endpoint returns a
  `Pagination` object with `hasMore` and `nextCursor`; to fetch the next page,
  pass the previous `nextCursor` as `cursor`.

## Errors

The collection defines the following error responses explicitly:

| Status | Meaning | Example route |
| --- | --- | --- |
| `400` | Invalid input, OTP, or reset code | `POST /tenant/auth/verify-email` |
| `401` | Invalid credentials or expired token/refresh token | `POST /tenant/auth/login`, `POST /tenant/auth/refresh` |
| `409` | Email already registered / already in use | `POST /tenant/auth/register`, `PATCH /tenant/auth/change-email` |

The active client globally handles `401` by clearing the session UI and
redirecting to the login route.

## Endpoint index

### System and platform auth — [`authentication.md`](./authentication.md)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | App root |
| `GET` | `/healthcheck` | Health check |
| `POST` | `/auth/admin/login` | Super admin login |
| `POST` | `/auth/staff/login` | Staff login |
| `POST` | `/auth/refresh` | Refresh access token |
| `POST` | `/auth/logout` | Logout current user |
| `GET` | `/auth/me` | Get current authenticated user |

### Super admin — [`admin.md`](./admin.md)

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/admin/setup` | Create the super admin account (one-time setup) |
| `GET` | `/admin/profile` | Get admin profile |
| `PATCH` | `/admin/profile` | Update admin profile |
| `PATCH` | `/admin/change-password` | Change admin account password |
| `GET` | `/admin/permissions` | List available permissions with descriptions |
| `GET` | `/admin/subscriptions` | List all subscription plans (includes inactive) |
| `POST` | `/admin/subscriptions` | Create a subscription plan |
| `GET` | `/admin/subscriptions/:id` | Get a subscription plan |
| `PATCH` | `/admin/subscriptions/:id` | Update a subscription plan |
| `DELETE` | `/admin/subscriptions/:id` | Delete a subscription plan |
| `GET` | `/admin/tenants` | List all tenants |
| `GET` | `/admin/tenants/stats` | Tenant statistics |
| `GET` | `/admin/tenants/:id` | Get a single tenant |
| `PATCH` | `/admin/tenants/:id/status` | Activate or suspend a tenant |
| `PATCH` | `/admin/tenants/:id/subscription` | Assign or upgrade a tenant plan |

### Staff and roles — [`staff-and-roles.md`](./staff-and-roles.md)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/staffs` | Get all staff members |
| `POST` | `/staffs` | Create a staff member |
| `GET` | `/staffs/:id` | Get a staff member |
| `PATCH` | `/staffs/:id` | Update a staff member |
| `DELETE` | `/staffs/:id` | Delete a staff member |
| `GET` | `/roles` | Get all roles |
| `POST` | `/roles` | Create a role |
| `GET` | `/roles/:id` | Get a role |
| `PATCH` | `/roles/:id` | Update a role |
| `DELETE` | `/roles/:id` | Delete a role |
| `PATCH` | `/roles/:id/permissions` | Assign permissions to a role |

### Media — [`media.md`](./media.md)

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/multimedia/upload` | Upload a file (image, video, or PDF) to Cloudinary |

### CRM — [`crm.md`](./crm.md)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/companies` | Get all companies |
| `POST` | `/companies` | Create a company |
| `GET` | `/companies/:id` | Get a company |
| `PATCH` | `/companies/:id` | Update a company |
| `DELETE` | `/companies/:id` | Delete a company |
| `GET` | `/contacts` | List all contacts |
| `POST` | `/contacts` | Create a contact |
| `GET` | `/contacts/:id` | Get a contact |
| `PATCH` | `/contacts/:id` | Update a contact |
| `DELETE` | `/contacts/:id` | Delete a contact |
| `POST` | `/contacts/:id/notes` | Add a note to a contact |
| `GET` | `/categories` | Get all categories |
| `POST` | `/categories` | Create a category |
| `GET` | `/categories/:id` | Get a category |
| `PATCH` | `/categories/:id` | Update a category |
| `DELETE` | `/categories/:id` | Delete a category |

### Finance — [`finance.md`](./finance.md)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/income` | Get all income records |
| `POST` | `/income` | Create an income record |
| `GET` | `/income/:id` | Get an income record |
| `PATCH` | `/income/:id` | Update an income record |
| `DELETE` | `/income/:id` | Delete an income record |
| `PATCH` | `/income/:id/status` | Update income status |
| `GET` | `/expenses` | Get all expense records |
| `POST` | `/expenses` | Create an expense record |
| `GET` | `/expenses/:id` | Get an expense record |
| `PATCH` | `/expenses/:id` | Update an expense record |
| `DELETE` | `/expenses/:id` | Delete an expense record |
| `PATCH` | `/expenses/:id/status` | Update expense status |
| `GET` | `/invoices` | List all invoices |
| `POST` | `/invoices` | Create an invoice |
| `GET` | `/invoices/stats` | Invoice statistics by status |
| `GET` | `/invoices/:id` | Get an invoice |
| `PATCH` | `/invoices/:id` | Update a draft invoice |
| `DELETE` | `/invoices/:id` | Delete an invoice |
| `PATCH` | `/invoices/:id/status` | Update invoice status |
| `PATCH` | `/invoices/:id/send` | Mark invoice as sent |
| `PATCH` | `/invoices/:id/mark-paid` | Mark invoice as paid |

### Catalog — [`catalog.md`](./catalog.md)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/products` | List products |
| `POST` | `/products` | Create a product or service |
| `GET` | `/products/:id` | Get a product |
| `PATCH` | `/products/:id` | Update a product |
| `DELETE` | `/products/:id` | Delete a product |
| `PATCH` | `/products/:id/stock` | Adjust stock quantity |
| `GET` | `/services` | Get all services |
| `POST` | `/services` | Create a service |
| `GET` | `/services/:id` | Get a service |
| `PATCH` | `/services/:id` | Update a service |
| `DELETE` | `/services/:id` | Delete a service |
| `PATCH` | `/services/:id/toggle-active` | Toggle service active status |

### Sales — [`sales.md`](./sales.md)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/orders` | List all orders |
| `POST` | `/orders` | Create an order |
| `GET` | `/orders/stats` | Order statistics by status |
| `GET` | `/orders/:id` | Get an order with full item details |
| `PATCH` | `/orders/:id` | Update an order |
| `DELETE` | `/orders/:id` | Cancel / delete an order |
| `PATCH` | `/orders/:id/status` | Update order status |
| `GET` | `/quotes` | List all quotes |
| `POST` | `/quotes` | Create a quote |
| `GET` | `/quotes/stats` | Quote statistics by status |
| `GET` | `/quotes/:id` | Get a quote |
| `PATCH` | `/quotes/:id` | Update a quote |
| `DELETE` | `/quotes/:id` | Delete a quote |
| `PATCH` | `/quotes/:id/status` | Update quote status |

### Support — [`support.md`](./support.md)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/tickets` | List all tickets |
| `POST` | `/tickets` | Create a support ticket |
| `GET` | `/tickets/:id` | Get ticket detail with message thread |
| `PATCH` | `/tickets/:id` | Update ticket subject, description, or priority |
| `DELETE` | `/tickets/:id` | Delete a ticket |
| `PATCH` | `/tickets/:id/status` | Change ticket status |
| `PATCH` | `/tickets/:id/assign` | Assign ticket to a staff member |
| `POST` | `/tickets/:id/messages` | Reply to a ticket thread |

### Dashboard — [`dashboard.md`](./dashboard.md)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/dashboard/stats` | Stat cards |
| `GET` | `/dashboard/income-expense` | Monthly income vs expense |
| `GET` | `/dashboard/balance` | Balance summary |
| `GET` | `/dashboard/profit` | Monthly profit |
| `GET` | `/dashboard/user-analytics` | User analytics donut |

### Subscriptions and billing — [`subscriptions.md`](./subscriptions.md)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/subscriptions` | Browse active plans (public) |
| `GET` | `/subscriptions/:id` | Get a plan (public) |
| `GET` | `/tenant/subscription/current` | Current subscription and plan |
| `GET` | `/tenant/subscription/plans` | Available plans |
| `GET` | `/tenant/subscription/history` | Subscription change history |
| `POST` | `/tenant/subscription/upgrade` | Initiate upgrade (Paystack) |
| `POST` | `/webhook/paystack` | Paystack webhook |

### Tenant — [`tenant.md`](./tenant.md)

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/tenant/auth/register` | Register a business account |
| `POST` | `/tenant/auth/verify-email` | Verify email with OTP |
| `POST` | `/tenant/auth/resend-otp` | Resend verification OTP |
| `PATCH` | `/tenant/auth/change-email` | Change email before verification |
| `POST` | `/tenant/auth/login` | Business owner login |
| `POST` | `/tenant/auth/refresh` | Refresh access token |
| `POST` | `/tenant/auth/forgot-password` | Request password reset OTP |
| `POST` | `/tenant/auth/reset-password` | Reset password using OTP |
| `POST` | `/tenant/auth/logout` | Logout current tenant |
| `GET` | `/tenant/auth/me` | Get current tenant profile |
| `GET` | `/tenant/onboarding` | Get onboarding status and data |
| `PATCH` | `/tenant/onboarding` | Save onboarding step data |
| `POST` | `/tenant/onboarding/complete` | Mark onboarding complete |
| `GET` | `/tenant/login-activity` | Recent login activities |
| `GET` | `/tenant/login-activity/latest` | Latest login activity |

### Notifications — [`notifications.md`](./notifications.md)

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/notifications` | List notifications (cursor-paginated) |
| `PATCH` | `/notifications/:id/read` | Mark one notification as read |
| `PATCH` | `/notifications/read-all` | Mark all notifications as read |
| `GET` | `/notifications/unread-count` | Unread notification count |
