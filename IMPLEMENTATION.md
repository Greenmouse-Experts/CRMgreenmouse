# Greenmouse CRM Implementation Tracker

Comprehensive tracking document for API integration, TanStack Router pages, and UI components based on [`docs/api`](./docs/api/).

---

## 📌 Architecture & Design Standards

| Layer | Standard | Details |
| :--- | :--- | :--- |
| **API Client** | [`src/api/simpleApi.ts`](./src/api/simpleApi.ts) | Base URL: `https://crmgrenmouse-backend-api.onrender.com/`. Interceptor attaches Bearer token. Auto-refreshes on 401 via `POST /auth/refresh`. |
| **Data Fetching** | TanStack Query v5 | All query hooks and mutations centralized in [`src/api/`](./src/api/) (`adminApi.ts`, `crmApi.ts`, `catalogApi.ts`, `financeApi.ts`, `salesApi.ts`, `supportApi.ts`). Zero hardcoded mock data. |
| **Page Loading** | [`PageLoader.tsx`](./src/components/layout/PageLoader.tsx) | Full page/section animated loading state with 403 Access Denied and error handling. |
| **Component Loading** | [`QueryCompLayout.tsx`](./src/components/layout/QueryCompLayout.tsx) | Widget-level loader for embedded charts and stats cards. |
| **Table Actions** | [`pop-up.tsx`](./src/components/tables/pop-up.tsx) | Passed via `actions: Actions<T>[]` prop to `CustomTable`. Renders portal-positioned dropdown menu. |
| **Table Search** | [`ContainerRow.tsx`](./src/components/ContainerRow.tsx) & [`Searchbar.tsx`](./src/components/Searchbar.tsx) | DaisyUI modernized search bar integrated seamlessly into container toolbars. |
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
| **Staff Members** | `/admin/users` | `GET /staffs`<br>`POST /staffs`<br>`GET /staffs/:id`<br>`PATCH /staffs/:id`<br>`DELETE /staffs/:id` | ✅ **DONE** | Live staff directory, summary metrics, add staff dialog modal with role picker, `pop-up` actions. |
| **Roles & Permissions** | `/admin/users/roles` | `GET /roles`<br>`POST /roles`<br>`GET /roles/:id`<br>`PATCH /roles/:id`<br>`DELETE /roles/:id` | ✅ **DONE** | Role creation with dynamic permission checkboxes from `GET /admin/permissions`, edit/delete actions. |
| **Customers** | `/admin/contacts/customers` | `GET /customers`<br>`POST /customers`<br>`GET /customers/:id`<br>`PATCH /customers/:id`<br>`DELETE /customers/:id` | ✅ **DONE** | Customer directory, live metrics, add customer modal, details modal, `pop-up` actions. |
| **Companies** | `/admin/contacts/companies` | `GET /companies`<br>`POST /companies`<br>`GET /companies/:id`<br>`PATCH /companies/:id`<br>`DELETE /companies/:id` | ✅ **DONE** | Company accounts directory, live metrics, create modal, details modal, `pop-up` actions. |
| **Products Catalog** | `/admin/products` | `GET /products`<br>`POST /products`<br>`PATCH /products/:id`<br>`DELETE /products/:id`<br>`PATCH /products/:id/stock` | ✅ **DONE** | Products listing, inventory metrics, stock adjustment modal, add/edit product modal, add page (`/products/add`). |
| **Services Catalog** | `/admin/products/service` | `GET /services`<br>`POST /services`<br>`PATCH /services/:id`<br>`DELETE /services/:id`<br>`PATCH /services/:id/toggle-active` | ✅ **DONE** | Services catalog, metrics, status toggle, add/edit modal, add page (`/products/service/add`). |
| **Categories** | `/admin/products/categories` | `GET /categories`<br>`POST /categories`<br>`PATCH /categories/:id`<br>`DELETE /categories/:id` | ✅ **DONE** | Product/Service category taxonomy, create/edit modals, `pop-up` actions. |
| **Invoices** | `/admin/accounts/invoices` | `GET /invoices`<br>`POST /invoices`<br>`GET /invoices/stats`<br>`GET /invoices/:id`<br>`PATCH /invoices/:id/send`<br>`PATCH /invoices/:id/mark-paid` | ✅ **DONE** | Invoices directory, live stats, details breakdown modal, mark paid/sent actions, add page (`/Invoices/add`). |
| **Income & Expenses** | `/admin/accounts/income-expenses` | `GET /income`<br>`POST /income`<br>`GET /expenses`<br>`POST /expenses` | ✅ **DONE** | Dual-tab ledger, live balance calculation, add income modal, add expense modal, edit & approve actions. |
| **Quotes** | `/admin/accounts/quotes` | `GET /quotes`<br>`POST /quotes`<br>`GET /quotes/stats`<br>`PATCH /quotes/:id/status` | ✅ **DONE** | Quotes and proposals directory, pipeline value stats, create/edit modals, accept/reject actions. |
| **Transactions** | `/admin/accounts/transactions` & `/admin/transactions` | `GET /transactions`<br>(aggregates Income & Expenses) | ✅ **DONE** | Financial movements ledger, inflow/outflow cards, details modal. |
| **Orders** | `/admin/orders` | `GET /orders`<br>`POST /orders`<br>`GET /orders/stats`<br>`PATCH /orders/:id/status` | ✅ **DONE** | Sales orders table, order metrics, create order modal with dynamic product picker, details modal. |
| **Support Tickets** | `/admin/support` | `GET /tickets`<br>`POST /tickets`<br>`GET /tickets/:id`<br>`POST /tickets/:id/messages` | 🟡 **IN PROGRESS** | API hooks completed (`src/api/supportApi.ts`). UI wiring next. |

---

## 📡 API Service Catalog ([`src/api/`](./src/api/))

| Service File | Domain | Endpoints Covered | Status |
| :--- | :--- | :--- | :---: |
| [`simpleApi.ts`](./src/api/simpleApi.ts) | Axios Instance | Base config, bearer auth interceptor, silent token refresh | ✅ Complete |
| [`adminApi.ts`](./src/api/adminApi.ts) | Platform Admin | Dashboard, Tenants, Subscriptions, Profile, Security, Permissions, Staffs, Roles | ✅ Complete |
| [`crmApi.ts`](./src/api/crmApi.ts) | CRM & Contacts | Customers, Companies, Categories | ✅ Complete |
| [`catalogApi.ts`](./src/api/catalogApi.ts) | Catalog | Products, Stock Adjustment, Services, Toggle Active | ✅ Complete |
| [`financeApi.ts`](./src/api/financeApi.ts) | Finance | Income records, Expenses, Invoices, Status updates, Transactions | ✅ Complete |
| [`salesApi.ts`](./src/api/salesApi.ts) | Sales | Quotes, Quote Stats, Orders, Order Stats | ✅ Complete |
| [`supportApi.ts`](./src/api/supportApi.ts) | Support | Tickets, Ticket Status, Staff Assignment, Message Threads | ✅ Complete |
| [`imageApi.ts`](./src/api/imageApi.ts) | Media | Cloudinary file upload (`/multimedia/upload`) | ✅ Existing |
| [`notifications-api.ts`](./src/api/notifications-api.ts) | Notifications | Notifications list, read status | ✅ Existing |

---

## 🎯 Next Recommended Steps

1. **Support Tickets UI (`/admin/support`)**: Wire the support tickets directory and message thread modal using `src/api/supportApi.ts`.
2. **Tenant Portal Pages (`/tenant/*`)**: Connect tenant dashboard, tenant contacts, tenant catalog, and tenant billing with the tenant API endpoints.
