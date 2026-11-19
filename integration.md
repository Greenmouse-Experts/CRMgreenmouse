# API Integration Guide

This document describes how the frontend talks to the CRM backend and the
conventions used when wiring a page to real endpoints.

## Client setup

- Axios instance: `src/api/simpleApi.ts` (re-exported by `src/client/api.ts`).
- Base URL: `VITE_API_URL`, defaulting to
  `https://crmgrenmouse-backend-api.onrender.com/v1/`.
- The request interceptor attaches `Authorization: Bearer <accessToken>` from
  the Jotai user atom and handles token refresh on 401.
- All endpoint paths in hooks are relative, e.g. `/recruitment/vacancies`
  resolves to `<baseURL>/recruitment/vacancies`.

### Response shapes

Response envelopes are inconsistent across the backend:

- Some endpoints return data directly (arrays or plain objects), e.g.
  `GET /recruitment/vacancies` → `[]`,
  `GET /recruitment/dashboard` → `{ openVacancies, applicants, ... }`.
- Others wrap it as `{ data: ... }` or use a domain key such as
  `{ vacancies: [...] }`.

Always unwrap defensively in the query function:

```ts
if (Array.isArray(data)) return data;
if (Array.isArray(data?.data)) return data.data;
if (Array.isArray(data?.vacancies)) return data.vacancies;
return [];
```

## UI conventions

- **Loading / error / empty states**: use `PageLoader` for a page-level query,
  and `QueryCompLayout` for a smaller independent section.
- **Tables**: use `CustomTable` with `columnType[]` config and `Actions[]` for
  the row action menu. Do not hand-roll new `<table>` markup.
- **No dummy data**: never seed UI state with mock records or fallback numbers.
  Derive everything from query data. Use `—` or an explicit empty state for
  fields the API does not return.
- **Mutations**: invalidate the relevant query root on success. Show feedback
  with `toast.promise(...)`, passing API errors through `extract_message`.
- **Extra hooks / components**: check `src/api/` and `src/components/` first and
  reuse what exists before creating new ones.

## Implemented integrations

### Recruitment — `src/api/recruitmentApi.ts` (`/hr/recruitment`)

Reads:

| Hook | Endpoint |
| --- | --- |
| `useRecruitmentDashboard` | `GET /recruitment/dashboard` |
| `useRecruitmentVacancies` | `GET /recruitment/vacancies` |
| `useRecruitmentApplications` | `GET /recruitment/applications` |
| `useRecruitmentInterviews` | `GET /recruitment/interviews` |
| `useRecruitmentOffers` | `GET /recruitment/offers` |
| `useRecruitmentOptions(type)` | `GET /recruitment/options/:type` |
| `useRecruitmentApprovers` | `GET /recruitment/approvers` |

Writes: create/update/submit/decide/publish vacancy, create application, update
application stage, create/update/cancel interview, create/decide offer, convert
to employee. Every mutation invalidates the `["recruitment"]` query root.

Notes:

- Application stages are lowercase (`applied`, `screening`, `shortlisted`,
  `interview`, `assessment`, `offer`, `hired`, `rejected`, `withdrawn`).
- Vacancy decisions are `approve` / `reject`; offer decisions are `approve`,
  `send`, `accept`, `decline`.
- Creating a vacancy requires `departmentId`, `hiringManagerId` and
  `approverId` (UUIDs) resolved from the options/approvers endpoints. The test
  tenant currently has no departments configured, so creation is blocked until
  those options exist.

### Staff / employees — `src/api/tenantApi.ts` (`/hr/staffs`)

Reused the existing hooks: `useStaffs`, `useStaff`, `useCreateStaff`,
`useUpdateStaff`, `useDeleteStaff`.

- `GET /staffs` returns `[]` for the test tenant.
- `POST /staffs` accepts only `email`, `firstName`, `lastName`, `phoneNumber`
  (plus optional `roleId`, `profilePic`). Extra properties are rejected, so the
  Add Employee form only collects those fields.
- `PATCH /staffs/:id` is implemented in the API layer but the backend returned
  500 during probing; treat it as unverified.

### Organization — `src/api/organizationApi.ts` (`/hr/organization`)

The Departments and Positions data derives from `GET /employees/organization`
(200, `{ departments: [], positions: [] }`); the page derives everything from
query data (no mock seed data). Write hooks are wired through mutations that
invalidate the `["organization"]` query root:

| Hook | Method / Endpoint |
| --- | --- |
| `useOrganization()` | `GET /employees/organization` |
| `useCreateDepartment()` | `POST /departments` (backend to implement) |
| `useUpdateDepartment()` | `PATCH /departments/:id` (backend to implement; used for status updates) |
| `useDeleteDepartment()` | `DELETE /departments/:id` (backend to implement) |
| `useCreatePosition()` | `POST /positions` (backend to implement) |
| `useUpdatePosition()` | `PATCH /positions/:id` (backend to implement) |

Notes:

- Department status updates (the `Deactivate` / `Activate` actions in the
  departments table) are sent as `PATCH /departments/:id` with the new
  `status`.
- The executive leader on the Org hierarchy card (`INITIAL_LEADER` in
  `organizationData.ts`) has no verified endpoint yet.

### HR onboarding — `src/api/onboardingApi.ts` (`/hr/onboarding`)

The new-hire list comes from the working `GET /staffs` endpoint; the
onboarding/probation details come from the employee onboarding endpoints:

