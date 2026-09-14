# Greenmouse CRM Implementation Tracker

Comprehensive tracking document for API integration, TanStack Router pages, and UI components based on [`docs/api`](./docs/api/).

---

## 📌 Architecture & Design Standards

| Layer | Standard | Details |
| :--- | :--- | :--- |
| **API Client** | [`src/api/simpleApi.ts`](./src/api/simpleApi.ts) | Base URL: `https://crmgrenmouse-backend-api.onrender.com/`. Interceptor attaches Bearer token. Auto-refreshes on 401 via `POST /auth/refresh`. |
| **Data Fetching** | TanStack Query v5 | All query hooks and mutations centralized in [`src/api/`](./src/api/) (e.g. `adminApi.ts`). Zero hardcoded data. |
| **Page Loading** | [`PageLoader.tsx`](./src/components/layout/PageLoader.tsx) | Full page/section animated loading state with 403 Access Denied and error handling. |
| **Component Loading** | [`QueryCompLayout.tsx`](./src/components/layout/QueryCompLayout.tsx) | Widget-level loader for embedded charts and stats cards. |
| **Table Actions** | [`pop-up.tsx`](./src/components/tables/pop-up.tsx) | Passed via `actions: Actions<T>[]` prop to `CustomTable`. Renders portal-positioned dropdown menu. |
| **Modals** | [`DialogModal.tsx`](./src/components/DialogModal.tsx) | Accessible `<dialog>` with backdrop, imperative `open()` / `close()`, header close button, and unmount on close. |
| **Styling** | Tailwind CSS 4 + DaisyUI 5 | Primary color `#007047`. Glassmorphism and responsive drawer navigation. |

---

## 🚀 Module Implementation Status

### 1. Platform Super Admin (`/admin`)

| Feature / Page | Route | API Endpoints | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Admin Dashboard** | `/admin` | `GET /dashboard/stats`<br>`GET /dashboard/balance`<br>`GET /dashboard/income-expense`<br>`GET /admin/tenants/stats`<br>`GET /admin/tenants` | ✅ **DONE** | Live stats cards, dynamic year income/expense chart, monthly balance breakdown, recent tenants table. |
| **Tenants Management** | `/admin/tenants` | `GET /admin/tenants`<br>`GET /admin/tenants/stats`<br>`GET /admin/tenants/:id`<br>`PATCH /admin/tenants/:id/status`<br>`PATCH /admin/tenants/:id/subscription` | ✅ **DONE** | Overview stats (Total, Active, Trial, Suspended, Verified), search & status filters, `PageLoader`, `pop-up` row actions, details & assign plan modals. |
| **Subscription Plans** | `/admin/subscription` | `GET /admin/subscriptions`<br>`POST /admin/subscriptions`<br>`PATCH /admin/subscriptions/:id`<br>`DELETE /admin/subscriptions/:id` | ✅ **DONE** | Table connected to live plans, `pop-up` actions (Edit, Delete), Create/Edit modal with full resource limits. |
| **Admin Profile** | `/admin/settings/profile` | `GET /admin/profile`<br>`PATCH /admin/profile` | ✅ **DONE** | Live profile header, editable contact/organization details form with save mutation. |
| **Admin Security** | `/admin/settings/security` | `PATCH /admin/change-password`<br>`GET /admin/permissions` | ✅ **DONE** | Password change form with validation, full platform permissions catalog directory. |
| **Staff Members** | `/admin/users` | `GET /staffs`<br>`POST /staffs`<br>`GET /staffs/:id`<br>`PATCH /staffs/:id`<br>`DELETE /staffs/:id` | 🟡 **IN PROGRESS** | Main directory page connected to live `useStaffs()` with `PageLoader` & `pop-up`. Add staff modal & details view pending. |
| **Roles & Permissions** | `/admin/users/roles` | `GET /roles`<br>`POST /roles`<br>`GET /roles/:id`<br>`PATCH /roles/:id`<br>`DELETE /roles/:id` | ⚪ **TODO** | Role creation with permission checkboxes from `GET /admin/permissions`. |
| **Customers** | `/admin/contacts/customers` | `GET /customers`<br>`POST /customers`<br>`GET /customers/:id`<br>`PATCH /customers/:id`<br>`DELETE /customers/:id` | ⚪ **TODO** | Customer directory and contact details drawer. |
| **Companies** | `/admin/contacts/companies` | `GET /companies`<br>`POST /companies`<br>`GET /companies/:id`<br>`PATCH /companies/:id`<br>`DELETE /companies/:id` | ⚪ **TODO** | Company accounts table and details. |
| **Products Catalog** | `/admin/products` | `GET /products`<br>`POST /products`<br>`PATCH /products/:id`<br>`DELETE /products/:id` | ⚪ **TODO** | Products listing, stock tracking, price management. |
| **Services Catalog** | `/admin/products/service` | `GET /services`<br>`POST /services`<br>`PATCH /services/:id`<br>`DELETE /services/:id` | ⚪ **TODO** | Services catalog with billing frequency. |
| **Categories** | `/admin/products/categories` | `GET /categories`<br>`POST /categories`<br>`PATCH /categories/:id`<br>`DELETE /categories/:id` | ⚪ **TODO** | Product/Service category taxonomies. |
| **Invoices** | `/admin/accounts/invoices` | `GET /invoices`<br>`POST /invoices`<br>`GET /invoices/:id`<br>`PATCH /invoices/:id` | ⚪ **TODO** | Invoice creation, line items, payment status tracking. |
| **Income & Expenses** | `/admin/accounts/income-expenses` | `GET /income-expenses`<br>`POST /income-expenses`<br>`PATCH /income-expenses/:id` | ⚪ **TODO** | Record income/expense entries with category tagging. |
| **Quotes** | `/admin/accounts/quotes` | `GET /quotes`<br>`POST /quotes`<br>`PATCH /quotes/:id` | ⚪ **TODO** | Price quote estimation and conversion to invoice. |
| **Financial Analysis** | `/admin/accounts/analysis` | `GET /dashboard/profit`<br>`GET /dashboard/user-analytics` | ⚪ **TODO** | Annual profit charts and resource distribution analytics. |
| **Transactions** | `/admin/accounts/transactions` | `GET /transactions` | ⚪ **TODO** | Payment and transaction logs. |
| **Orders** | `/admin/orders` | `GET /orders`<br>`POST /orders`<br>`PATCH /orders/:id` | ⚪ **TODO** | Order fulfillment workflow. |
| **Support Tickets** | `/admin/support` | `GET /tickets`<br>`POST /tickets`<br>`GET /tickets/:id`<br>`POST /tickets/:id/messages` | ⚪ **TODO** | Ticket listing, status updates, message threads. |

