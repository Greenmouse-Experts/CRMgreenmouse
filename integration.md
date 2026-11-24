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

## Error handling

The shared error-extraction helper is `extract_message` in
`src/helpers/errors.ts`:

```ts
import { extract_message } from "@/helpers/errors";
```

It accepts `unknown` and returns the most useful message, trying in order:

1. `error.response.data.message` — standard axios error body messages
2. `error.response.data` when the body is a plain string
3. `error.payload.message` — some CRM responses wrap the message in `payload`
4. `error.message` — plain errors, including `Error` instances
5. `"An unexpected error occurred"` as the final fallback

Typical use in a page or component:

```ts
toast.error(extract_message(error));
```

Notes:

- Some code paths read the raw axios error instead — e.g. `PageLoader`
  checks `query.error.response?.status === 403` to render the
  access-denied state.
- `src/api/employeesApi.ts` wraps mutation errors with `extractError`
  (`new Error(extract_message(error))`), so callers of `mutateAsync` get
  plain `Error` objects carrying the extracted message.
- The older `extract_message` in `src/helpers/auth.ts` (typed for axios
  errors) is still used across pages; new code should prefer
  `@/helpers/errors`.

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
- Creating a vacancy (verified 2026-11-23) requires `jobTitle` (≤ 160),
  `departmentId`, `openings` (int 1–1000), `employmentType` (≤ 80),
  `reasonForHire` (≤ 120), `jobDescription` (≤ 20000), `closingDate` (ISO 8601),
  `hiringManagerId` and `approverId` (UUIDs resolved from the options/approvers
  endpoints). Optional: `gradeId`, `workLocation`, `salaryMinimum`/`salaryMaximum`,
  `salaryCurrency`, `salaryPeriod` (`hourly`/`weekly`/`monthly`/`annual`),
  `publishingChannel`, `saveAsDraft`. The legacy `grade`/`location`/`budget`/
  `channels`/`type`/`reason` fields are rejected. The test tenant has no
  departments configured, so creation is blocked until those options exist.

### Staff / employees — `src/api/employeesApi.ts` (`/hr/staffs`)

The people directory reads the employees module (fixed backend-side;
re-verified 2026-11-23):

- `useEmployees()` — `GET /employees` (200, array).
- `useStaffs()` — `GET /staffs` (200, array; separate resource, used by the
  leave request modal).
- `useCreateEmployee()` — `POST /employees` (201; `{}` creates a draft, so
  the form validates required fields client-side).
- `useUpdateEmployee()` — `PATCH /v1/employees/:id`.
- `useRemoveEmployee()` — `PATCH /v1/employees/:id` with
  `{ employmentStatus: "inactive" }` — **broken**: the verified enum is
  `active`, `notice_period`, `suspended`, `exited` (no DELETE route exists;
  see `pending_apis.md`).

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
| `useCreatePosition()`   | `POST /v1/employees/organization/positions` — `{ title, departmentId, approvedHeadcount?, status? }` (verified) |
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

| Hook                      | Method / Endpoint                       |
| ------------------------- | --------------------------------------- |
| `useLeaveTypes()`         | `GET /v1/leave/types`                   |
| `useLeaveRequests()`      | `GET /v1/leave/requests`                |
| `useMyLeaveRequests()`    | `GET /v1/leave/requests/mine`           |
| `useLeaveBalances()`      | `GET /v1/leave/balances/mine`           |
| `useCreateLeaveRequest()` | `POST /v1/leave/requests`               |
| `useDecideLeaveRequest()` | `PATCH /v1/leave/requests/:id/decision` |
| `useCancelLeaveRequest()` | `PATCH /v1/leave/requests/:id/cancel`   |
| `useUpdateLeaveType()`    | `PUT /v1/leave/types`                   |

Notes:

- The management page (`/hr/leave`) lists all requests and maps them onto
  the page's `LeaveRequest` shape via `mapBackendLeaveRequest`: dates are
  shown as short `Nov 18` strings, `days` falls back to the start/end dates
  when the backend omits it, and unknown statuses map to `Submitted`.\
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
- Task creation: the checklist header's **Add Task** button opens
  `AddTaskModal` → `useCreateTask()` (`src/api/tasksApi.ts`,
  `POST /v1/tasks`) with `assignedTo` set to the onboarding employee;
  success refetches `useOnboardingTasks`.
- Probation decisions: "Confirm Permanent" sends `decision: "confirm"`;
  "Extend" opens `ExtendProbationModal` and sends
  `{ decision: "extend", newEndDate, reason }` per the Postman contract.
- Review completion (both "Advance Milestone" and the reviews list) opens
  `CompleteReviewModal` to capture optional `notes` before calling
  `useCompleteProbationReview`.
- Shared API→UI mappers live in `-components/mappers.ts`
  (`toUiHire`, `toChecklistItem`, `employeeDisplayName`).

Notes:

