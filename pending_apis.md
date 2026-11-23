# Pending / Problematic APIs

Verified against the current `Greenmouse CRM API.postman_collection.json`
(479 requests). Originally probed **2026-11-19**; **re-probed 2026-11-23** with
an access token renewed via `tenant/auth/refresh` (the `auth_cred.ts` refresh
token is valid until **2026-11-26**).

The `/v1/employees` module 500s recorded on 2026-11-19 are **fixed** — list,
detail, milestones, onboarding tasks, probation reviews and creation all
respond correctly now. The people directory and onboarding pages read
`/v1/employees` again (commit `a190a07`); `/v1/staffs` remains a separate,
currently empty resource.

## 1. Verified response shapes (formerly undocumented)

Live probes on 2026-11-23 returned:

| Endpoint | Shape |
| --- | --- |
| `GET /v1/employees` | array of employee objects (`id`, `tenantId`, `staffId`, `employeeNumber`, `firstName`, …) |
| `GET /v1/employees/upcoming-milestones` | `{ items: [], window: { from, to, days: 30 } }` |
| `GET /v1/employees/:id/onboarding/tasks` | `{ employeeId, tasks: [], progress: { completed, total, percent } }` |
| `GET /v1/employees/:id/probation/reviews` | `{ employeeId, reviews: [], completed, total }` |
| `POST /v1/employees` | `201` + created record — even `{}` succeeds (creates a draft with null names) |
| `POST /v1/employees/:id/onboarding/start` | `400` "Complete the employee record before starting onboarding" until the record is filled in |
| `PATCH /v1/staffs/:id` (missing UUID) | `404` "Staff not found" |

The frontend's defensive unwrapping (`tasks` / `reviews` / `items` keys) matches
these shapes. The Postman collection still has no examples for them.

## 2. Collection documentation gaps

- **413 of 479** requests have no response example (`"body": null`).
- **376 of 479** request bodies are empty or literally `{}`.
- For the **`/v1/employees`** family every write endpoint has a `{}` body and
  no response example. `/v1/staffs` POST/PATCH are the better-documented
  exception (`<string>` placeholders).

Empty `{}` examples hide requirements the live API enforces (verified via
400s):

| Endpoint | Required / validated fields |
| --- | --- |
| `PATCH /v1/employees/onboarding/tasks/:taskId/complete` | `notes` must be a string |
| `PATCH /v1/employees/probation/reviews/:reviewId/complete` | `notes` must be a string |
| `PATCH /v1/employees/onboarding/tasks/:taskId/assignment` | `assignedTo` must be a UUID |
| `POST /v1/employees/:id/probation/decision` | `decision` must be `confirm` or `extend` (Postman sample also shows `newEndDate`, `reason`) |
| `POST /v1/employees/organization/departments` | `name` (string ≤ 120), `code` (string ≤ 30); lowercase `active`/`inactive` status |
| `POST /v1/employees/organization/positions` | `title` (string ≤ 160), `departmentId` (existing UUID); optional `approvedHeadcount` (≥ 0), `status` (`active`/`inactive`), `gradeId` (UUID). Rejects `grade`, `dept`, `approved`, `filled`, `openings`, `description` |
| `PATCH /v1/employees/:id` | `employmentStatus` enum — see section 5 |
| `POST /v1/recruitment/vacancies` | **Verified:** `jobTitle` (≤ 160), `departmentId` (UUID), `openings` (int 1–1000), `employmentType` (≤ 80), `reasonForHire` (≤ 120), `jobDescription` (≤ 20000), `closingDate` (ISO 8601), `hiringManagerId` (UUID), `approverId` (UUID); optional `gradeId`, `workLocation`, salary fields (`salaryPeriod`: hourly/weekly/monthly/annual), `publishingChannel`, `saveAsDraft` |

Needed: real example bodies, required markers, and enum values in the
collection.

## 3. Missing endpoints (verified absent from the collection)

