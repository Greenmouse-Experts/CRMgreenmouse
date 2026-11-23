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
  - **`PageLoader` render prop pattern**: `PageLoader` provides a function-as-child
    render prop `{(data: TData) => React.ReactNode}` where `data` is the non-null,
    unwrapped query response (`query.data`). Always consume query data via
    the `(data) => ...` callback instead of passing static JSX children that read
    from outer query state before loading finishes:
    ```tsx
    <PageLoader
      query={itemsQuery}
      emptyState={{
        title: "No items yet",
        description: "Get started by adding your first item.",
      }}
    >
      {(data) => <ItemsTable items={data} />}
    </PageLoader>
    ```
- **Tables**: use `CustomTable` with `columnType[]` config and `Actions[]` for
  the row action menu. Do not hand-roll new `<table>` markup.
- **Forms**: use `react-hook-form` for form state — `useForm` + `FormProvider`
  - `methods.register` / `Controller` + `methods.handleSubmit(values)`. Do not
    manage form state with `useState`.
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

| Hook                          | Endpoint                         |
| ----------------------------- | -------------------------------- |
| `useRecruitmentDashboard`     | `GET /recruitment/dashboard`     |
| `useRecruitmentVacancies`     | `GET /recruitment/vacancies`     |
| `useRecruitmentApplications`  | `GET /recruitment/applications`  |
| `useRecruitmentInterviews`    | `GET /recruitment/interviews`    |
| `useRecruitmentOffers`        | `GET /recruitment/offers`        |
| `useRecruitmentOptions(type)` | `GET /recruitment/options/:type` |
| `useRecruitmentApprovers`     | `GET /recruitment/approvers`     |

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

### Staff / employees — `src/api/employeesApi.ts` (`/hr/staffs`)

The people directory uses the working staffs endpoints:

- `useEmployees()` — `GET /staffs` (the people directory endpoint;
  `GET /v1/employees` returns 500 — see Known Backend Issues).
- `useCreateEmployee()` — `POST /staffs` — accepts only `email`,
  `firstName`, `lastName`, `phoneNumber` (plus optional `roleId`, `profilePic`).
  Extra properties are rejected, so the Add Employee form collects only those
  fields.
- `useUpdateEmployee()` — `PATCH /v1/employees/:id`.
- `useRemoveEmployee()` — `PATCH /v1/employees/:id` with
  `{ status: "inactive" }` (the remove-employee pattern; there is no DELETE
  route — see Known Backend Issues).

### Organization — `src/api/organizationApi.ts` (`/hr/organization`)

The Departments and Positions data derives from `GET /v1/employees/organization`
(200, `{ departments: [], positions: [] }`); the page derives everything from
query data (no mock seed data). Write hooks are wired through mutations that
invalidate the `["organization"]` query root:

| Hook                    | Method / Endpoint                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| `useOrganization()`     | `GET /v1/employees/organization`                                                                                |
| `useCreateDepartment()` | `POST /v1/employees/organization/departments` — `{ code, name, status }` (status lowercase `active`/`inactive`) |
| `useUpdateDepartment()` | `PATCH /v1/employees/organization/departments/:id` — `{ status }` (lowercase)                                   |
| `useDeleteDepartment()` | `PATCH /v1/employees/organization/departments/:id` (`{ status: "inactive" }` — no DELETE route)                 |
| `useCreatePosition()`   | `POST /v1/employees/organization/positions` — `{ title, dept, grade, approved, filled }` (unverified)           |
| `useUpdatePosition()`   | `PATCH /v1/employees/organization/positions/:id`                                                                |

Notes:

- Department status updates (the `Deactivate` / `Activate` actions in the
  departments table) are sent as `PATCH /v1/employees/organization/departments/:id`
  with the new `status` (lowercase, e.g. `"active"` / `"inactive"`).
- The executive leader on the Org hierarchy card (`INITIAL_LEADER` in
  `organizationData.ts`) has no verified endpoint yet.

### Leave Management — `src/api/leaveApi.ts` (`/hr/leave`)

The leave pages read from the `/v1/leave` controller endpoints (see
`Greenmouse CRM API.postman_collection.json` — "Leave Management" group;
401 without a valid token):

| Hook                       | Method / Endpoint                       |
| -------------------------- | --------------------------------------- |
| `useLeaveTypes()`          | `GET /v1/leave/types`                   |
| `useLeaveRequests()`       | `GET /v1/leave/requests`                |
| `useMyLeaveRequests()`     | `GET /v1/leave/requests/mine`           |
| `useLeaveBalances()`       | `GET /v1/leave/balances/mine`           |
| `useCreateLeaveRequest()`  | `POST /v1/leave/requests`               |
| `useDecideLeaveRequest()`  | `PATCH /v1/leave/requests/:id/decision` |
| `useCancelLeaveRequest()`  | `PATCH /v1/leave/requests/:id/cancel`   |
| `useUpdateLeaveType()`     | `PUT /v1/leave/types`                   |

Notes:

- The management page (`/hr/leave`) lists all requests and maps them onto
  the page's `LeaveRequest` shape via `mapBackendLeaveRequest`: dates are
  shown as short `Nov 18` strings, `days` falls back to the start/end dates
  when the backend omits it, and unknown statuses map to `Submitted`.
  Approve/reject go through `useDecideLeaveRequest` with
  `decision: "approve" | "reject"`.
- The leave-type cards on the management page come from `useLeaveTypes()`
  (`GET /v1/leave/types`); the self-service tab (`/hr/self-service`) uses
  `useMyLeaveRequests()`, and its cancel action uses
  `useCancelLeaveRequest()`.