- There is no endpoint to create or delete individual onboarding tasks; the
  checklist's **Add Task** button instead creates a generic task via
  `POST /v1/tasks` (`useCreateTask`) with `assignedTo` = the onboarding
  employee, then refetches the onboarding tasks.
- Probation decisions are `confirm` / `extend`; `newEndDate` is required by the
  backend when extending.
- Every hook invalidates the `["onboarding"]` query root.
- `employeesApi.ts` contains older duplicate onboarding/probation hooks
  (`useEmployeeOnboardingTasks`, `useStartEmployeeOnboarding`, etc.) plus
  `probation/start-review` and `probation/reviews/:reviewId/submit` hooks whose
  routes do **not** exist in the Postman collection — prefer `onboardingApi.ts`.

## HR payroll — `src/api/payrollApi.ts` (`/hr/payroll`)

Wired to the "Payroll Controller …" endpoints in the Postman collection
(`/v1/payroll/*`):

| Hook                                   | Endpoint                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `usePayrollSettings()`                 | `GET/PUT /payroll/settings` (`{ jurisdiction, currency, payFrequency }`) |
| `useStatutoryRules()`                  | `GET /payroll/statutory-rules`                                           |
| `useCreateStatutoryRule()`             | `POST /payroll/statutory-rules`                                          |
| `useUpdateStatutoryRule(id)`           | `PATCH /payroll/statutory-rules/:id`                                     |
| `useEmployeeCompensations(employeeId)` | `GET /payroll/employees/:id/compensations`                               |
| `useCreateCompensation()`              | `POST /payroll/compensations`                                            |
| `usePayrollRuns()`                     | `GET /payroll/runs`                                                      |
| `usePayrollRun(id)`                    | `GET /payroll/runs/:id`                                                  |
| `useCreatePayrollRun()`                | `POST /payroll/runs` (`{ periodStart, periodEnd, payDate }`)             |
| `useCalculatePayrollRun()`             | `POST /payroll/runs/:id/calculate`                                       |
| `useApprovePayrollRun()`               | `POST /payroll/runs/:id/approve`                                         |
| `useFinalizePayrollRun()`              | `POST /payroll/runs/:id/finalize`                                        |
| `useMarkPayrollRunPaid()`              | `POST /payroll/runs/:id/paid` (`{ paymentReference, paidAt }`)           |
| `useMyPayslips()`                      | `GET /payroll/my/payslips`                                               |

Page coverage (`/hr/payroll`):

- **New run** — `NewPayrollRunModal` → `useCreatePayrollRun` (modal also gained
  `isPending`).
- **Run lifecycle** — Submit → `useCalculatePayrollRun`, Approve →
  `useApprovePayrollRun`, Mark paid → `useMarkPayrollRunPaid` (auto
  `paymentReference: PR-<id> payment`).
- **Process run** (PageHeader) — calculates the first Draft/Pending run.
- **Payslips list** — `useMyPayslips`; holds stay local (no payslip
  endpoints in the collection).
- **Payroll config** — `usePayrollSettings` (frequency) +
  `useStatutoryRules` (server-rule count).

All queries/mutations invalidate the `["payroll"]` root and use
`toast.promise` + `extract_message`.

### Training & Development — `src/api/trainingApi.ts` (`/hr/training`)

Wired to the "Training Controller …" endpoints in the Postman collection (`/v1/training/*`):

| Hook                                 | Method / Endpoint                            | Purpose / Scope                                             |
| ------------------------------------ | -------------------------------------------- | ----------------------------------------------------------- |
| `useTrainingDashboard()`             | `GET /v1/training/dashboard`                 | Main page view: courses array + upcoming scheduled sessions |
| `useTrainingCourses()`               | `GET /v1/training/courses`                   | Full course catalog list                                    |
| `useTrainingCourse(id)`              | `GET /v1/training/courses/:id`               | Course detail                                               |
| `useCreateTrainingCourse()`          | `POST /v1/training/courses`                  | Create new course draft                                     |
| `useUpdateTrainingCourse(id)`        | `PATCH /v1/training/courses/:id`             | Update course details                                       |
| `usePublishTrainingCourse()`         | `POST /v1/training/courses/:id/publish`      | Publish course (requires ≥1 scheduled session)              |
| `useArchiveTrainingCourse()`         | `POST /v1/training/courses/:id/archive`      | Archive course                                              |
| `useCreateTrainingSession()`         | `POST /v1/training/courses/:id/sessions`     | Schedule session for course                                 |
| `useAdvanceTrainingSessionStatus()`  | `PATCH /v1/training/sessions/:id/status`     | Mark session `in_progress` or `completed`                   |
| `useCancelTrainingSession()`         | `POST /v1/training/sessions/:id/cancel`      | Cancel scheduled session (`{ reason }`)                     |
| `useTrainingSessionParticipants(id)` | `GET /v1/training/sessions/:id/participants` | Session enrolled participants                               |

Page coverage (`/hr/training`):