| Hook | Endpoint |
| --- | --- |
| `useOnboardingTasks(employeeId)` | `GET /employees/:id/onboarding/tasks` |
| `useProbationReviews(employeeId)` | `GET /employees/:id/probation/reviews` |
| `useStartOnboarding()` | `POST /employees/:id/onboarding/start` |
| `useCompleteOnboardingTask()` | `PATCH /employees/onboarding/tasks/:taskId/complete` (`{ notes }`) |
| `useReassignOnboardingTask()` | `PATCH /employees/onboarding/tasks/:taskId/assignment` (`{ assignedTo }`, UUID) |
| `useCompleteProbationReview()` | `PATCH /employees/probation/reviews/:reviewId/complete` (`{ notes }`) |
| `useDecideProbation()` | `POST /employees/:id/probation/decision` (`confirm` / `extend`) |

Notes:

- There is no endpoint to create or delete individual onboarding tasks, so the
  page only toggles tasks returned by the API.
- Probation decisions are `confirm` / `extend`.
- Every hook invalidates the `["onboarding"]` query root.

## Known backend issues

Full probe results live in `pending_apis.md` (probed on 2026-11-19 with the
`auth_cred.ts` test token, since expired).

### 500s — employee endpoints

| Method | Endpoint | Observed | Expected | Notes |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/employees` | 500 | 200 + employee list | — |
| `GET` | `/v1/employees/upcoming-milestones` | 500 | 200 + milestones list | No milestone data in the UI yet |
| `GET` | `/v1/employees/:id/onboarding/tasks` | 500 | 200 + task list | Onboarding checklist shows an error state |
| `GET` | `/v1/employees/:id/probation/reviews` | 500 | 200 + reviews list | Probation tracker cannot load reviews |
| `POST` | `/v1/employees/:id/onboarding/start` | 500 | 201 + onboarding | Starting onboarding from the UI fails |
| `PATCH` | `/v1/staffs/:id` | 500 | 404 unknown / 200 valid | Unverified |

The nested employee endpoints also return 500 with a **real** staff ID — the
staff record used for probing was created and deleted; the staffs table and
the employees resource appear to be separate.

### Working endpoints (for reference)

- `GET /v1/staffs` — 200 (array; empty for the test tenant).
- `POST /v1/staffs` — 201 (only `email`, `firstName`, `lastName`,
  `phoneNumber`; optional `roleId`, `profilePic`).
- `DELETE /v1/staffs/:id` — 200.
- **`GET /v1/employees/organization` — 200, `{ departments: [], positions: [] }`**
  (used by `useOrganization`).
- `GET /v1/employees/recent-activity` — 200
  (`{ items, total, page, limit, totalPages }`).
- Recruitment read endpoints return 200 (arrays; empty for the test tenant).

### Configuration gaps

- `GET /v1/recruitment/options/department` and
  `GET /v1/recruitment/options/grade` return `[]` — vacancy creation needs
  real `departmentId`, `hiringManagerId` and `approverId` UUIDs.

### Other notes

- The full request/response catalogue lives in
  `Greenmouse CRM API.postman_collection.json`. Some entries have no sample
  bodies; for those, send an empty `{}` payload to a write endpoint and read the
  validation errors to discover required field names and allowed enum values.
- `auth_cred.ts` contains a local test token. Use it only for manual `curl`
  probing; do not embed tokens in application code or documentation.

## Adding a new integration

1. Find the endpoint in the Postman collection and probe it with the test token
   to confirm the response shape and required fields.
2. Add typed hooks in a dedicated `src/api/<domain>Api.ts` module (or reuse an
   existing one) following the `tasksApi.ts` / `recruitmentApi.ts` pattern.
3. Map API records to the page's UI types in the route file; keep mapping local
   and remove any seed/demo data.
4. Wrap the page in `PageLoader` (or `QueryCompLayout`) and use `CustomTable`
   for tabular data.
5. Wire mutations with invalidation, toasts, and `extract_message`.
6. Run `bun run typecheck` and `bun run build` before committing.

## Pending Issues

- **Organization write endpoints — missing on the backend.** The organization
  page reads through `GET /v1/employees/organization` (see "Known backend
  issues"). Backend endpoints to add:
  - `POST /v1/departments` — create department
  - `PATCH /v1/departments/:id` — update department (status updates)
  - `DELETE /v1/departments/:id` — delete department
  - `POST /v1/positions` — create position
  - `PATCH /v1/positions/:id` — update position
  Frontend hooks are in place (`useCreateDepartment`, `useUpdateDepartment`,
  `useDeleteDepartment`, `useCreatePosition`, `useUpdatePosition`) in
  `src/api/organizationApi.ts`.
- **Employee endpoints — 500s** (see "Known backend issues"):
  `/v1/employees`, `/v1/employees/upcoming-milestones`,
  `GET /v1/employees/:id/onboarding/tasks`,
  `GET /v1/employees/:id/probation/reviews`,
  `POST /v1/employees/:id/onboarding/start`, `PATCH /v1/staffs/:id`.
- **Test token expired.** The `auth_cred.ts` access token has `exp` =
  2026-11-19 10:38:55 WAT; renewal is needed for authenticated probing.
  Authenticated probing of the organization write endpoints was not possible.
- Full probe record: `pending_apis.md` (probed on 2026-11-19).