- The modal's employee/covering-colleague options come from
  `useStaffs()` (`GET /v1/staffs`, the people-directory endpoint); the
  annual balance line on the modal uses `useLeaveBalances()`.
- All mutations invalidate the `["leave"]` query root.

### HR onboarding — `src/api/onboardingApi.ts` (`/hr/onboarding`)

The new-hire list comes from the working `GET /staffs` endpoint; the
onboarding/probation details come from the employee onboarding endpoints:

| Hook                              | Endpoint                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `useOnboardingTasks(employeeId)`  | `GET /employees/:id/onboarding/tasks`                                           |
| `useProbationReviews(employeeId)` | `GET /employees/:id/probation/reviews`                                          |
| `useStartOnboarding()`            | `POST /employees/:id/onboarding/start`                                          |
| `useCompleteOnboardingTask()`     | `PATCH /employees/onboarding/tasks/:taskId/complete` (`{ notes }`)              |
| `useReassignOnboardingTask()`     | `PATCH /employees/onboarding/tasks/:taskId/assignment` (`{ assignedTo }`, UUID) |
| `useCompleteProbationReview()`    | `PATCH /employees/probation/reviews/:reviewId/complete` (`{ notes }`)           |
| `useDecideProbation()`            | `POST /employees/:id/probation/decision` (`confirm` / `extend`)                 |

Pages:

- `/hr/onboarding` — pipeline overview: stats, new-hire cards, checklist,
  probation tracker and the probation reviews list for the selected hire.
- `/hr/onboarding/$employeeId` — per-hire detail page (linked from the chevron
  on each new-hire card). Shows the hire summary + progress, checklist,
  probation tracker and reviews. The probation step is derived from the number
  of completed reviews; a "Start Onboarding" action appears when the hire has
  no tasks yet.

UI coverage of the endpoints:

- Task reassignment: per-row reassign button on the checklist opens
  `ReassignTaskModal` (employee UUID select) → `useReassignOnboardingTask`.
- Probation decisions: "Confirm Permanent" sends `decision: "confirm"`;
  "Extend" opens `ExtendProbationModal` and sends
  `{ decision: "extend", newEndDate, reason }` per the Postman contract.
- Review completion (both "Advance Milestone" and the reviews list) opens
  `CompleteReviewModal` to capture optional `notes` before calling
  `useCompleteProbationReview`.
- Shared API→UI mappers live in `-components/mappers.ts`
  (`toUiHire`, `toChecklistItem`, `employeeDisplayName`).

Notes:

- There is no endpoint to create or delete individual onboarding tasks, so the
  page only toggles tasks returned by the API.
- Probation decisions are `confirm` / `extend`; `newEndDate` is required by the
  backend when extending.
- Every hook invalidates the `["onboarding"]` query root.
- `employeesApi.ts` contains older duplicate onboarding/probation hooks
  (`useEmployeeOnboardingTasks`, `useStartEmployeeOnboarding`, etc.) plus
  `probation/start-review` and `probation/reviews/:reviewId/submit` hooks whose
  routes do **not** exist in the Postman collection — prefer `onboardingApi.ts`.

## Known backend issues

Full probe results live in `pending_apis.md` (probed on 2026-11-19 with the
`auth_cred.ts` test token, since expired).

### 500s — employee endpoints

| Method  | Endpoint                              | Observed | Expected                | Notes                                     |
| ------- | ------------------------------------- | -------- | ----------------------- | ----------------------------------------- |
| `GET`   | `/v1/employees`                       | 500      | 200 + employee list     | —                                         |
| `GET`   | `/v1/employees/upcoming-milestones`   | 500      | 200 + milestones list   | No milestone data in the UI yet           |
| `GET`   | `/v1/employees/:id/onboarding/tasks`  | 500      | 200 + task list         | Onboarding checklist shows an error state |
| `GET`   | `/v1/employees/:id/probation/reviews` | 500      | 200 + reviews list      | Probation tracker cannot load reviews     |
| `POST`  | `/v1/employees/:id/onboarding/start`  | 500      | 201 + onboarding        | Starting onboarding from the UI fails     |
| `PATCH` | `/v1/staffs/:id`                      | 500      | 404 unknown / 200 valid | Unverified                                |

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

- **Employee endpoints — 500s** (see "Known backend Issues"):
  `GET /v1/employees` (the staffs list now uses `GET /v1/staffs`),
  `GET /v1/employees/upcoming-milestones`,
  `GET /v1/employees/:id/onboarding/tasks`,
  `GET /v1/employees/:id/probation/reviews`,
  `POST /v1/employees/:id/onboarding/start`, `PATCH /v1/staffs/:id`.
- **Organization writes**: `POST /v1/employees/organization/departments`,
  `PATCH /v1/employees/organization/departments/:id`,
  `POST /v1/employees/organization/positions`,
  `PATCH /v1/employees/organization/positions/:id` — verified as routes
  (401 without token).
  - The create-department contract was discovered via a 400 from the backend:
    it accepts `code`, `name`, `status` and rejects `id`, `head`, `count`,
    `parent`, `location` ("property X should not exist"); `status` must be one
    of `active`, `inactive` (lowercase). The frontend sends
    `{ code, name, status }`.
  - The create-position contract is unverified (no Postman sample; empty
    `{}` sample). The frontend sends `{ title, dept, grade, approved, filled }`.
  - There are no DELETE routes for departments/positions, so the frontend
    marks inactive (see the Organization integration).
- **Test token expired.** The `auth_cred.ts` access token has `exp` =
  2026-11-19 10:38:55 WAT; probing with it returns
  `401 "Invalid or expired token"` — renewal is needed for authenticated
  probing of the organization write endpoints.
- Full probe record: `pending_apis.md` (probed on 2026-11-19).
