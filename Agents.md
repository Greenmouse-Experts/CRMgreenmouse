# CRMgreenmouse - Agent Instructions

## Project Overview

CRM SaaS platform (CRMgreenmouse) built with React 19 + Vite. Handles customer management, onboarding, invoicing, business analytics for tenants, and an extensive Human Resources (HR) management suite (staffs, recruitment, onboarding, organization, attendance, leave, performance, payroll).

## Tech Stack

- **Framework:** React 19 (Vite)
- **Routing:** TanStack Router (file-based, `src/routes`)
- **Server State:** TanStack Query (`useQuery`, `useMutation`)
- **Client State:** Jotai (auth, profile), Zustand (onboarding wizard)
- **Styling:** Tailwind CSS 4 + DaisyUI 5
- **Icons:** Lucide React (always `lucide-react`, standard size `size-5` / `20px` or `size-4` / `16px` for small buttons)
- **Types:** TypeScript (`strict: true`)
- **Package Manager:** Bun

## Project Structure

```
src/
  client/          # Axios instance + ApiResponse type (api.ts)
  components/      # Shared UI (buttons/, inputs/, modals/, tables/, Headers/)
  helpers/         # Auth hooks (useLogout), image helpers
  routes/          # File-based routes
    __root.tsx     # Root layout (QueryClientProvider, Toaster)
    index.tsx      # Redirects / → /home
    home/          # Landing page + HomeNav component
    auth/
      login/       # Login page with onboarding/profile check
      register/    # Registration page
      verify/      # OTP Email verification page
      on-boarding/ # 9-step onboarding wizard
      forgot-password/ # Password reset request page
        new-password/  # OTP and new password submission page
    tenant/        # Protected dashboard (contacts, accounts, orders, products, users, settings)
    hr/            # HR module (staffs, recruitment, onboarding, organization, attendance, leave, performance, payroll)
  store/
    authStore.ts   # Jotai atoms for User (accessToken, refreshToken) and Profile
    onboarding-store.ts  # Zustand store for wizard state
  stores/          # data.ts (useSearch), client.ts
```

## Key Conventions

### Routing

- Route files: `src/routes/<path>/index.tsx` or `route.tsx` for layouts
- Private route components go in a `-components/` subdirectory colocated with the route
- Use `createFileRoute` from `@tanstack/react-router`
- After login, users are checked via `/tenant/auth/me` and redirected to `/auth/register/on-boarding` if `isOnboarded` is false.
- For active navigation state, use TanStack Router `useLocation({ select: (l) => l.pathname })` or `<Link>` active props. Highlight active links with `text-primary font-semibold`.

### API

- Import: `import apiClient from "@/client/api"`
- Type: `import type { ApiResponse } from "@/client/api"`
- Backend base URL: `https://crmgrenmouse-backend-api.onrender.com/`
- Auth tokens stored in Jotai atom as `accessToken` / `refreshToken` (camelCase)

### Styling

- Primary color: `#007047` (`--color-primary`)
- DaisyUI component classes (`btn`, `btn-primary`, `input`, `select`, `modal`, etc.)
- Glassmorphism + modern green aesthetic
- Rounded cards with `rounded-xl` / `rounded-2xl`
- Badges with soft backgrounds, e.g. `bg-emerald-50 text-emerald-700 border border-emerald-200`

### TypeScript

- `strict: true` in tsconfig
- Unused vars: prefix with `_` (e.g. `_item`) or remove entirely
- Never use `@/api/apiClient` — correct path is `@/client/api`

---

## Rules for Creating Pages & Components

### 1. Modular Architecture (Strict Colocation)

- **Never bundle entire pages into a single giant file.**
- The main page file (`index.tsx`) must serve as an orchestrator coordinating subcomponents, top-level state, and modal open/close controls.
- Create all feature-specific helper subcomponents, mock data, and types inside a `-components/` subdirectory:
  - `-components/types.ts` — TypeScript interfaces, enums, status union types, and form payloads.
  - `-components/<feature>Data.ts` — Mock datasets, initial constants, dropdown option arrays, and configuration steps.
  - `-components/<Feature>Stats.tsx` — Top KPI metric cards row using `<StatCard />`.
  - `-components/<Feature>Table.tsx` / `<Feature>List.tsx` — Data tables, lists, search filters, and status tab filtering.
  - `-components/<Action>Modal.tsx` — Creation, assignment, or detail inspection modal dialogs.

