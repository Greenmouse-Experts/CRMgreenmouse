# Greenmouse CRM API Documentation

Comprehensive reference documentation for the Greenmouse CRM backend, generated directly from the authoritative Postman collection (`Greenmouse CRM API.postman_collection.json`) covering all **244** API endpoints across platform administration, tenant operations, and CRM modules.

---

## 📌 Architecture & Base URL

The API is organized under the `/v1` route namespace on the backend server:

| Environment | Base URL | Description |
| :--- | :--- | :--- |
| **Production API** | `https://crmgrenmouse-backend-api.onrender.com/` | Hosted Render deployment |
| **Vite Client Prefix** | `import.meta.env.VITE_API_URL` | Configured in `.env` / `.env.local` |

> **Route Prefix Note**: In this documentation, all routes are specified with the full `/v1/...` path matching the backend service definitions. If the client Axios instance (`src/api/simpleApi.ts`) specifies a `baseURL` that already ends in `/v1`, subsequent paths can omit the leading `/v1`.

---

## 🔐 Authentication Surfaces

Greenmouse CRM provides two distinct authentication surfaces:

1. **Platform Authentication** (`auth.md`, `staff-and-roles.md`):
   - Super Admin: `POST /v1/auth/admin/login`
   - Staff Members: `POST /v1/auth/staff/login`
   - Token refresh & logout: `POST /v1/auth/refresh`, `POST /v1/auth/logout`

2. **Tenant Business Accounts** (`tenant.md`):
   - Self-serve registration: `POST /v1/tenant/auth/register`
   - Email verification via OTP: `POST /v1/tenant/auth/verify-email`
   - Tenant Login: `POST /v1/tenant/auth/login`
   - Onboarding Wizard: `GET /v1/tenant/onboarding`, `PATCH /v1/tenant/onboarding`, `POST /v1/tenant/onboarding/complete`

All authenticated endpoints require an HTTP Bearer header:
```http
Authorization: Bearer <accessToken>
```

---

## 📦 API Modules Directory

| File | Module | Endpoints | Description |
| :--- | :--- | :---: | :--- |
| [`authentication.md`](./authentication.md) | **System & Platform Auth** | 7 | Root check, healthcheck, super admin & staff login, token refresh. |
| [`tenant.md`](./tenant.md) | **Tenant Portal & Auth** | 15 | Tenant registration, OTP verify, password reset, onboarding, login history. |
| [`admin.md`](./admin.md) | **Super Admin Platform** | 63 | Platform setup, tenant management, subscription plans, cross-tenant auditing. |
| [`staff-and-roles.md`](./staff-and-roles.md) | **Staff & RBAC Roles** | 12 | Workspace staff management and granular permission assignments. |
| [`crm.md`](./crm.md) | **Contacts & Companies** | 17 | Customer directory, business companies, contact notes, and CSV imports. |
| [`catalog.md`](./catalog.md) | **Catalog & Inventory** | 23 | Products, service catalog, item categories, and stock adjustments. |
| [`finance.md`](./finance.md) | **Finance & Invoicing** | 25 | Income, expense logging, invoice generation, branding, PDF/HTML renders. |
| [`sales.md`](./sales.md) | **Sales & Pipeline** | 41 | Leads, visual Kanban deals, pipelines, quotes, and customer orders. |
| [`subscriptions.md`](./subscriptions.md) | **Subscriptions & Billing** | 10 | Public plans, tenant upgrade/downgrade, Paystack payments & webhooks. |
| [`dashboard.md`](./dashboard.md) | **Tenant Dashboard** | 5 | Live stat cards, monthly cashflow, balances, and profit calculations. |
| [`reports.md`](./reports.md) | **Analytics Reports** | 6 | Pipeline funnel, win rates, average deal value, cycle times, revenue trends. |
| [`support.md`](./support.md) | **Support & Helpdesk** | 8 | Support tickets, staff assignment, priority status, reply threads. |
| [`notifications.md`](./notifications.md) | **Notifications** | 4 | In-app alerts, unread counters, mark-as-read updates. |
| [`media.md`](./media.md) | **Multimedia Upload** | 1 | Cloudinary file upload for logos, attachments, and avatars. |
| [`import.md`](./import.md) | **Import Engine (SSE)** | 5 | CSV schemas, templates, background import jobs, and SSE progress stream. |
| [`reminders.md`](./reminders.md) | **Reminders Preferences** | 2 | Tenant alert preferences, reminder timings, and channels. |

---

## ⚡ Global Conventions & Response Shapes

### 1. Standard Response Envelope
```json
{
  "message": "Operation successful",
  "data": { ... },
  "statusCode": 200,
  "path": "/v1/...",
  "pagination": {
    "total": 50,
    "limit": 10,
    "hasMore": true,
    "nextCursor": null
  }
}
```

### 2. Paginated Query Parameters
Most list endpoints support standard pagination and query filtering:
- `page` (number): 1-indexed page number
- `limit` (number): records per page (default: 10 or 20)
- `search` (string): search query term
- `status` (string): filter by lifecycle status

---
*Documentation synchronized from `Greenmouse CRM API.postman_collection.json`.*