---

### 2. Tenant Portal (`/tenant`)

| Feature / Page | Route | API Endpoints | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Tenant Dashboard** | `/tenant` | `GET /dashboard/stats`<br>`GET /dashboard/balance`<br>`GET /dashboard/income-expense` | ⚪ **TODO** | Needs to be wired with tenant-scoped data queries. |
| **Tenant Contacts** | `/tenant/contacts/*` | `GET /customers`, `GET /companies` | ⚪ **TODO** | Tenant customer base. |
| **Tenant Catalog** | `/tenant/products/*` | `GET /products`, `GET /services`, `GET /categories` | ⚪ **TODO** | Tenant product/service catalog. |
| **Tenant Billing & Subscription** | `/tenant/subscription` | `GET /tenant/subscription`<br>`POST /tenant/subscription/initialize` | ⚪ **TODO** | Tenant plan status, billing history, Paystack checkout. |
| **Tenant Settings** | `/tenant/settings` | `GET /tenant/profile`, `PATCH /tenant/profile` | ⚪ **TODO** | Business profile, company logo, tax settings. |

---

### 3. Authentication & System (`/auth`)

| Surface | Route | API Endpoints | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Super Admin Login** | `/auth/admin` | `POST /auth/admin/login` | 🟡 **IN PROGRESS** | Login form exists; clean up types and wire directly to `authStore`. |
| **Staff Login** | `/auth/staff` | `POST /auth/staff/login` | ⚪ **TODO** | Staff member authentication. |
| **Tenant Login** | `/home/auth/login` | `POST /tenant/auth/login` | ⚪ **TODO** | Business tenant login. |
| **Tenant Registration & Onboarding** | `/auth/register` | `POST /tenant/register`<br>`POST /tenant/onboarding` | ⚪ **TODO** | Multi-step company setup wizard. |
| **Password Reset** | `/auth/forgot-password` | `POST /auth/forgot-password`<br>`POST /auth/reset-password` | ⚪ **TODO** | Email OTP reset flow. |
| **Token Refresh** | Background | `POST /auth/refresh`<br>`POST /tenant/auth/refresh` | ✅ **DONE** | Integrated into `simpleApi.ts` Axios response interceptor for automatic transparent retry. |

---

## 📡 API Service Catalog ([`src/api/`](./src/api/))

| Service File | Domain | Endpoints Covered | Status |
| :--- | :--- | :--- | :---: |
| [`simpleApi.ts`](./src/api/simpleApi.ts) | Axios Instance | Base config, bearer auth interceptor, silent token refresh | ✅ Complete |
| [`adminApi.ts`](./src/api/adminApi.ts) | Platform Admin | Dashboard, Tenants, Subscriptions, Profile, Security, Permissions, Staffs, Roles | ✅ Complete |
| `crmApi.ts` | CRM | Customers, Companies | ⚪ Next |
| `catalogApi.ts` | Catalog | Products, Services, Categories | ⚪ Next |
| `financeApi.ts` | Finance | Invoices, Income/Expenses, Quotes, Transactions | ⚪ Next |
| `salesApi.ts` | Sales | Orders, Fulfillment | ⚪ Next |
| `supportApi.ts` | Support | Tickets, Thread Messages | ⚪ Next |
| `tenantApi.ts` | Tenant Portal | Tenant Onboarding, Subscription checkout, Tenant Profile | ⚪ Next |
| [`imageApi.ts`](./src/api/imageApi.ts) | Media | Cloudinary file upload (`/multimedia/upload`) | ✅ Existing |
| [`notifications-api.ts`](./src/api/notifications-api.ts) | Notifications | Notifications list, read status | ✅ Existing |

---

## 🎯 Next Recommended Steps

1. **CRM Service (`src/api/crmApi.ts`)**: Implement `useCustomers()` and `useCompanies()` and connect `/admin/contacts/customers` and `/admin/contacts/companies` using `CustomTable`, `PageLoader`, `pop-up.tsx`, and `DialogModal.tsx`.
2. **Catalog Service (`src/api/catalogApi.ts`)**: Implement `useProducts()`, `useServices()`, and `useCategories()` and connect `/admin/products`.
3. **Finance Service (`src/api/financeApi.ts`)**: Implement `useInvoices()` and `useIncomeExpenses()` and connect `/admin/accounts/invoices` and `/admin/accounts/income-expenses`.
4. **Staff Roles Page (`/admin/users/roles`)**: Connect role creation with permission picker matrix using `useAdminPermissions()`.