### 2. Modals Standard (`DialogModal`)

- Use the shared modal component: `import Modal, { type ModalHandle } from "@/components/DialogModal"`.
- Control modals via `useRef<ModalHandle>(null)` and trigger `modalRef.current?.open()` / `close()` inside a `useEffect` keyed to `isOpen`.
- **Always use `DialogModal` props instead of nesting redundant containers:**
  - Pass `title="..."` directly to `<Modal>` to use the standardized header and close (`X`) icon.
  - Pass `maxWidth="max-w-xl"` / `maxWidth="max-w-2xl"` to avoid awkward empty horizontal whitespace.
  - Pass `onClose={onClose}` to handle clicks on the backdrop, `ESC` key, or close button properly.
  - **Do NOT** wrap modal contents in another bordered card (`w-full max-w-lg bg-base-100 rounded-2xl shadow-xl border border-base-200`). The modal dialog wrapper already provides the surface, backdrop, and border.
  - Form contents should fill 100% width (`space-y-4`) with an action footer aligned to the right:
    ```tsx
    <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
      <button
        type="button"
        onClick={onClose}
        className="btn btn-sm btn-ghost rounded-xl"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5"
      >
        Save
      </button>
    </div>
    ```

### 3. Page Layouts & Headers

- Start every sub-module page with `<PageHeader title="..." description="...">`.
- Place primary actions (e.g., `New Request`, `Clock in`, `Assign Goal`, `Create Vacancy`, `Add Department`) inside `PageHeader`'s children slot (`md:ml-auto`).
- Place summary/metric cards directly below `PageHeader` in a 2-to-4 column responsive grid (`grid grid-cols-2 md:grid-cols-4 gap-4`).
- Main interactive content should follow: responsive tables, tabbed lists, or 2-column side-by-side grids on `lg` screens (`grid grid-cols-1 lg:grid-cols-2 gap-6`).

### 4. Interactive Feedback & State Management

- Add user feedback on actions using `toast` from `sonner` (`toast.success`, `toast.error`, `toast.info`).
- Provide live table search inputs and status-filtering tab bars (`All`, `Pending`, `Approved`, `Rejected`, etc.).
- Allow approving/rejecting or advancing stages in-place with instant local state updates.

---

## Shared Components Reference

- `PageHeader` — `title` + `description` + children slot (right side action buttons).
- `StatCard` — KPI card with `title`, `value`, `desc`, `icon`, and `variant` (`"primary" | "success" | "warning" | "error" | "info"`).
- `CustomTable` — Generic table with `columnType[]` configuration.
- `SimpleInput` — Standard controlled text input (`value`, `onChange`, `placeholder`, `required`).
- `LocalSelect` — Standard styled dropdown select component.
- `DialogModal` — `forwardRef` modal accepting `title`, `maxWidth`, `onClose`, `actions`, and `children`.
- `HomeNav` — Sticky navigation with active route highlighting using `text-primary font-semibold`.

## Onboarding Wizard (`/auth/register/on-boarding/`)

9-step wizard stored in `useOnboardingStore` (Zustand + persist):

1. Industry (icon grid, auto-advances on click)
2. Email
3. Location (state + city)
4. Team size
5. Company website + country
6. **Logo Upload** (via `SelectImage` + `fileApi`)
7. Business type + CAC toggle
8. How did you hear about us (select dropdown)
9. Create account (full name, phone, username — no passwords)

API: `PATCH /tenant/onboarding/` (save progress), `POST /tenant/onboarding/complete` (final step)

## Auth

- Registration: `POST /tenant/auth/register`
- Email Verification: `POST /tenant/auth/verify-email` (OTP)
- Resend OTP: `POST /tenant/auth/resend-otp`
- Forgot Password: `POST /tenant/auth/forgot-password` (Sends OTP)
- Reset Password: `POST /tenant/auth/reset-password` (Requires email, otp, newPassword)
- Login: `POST /tenant/auth/login`
- Profile Check: `GET /tenant/auth/me` (returns `isOnboarded`)
- Logout: `PUT /auth/users/logout`
- Token refresh: `POST /auth/refresh` with `refreshToken` body
- Session stored via `user_atom` (tokens) and `profile_atom` (user info) in Jotai

## Commands

```bash
bun run dev          # Dev server on port 3000
bun run typecheck    # Fast TypeScript validation (tsgo --noemit)
bun run build        # Production build
bun run test         # Unit test runner
bun add <pkg>        # Add dependency
```