1. `DELETE /v1/employees/:id` — no delete or archive/terminate endpoint.
2. Manager lookup — no endpoint to list candidate managers, and no `managerId`
   write path.
3. Locations / grades — no list endpoints to populate those fields.
4. `POST /v1/employees/:id/probation/reviews` — only list and complete exist.
5. `POST` onboarding task creation — start/tasks/complete/assignment exist, but
   tasks cannot be added individually. (The frontend's **Add Task** button on
   `/hr/onboarding/:id` creates tasks via the generic **`POST /v1/tasks`**
   endpoint — `useCreateTask` — with `assignedTo` set to the onboarding
   employee. Sample request: `{"title": "...", "assignedTo": "<uuid>"}`.)
6. Bank details / documents — nothing exposed for payroll or compliance.
7. `POST /v1/employees/import` — imports exist for companies, contacts,
   products, services and leads, but not employees.
8. `DELETE` department / position — create and update exist without delete.
9. Dedicated status-change action for employees — status is only a generic
   PATCH field.

## 4. Query / pagination gaps

`GET /v1/employees` documents `sort` / `order` only. Verified 2026-11-23:

- `limit` / `page` → `400` "property should not exist" (explicitly rejected).
- `search` → `200` (accepted; filtering could not be confirmed because the
  test tenant has no named employee records).
- `status`, `departmentId`, `positionId` filters — still absent.
- `GET /v1/employees/upcoming-milestones` — fixed 30-day window; a `days`
  parameter is rejected (`400`). No limit/window control.

## 5. Contract and status ambiguities

- **Employment status enum (verified):** `active`, `notice_period`,
  `suspended`, `exited`. The client is out of sync:
  - `useRemoveEmployee` sends `employmentStatus: "inactive"` → **400**.
    `exited` is the closest valid terminal status.
  - The staff form (`/hr/staffs/$id`) offers `probation`, `notice`,
    `inactive` — none are valid enum values.
- `inactive` vs `suspended` mapping in the UI needs revisiting against the
  verified enum.
- Contract renewal has no documented fields and no contract read endpoint.
- Compensation PATCH cannot express an effective date or revision history.
- Relationship between `/v1/employees` and `/v1/staffs` is undocumented
  (employee records carry `staffId: null`; the staffs list is empty).

## 6. Auth and error handling

- Access tokens expire; the `auth_cred.ts` refresh token works until
  **2026-11-26**, after which a fresh login is needed for probing. Do not
  commit real tokens.
- Permission model for staff vs tenant users is undocumented.
- Duplicate-email behavior on create is undocumented (409? 422? reuse?) —
  note `POST /v1/employees {}` currently succeeds and creates a draft.

## 7. Endpoints currently wired in the app

| Method | Path | Client hook |
| --- | --- | --- |
| GET | `/v1/employees` | `useEmployees` |
| GET | `/v1/staffs` | `useStaffs` (leave request modal) |
| GET | `/v1/employees/:id` | `useEmployee` |
| GET | `/v1/employees/organization` | `useEmployeeOrganization` |
| GET | `/v1/employees/recent-activity` | `useEmployeeRecentActivity` |
| GET | `/v1/employees/upcoming-milestones` | `useUpcomingMilestones` |
| GET | `/v1/employees/:id/compensation` | `useEmployeeCompensation` |
| POST | `/v1/employees` | `useCreateEmployee` |
| PATCH | `/v1/employees/:id` | `useUpdateEmployee` / `useRemoveEmployee` (sends invalid `inactive` — see section 5) |
| PATCH | `/v1/employees/:id/compensation` | `useUpdateCompensation` |
| PATCH | `/v1/employees/:id/contract-renewal` | `useRenewContract` |
| POST | `/v1/employees/organization/departments` | `useCreateDepartment` |
| PATCH | `/v1/employees/organization/departments/:id` | `useUpdateDepartment` |
| POST | `/v1/employees/organization/positions` | `useCreatePosition` |
| PATCH | `/v1/employees/organization/positions/:id` | `useUpdatePosition` |