- **KPI Metrics**: Derived live from `useTrainingDashboard()`: active courses count, total enrolled learners, and average completion rate.
- **Course Catalog Grid**: Lists courses with category badges, delivery modes, completion progress bars, and actions (Publish for drafts, Archive for active courses).
- **Training Sessions Table**: Displays cohorts and schedules with search, filter tabs (`All`, `Scheduled`, `In Progress`, `Completed`, `Cancelled`), and lifecycle actions (`Start`, `Complete`, and `Cancel` with prompt).
- **Create Course Modal**: Creates the course record and optionally schedules the inaugural training session in one unified flow.
- All mutations invalidate the `["training"]` query root.

## Known backend issues

Full probe results live in `pending_apis.md` (originally probed 2026-11-19,
re-probed **2026-11-23** with a token renewed via `tenant/auth/refresh`).

The employee-module 500s recorded on 2026-11-19 (`GET /v1/employees`,
`upcoming-milestones`, onboarding tasks, probation reviews,
`POST .../onboarding/start`, `PATCH /v1/staffs/:id`) are **fixed** — all now
return 200/201 or proper 400/404 validation responses.

### Open issues

- **Employment status enum mismatch**: the backend accepts only `active`,
  `notice_period`, `suspended`, `exited`. `useRemoveEmployee` sends
  `inactive` (400), and the staff form offers `probation` / `notice` /
  `inactive` options that the backend rejects.
- **No pagination**: `GET /v1/employees` rejects `page` / `limit`; `search`
  is accepted but unverified against named records.
- Missing endpoints (employee delete, task creation, probation review
  creation, manager/grade/location lookups, employee import, org deletes) —
  see `pending_apis.md` section 3.

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
7. **Commit when done**: Once validation passes, stage and commit the relevant changes with a clear, concise commit message (leaving unrelated dirty files unstaged).

## Rules for Updating `pending_apis.md` (Backend Handoff)

`pending_apis.md` is exported and sent directly to the backend development team to communicate missing endpoints, bugs, schema gaps, and contract mismatches. It must serve as a clean, actionable backend technical specification rather than an internal frontend tracker.

### 1. Backend-Relevant Information Only

- **What to include:**
  - Exact HTTP method and route path (e.g. `POST /v1/employees/organization/departments`).
  - Clear classification: Missing Route (404), Internal Server Error (500), Validation Failure (400), Unsupported Query Param/Filter, or Postman Documentation Gap.
  - Concrete observed vs. expected behavior: status codes, error payloads returned by backend validators, and expected response bodies.
  - Precise payload specifications: field names, data types, constraints (e.g., UUID format, max string lengths), and accepted enum literals (e.g., `active | notice_period | suspended | exited`).
- **What to omit (No frontend-internal details):**
  - Do **not** mention internal React hook names (`useEmployees`, `useUpdateEmployee`, `useDecideProbation`).
  - Do **not** mention TanStack Query cache keys (`["employees"]`, `["onboarding"]`).
  - Do **not** reference UI component files, route files (`src/routes/hr/...`), or modals.
  - Do **not** describe internal frontend workarounds (e.g. "UI marks inactive instead"), unless directly specifying the expected API contract payload.

### 2. Status Updates on Availability (Lifecycle & Freshness)

- **Immediate Re-verification**: Whenever a pending or missing API is implemented, deployed, or fixed:
  - Re-probe the endpoint against the live backend API using valid test credentials.
  - Immediately update `pending_apis.md`:
    - Move verified endpoints out of the active issues / gaps list into the "Verified / Available APIs" section with the verification date, HTTP status code, and confirmed response shape.
    - If an endpoint was previously listed as missing or problematic and is now fully operational, remove or archive it from the active blocker list.
  - Keep the active sections of the document strictly focused on unresolved items so backend developers have a concise, actionable punch list.

## Pending Issues

- **Status enum mismatch** (see "Known backend issues"): `useRemoveEmployee`
  sends `inactive`, which the backend rejects; the staff form's status options
  need aligning with `active` / `notice_period` / `suspended` / `exited`.
- **Organization writes**:
  - Create-department contract (verified via live 400): `{ code, name, status }`,
    lowercase `active`/`inactive`; rejects `id`, `head`, `count`, `parent`,
    `location`. The frontend matches.
  - Create-position contract (verified 2026-11-23, now wired): `title` (≤ 160)
    - `departmentId` (existing UUID) required; `approvedHeadcount` (≥ 0) and
      `status` (`active`/`inactive`) optional. `grade`, `dept`, `approved`,
      `filled`, `openings`, `description` are rejected by the validator.
  - There are no DELETE routes for departments/positions, so the frontend
    marks inactive (see the Organization integration).
- **Probing credentials**: the `auth_cred.ts` refresh token expires
  2026-11-26; renew via `tenant/auth/refresh` before then, or log in fresh.
- Full probe record and remaining backend gaps: `pending_apis.md`
  (re-probed 2026-11-23).