Onboarding/probation (canonical module: `src/api/onboardingApi.ts`, used by
`/hr/onboarding` and `/hr/onboarding/$employeeId`):

| Method | Path | Client hook |
| --- | --- | --- |
| GET | `/v1/employees/:id/onboarding/tasks` | `useOnboardingTasks` |
| GET | `/v1/employees/:id/probation/reviews` | `useProbationReviews` |
| POST | `/v1/employees/:id/onboarding/start` | `useStartOnboarding` |
| PATCH | `/v1/employees/onboarding/tasks/:taskId/complete` | `useCompleteOnboardingTask` |
| PATCH | `/v1/employees/onboarding/tasks/:taskId/assignment` | `useReassignOnboardingTask` |
| PATCH | `/v1/employees/probation/reviews/:reviewId/complete` | `useCompleteProbationReview` |
| POST | `/v1/employees/:id/probation/decision` | `useDecideProbation` (`confirm` / `extend` + `newEndDate` / `reason`) |

`employeesApi.ts` still contains older duplicate onboarding hooks plus
`useStartEmployeeProbationReview` (`probation/start-review`) and
`useSubmitEmployeeProbationReview` (`probation/reviews/:reviewId/submit`)
whose routes do **not** exist in the collection — candidates for removal.

Also wired elsewhere:

- Recruitment: `src/api/recruitmentApi.ts` (`/v1/recruitment/*`)
- Attendance: `src/api/attendanceApi.ts` (`/v1/attendance/*`)
- Leave: `src/api/leaveApi.ts` (`/v1/leave/types`, `/v1/leave/requests`,
  `/v1/leave/requests/mine`, `/v1/leave/balances/mine`,
  `POST /v1/leave/requests`, `PATCH /v1/leave/requests/:id/decision`,
  `PATCH /v1/leave/requests/:id/cancel`, `PUT /v1/leave/types`) — wired in
  `src/routes/hr/leave` and `src/routes/hr/self-service`. No response bodies
  are documented for the leave GETs; the frontend reads them defensively.
- Staff directory (tenant side): `src/api/tenantApi.ts` (`/v1/staffs`)

## 8. Organization module — partial implementation

| Method | Endpoint | Status | Contract |
| --- | --- | --- | --- |
| `GET` | `/v1/employees/organization` | **Working** — `200` `{ departments: [], positions: [] }` | — |
| `POST` | `/v1/employees/organization/departments` | Working route; `400` unless payload matches | `name` (≤ 120), `code` (≤ 30), lowercase `active`/`inactive` status; rejects `id`, `head`, `count`, `parent`, `location` |
| `PATCH` | `/v1/employees/organization/departments/:id` | Route exists | Status updates — lowercase `active`/`inactive` |
| `POST` | `/v1/employees/organization/positions` | Working route; `400` unless payload matches | **Verified:** `title` (≤ 160) + `departmentId` (existing UUID) required; optional `approvedHeadcount` (≥ 0), `status` (`active`/`inactive`), `gradeId` (UUID). Frontend now sends this shape |
| `PATCH` | `/v1/employees/organization/positions/:id` | Route exists | Fields unverified |
| `DELETE` | `/v1/employees/organization/departments/:id` / `/positions/:id` | **Missing** (404) | Frontend marks inactive instead |

## 9. Re-verification checklist (remaining)

1. Fill in real request/response examples for the `/v1/employees` family in
   the Postman collection (shapes in section 1 are a starting point).
2. Add the missing endpoints from section 3 or document intended replacements.
3. Fix the client status enum mismatch (section 5).
4. Confirm the `/v1/employees` ↔ `/v1/staffs` relationship.
5. Re-verify position PATCH fields and the probation `extend` payload
   (`newEndDate` required?) with a complete employee record.
6. Renew probing credentials after 2026-11-26.
