# Pending / Problematic APIs

> [!IMPORTANT]
> **Backend Handoff Specification Guidelines:**
>
> - **Audience:** This document is shared directly with the backend development team to communicate gaps, missing endpoints, schema mismatches, and bugs.
> - **Content Scope:** Contains only backend-relevant technical information: HTTP methods, route paths, status codes, request/response bodies, validation constraints, and accepted enum literals. It deliberately excludes frontend-internal implementation details (such as React hook names, TanStack Query keys, UI components, or route paths).
> - **Lifecycle & Availability Updates:** Whenever pending or missing endpoints become available or reported issues are fixed, re-probe against the live API, and update this document immediately—moving verified endpoints to the "Verified response shapes / Available" section (with date and verified shape) or removing them from active blocker lists.

Verified against the current `Greenmouse CRM API.postman_collection.json`
(481 requests). Originally probed **2026-11-19**; **re-probed 2026-11-23** and **2026-11-24** with
an access token renewed via `tenant/auth/refresh` (the `auth_cred.ts` refresh
token is valid until **2026-11-26**).

The `/v1/employees` module 500s recorded on 2026-11-19 are **fixed** — list,
detail, milestones, onboarding tasks, probation reviews and creation all
respond correctly now. `/v1/employees` is active; `/v1/staffs` remains a separate,
currently empty resource.

## 1. Verified response shapes (formerly undocumented)

Live probes on 2026-11-23 and 2026-11-24 returned:

| Endpoint                                             | Shape                                                                                                                                                                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /v1/employees`                                  | array of employee objects (`id`, `tenantId`, `staffId`, `employeeNumber`, `firstName`, …)                                                                                                                       |
| `GET /v1/employees/upcoming-milestones`              | `{ items: [], window: { from, to, days: 30 } }`                                                                                                                                                                 |
| `GET /v1/employees/:id/onboarding/tasks`             | `{ employeeId, tasks: [], progress: { completed, total, percent } }`                                                                                                                                            |
| `GET /v1/employees/:id/probation/reviews`            | `{ employeeId, reviews: [], completed, total }`                                                                                                                                                                 |
| `POST /v1/employees`                                 | `201` + created record — even `{}` succeeds (creates a draft with null names)                                                                                                                                   |
| `POST /v1/employees/:id/onboarding/start`            | `400` "Complete the employee record before starting onboarding" until the record is filled in                                                                                                                   |
| `PATCH /v1/staffs/:id` (missing UUID)                | `404` "Staff not found"                                                                                                                                                                                         |
| `GET /v1/training/dashboard`                         | `200` `{ courses: [], upcomingSessions: [] }`                                                                                                                                                                   |
| `GET /v1/training/courses`                           | `200` array of `{ course: CourseRecord, enrolled: int, completed: int, completionPercent: int }`                                                                                                                |
| `POST /v1/training/courses`                          | `201` + created CourseRecord (`status: "draft"`, `costPerPersonKobo: int`)                                                                                                                                      |
| `POST /v1/training/courses/:id/sessions`             | `201` + created SessionRecord (`status: "scheduled"`, capacity, deliveryMode, dates)                                                                                                                            |
| `PATCH /v1/training/sessions/:id/status`             | `200` + updated SessionRecord (`status: "in_progress"` or `"completed"`)                                                                                                                                        |
| `POST /v1/training/sessions/:id/cancel`              | `200` + updated SessionRecord (`status: "cancelled"`, `cancellationReason: string`)                                                                                                                             |
| `POST /v1/training/courses/:id/archive`              | `201` + updated CourseRecord (`status: "archived"`, `archivedAt: ISO`)                                                                                                                                          |
| `GET /offboarding/stages`                            | `200` array of stage objects (`id`, `name`, `order`, `description`)                                                                                                                                             |
| `GET /offboarding/cases`                             | `200` array of offboarding cases (`id`, `employeeId`, `employeeName`, `department`, `role`, `separationType`, `noticeDate`, `lastWorkingDate`, `currentStage`, `status`, `handoverTo`, `settlement`, `tasks[]`) |
| `GET /offboarding/cases/:id`                         | `200` single offboarding case object (same shape as list item)                                                                                                                                                  |
| `GET /offboarding/tasks/mine`                        | `200` array of tasks assigned to current user (`id`, `caseId`, `department`, `title`, `assignedTo`, `status`, `dueDate`, `required`, `taskType`, `notes`)                                                       |
| `GET /offboarding/cases/:id/history`                 | `200` array of history events (`id`, `caseId`, `action`, `actor`, `timestamp`, `details`)                                                                                                                       |
| `POST /offboarding/cases`                            | `201` + created offboarding case object                                                                                                                                                                         |
| `POST /offboarding/cases/:id/accept`                 | `200` + updated offboarding case object                                                                                                                                                                         |
| `POST /offboarding/cases/:caseId/tasks`              | `201` + created task object                                                                                                                                                                                     |
| `PATCH /offboarding/tasks/:id`                       | `200` + updated task object (`status`: `pending`, `in_progress`, `completed`, `scheduled`, `notes?`)                                                                                                            |
| `PATCH /offboarding/tasks/:id/waive`                 | `200` + updated task object (`status: "Waived"`, `waiveReason`)                                                                                                                                                 |
| `PATCH /offboarding/tasks/:id/assignment`            | `200` + updated task object (`assignedTo` UUID required)                                                                                                                                                        |
| `PUT /offboarding/cases/:caseId/settlement`          | `200` + updated settlement object (`earnings[]`, `deductions[]`, `notes?`, `totalAmount`)                                                                                                                       |
| `POST /offboarding/cases/:caseId/settlement/submit`  | `200` + updated settlement object (`status: "submitted"`)                                                                                                                                                       |
| `POST /offboarding/cases/:caseId/settlement/approve` | `200` + updated settlement object (`status: "approved"`, `approvedBy`, `approvedAt`)                                                                                                                            |
| `POST /offboarding/cases/:caseId/access-revocation`  | `200` + updated case (`revokeAt`, `reason?`, `status: "Access revoked"`)                                                                                                                                        |
| `POST /offboarding/cases/:id/cancel`                 | `200` + updated case (`status: "Cancelled"`, `cancellationReason`)                                                                                                                                              |

The Postman collection still has no examples for them.

## 2. Collection documentation gaps

- **415 of 481** requests have no response example (`"body": null`).
- **376 of 479** request bodies are empty or literally `{}`.
- For the **`/v1/employees`** family, `POST /v1/employees`, `PATCH /v1/employees/:id`,
  `PATCH /v1/employees/:id/compensation`, and `POST /v1/employees/bank-account/validate`
  now include request body samples (including `roleId` and `bankCode`), though
  response bodies remain `null` in the collection (including `GET /v1/employees/banks`
  and `POST /v1/employees/bank-account/validate`).

Empty `{}` examples hide requirements the live API enforces (verified via
400s):

| Endpoint                                                   | Required / validated fields                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PATCH /v1/employees/onboarding/tasks/:taskId/complete`    | `notes` must be a string                                                                                                                                                                                                                                                                                                                                                                                                         |
| `PATCH /v1/employees/probation/reviews/:reviewId/complete` | `notes` must be a string                                                                                                                                                                                                                                                                                                                                                                                                         |
| `PATCH /v1/employees/onboarding/tasks/:taskId/assignment`  | `assignedTo` must be a UUID                                                                                                                                                                                                                                                                                                                                                                                                      |
| `POST /v1/employees/:id/probation/decision`                | `decision` must be `confirm` or `extend` (Postman sample also shows `newEndDate`, `reason`)                                                                                                                                                                                                                                                                                                                                      |
| `POST /v1/employees/organization/departments`              | `name` (string ≤ 120), `code` (string ≤ 30); lowercase `active`/`inactive` status                                                                                                                                                                                                                                                                                                                                                |
| `POST /v1/employees/organization/positions`                | `title` (string ≤ 160), `departmentId` (existing UUID); optional `approvedHeadcount` (≥ 0), `status` (`active`/`inactive`), `gradeId` (UUID). Rejects `grade`, `dept`, `approved`, `filled`, `openings`, `description`                                                                                                                                                                                                           |
| `PATCH /v1/employees/:id`                                  | `employmentStatus` enum — see section 5                                                                                                                                                                                                                                                                                                                                                                                          |
| `POST /v1/recruitment/vacancies`                           | **Verified:** `jobTitle` (≤ 160), `departmentId` (UUID), `openings` (int 1–1000), `employmentType` (≤ 80), `reasonForHire` (≤ 120), `jobDescription` (≤ 20000), `closingDate` (ISO 8601), `hiringManagerId` (UUID), `approverId` (UUID); optional `gradeId`, `workLocation`, salary fields (`salaryPeriod`: hourly/weekly/monthly/annual), `publishingChannel`, `saveAsDraft`                                                    |
| `POST /v1/training/courses`                                | **Verified:** `title` (string 1..200), `category` (`compliance`, `management`, `sales`, `technical`, `onboarding`, `other`), `defaultDeliveryMode` (`in_person`, `virtual`, `hybrid`), `learningObjectives` (string 1..10000), `mandatory` (boolean), `certificateOnCompletion` (boolean), `targetType` (`all`, `department`, `role`, `selected`), `targetIds` (string[]), `costPerPerson` (regex `^(0\|[1-9]\d*)(\.\d{1,6})?$`) |
| `POST /v1/training/courses/:id/sessions`                   | **Verified:** `startsAt` (ISO 8601), `endsAt` (ISO 8601), `deliveryMode` (`in_person`, `virtual`, `hybrid`), `capacity` (int 1..100000), `trainerType` (`internal`, `external`). Optional: `location`, `meetingUrl`, `externalProvider`, `internalTrainerId` (UUID)                                                                                                                                                              |
| `PATCH /v1/training/sessions/:id/status`                   | **Verified:** `status` must be either `in_progress` or `completed`                                                                                                                                                                                                                                                                                                                                                               |
| `POST /v1/training/sessions/:id/cancel`                    | **Verified:** `reason` (string required); only sessions with `scheduled` status can be cancelled (returns 409 Conflict otherwise)                                                                                                                                                                                                                                                                                                |
| `POST /v1/training/courses/:id/publish`                    | **Verified:** Requires at least one scheduled session (returns 409 Conflict otherwise) and target audience with active employees                                                                                                                                                                                                                                                                                                 |

Needed: real example bodies, required markers, and enum values in the
collection.

## 3. Missing endpoints (verified absent from the collection)

1. `DELETE /v1/employees/:id` — no delete or archive/terminate endpoint.
2. Manager lookup — no endpoint to list candidate managers, and no `managerId`
   write path.
3. Locations / grades — no list endpoints to populate those fields.
4. `POST /v1/employees/:id/probation/reviews` — only list and complete exist.
5. `POST` onboarding task creation — start/tasks/complete/assignment exist, but
   tasks cannot be added individually to an onboarding plan. (Currently using
   generic `POST /v1/tasks` with `{"title": "...", "assignedTo": "<uuid>"}` as a
   fallback; a dedicated endpoint such as `POST /v1/employees/:id/onboarding/tasks`
   is requested).
6. Bank lookup & account validation endpoints (`GET /v1/employees/banks`,
   `POST /v1/employees/bank-account/validate`) and `bankCode` on
   create/update/compensation were added in the collection; response body
   examples still need documentation/verification.
7. `POST /v1/employees/import` — imports exist for companies, contacts,
   products, services and leads, but not employees.
8. `DELETE` department / position — create and update exist without delete routes.
9. Dedicated status-change action for employees — status is only a generic
   PATCH field.
10. `DELETE /v1/training/courses/:id` and `DELETE /v1/training/sessions/:id` —
    DELETE routes return 404 (courses are soft-archived via `POST .../archive`,
    and sessions cancelled via `POST .../cancel`).
11. `GET /v1/reports/training-completion` — returns 403 Forbidden ("feature not
    available on current plan") under tenant credentials.

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
  `suspended`, `exited`.
  - Sending `employmentStatus: "inactive"` returns **400**.
  - `active` / `notice_period` / `suspended` / `exited` must be clearly documented
    in the Postman collection.
- Contract renewal has no documented fields and no contract read endpoint.
- Compensation PATCH cannot express an effective date or revision history.
- Relationship between `/v1/employees` and `/v1/staffs` is partially clarified
  (`POST /v1/employees` and `PATCH /v1/employees/:id` now accept `roleId`
  instead of `staffId`/`needsSystemAccount`), though employee records still carry
  `staffId: null` and `/v1/staffs` list remains separate.

## 6. Auth and error handling

- Access tokens expire; the `auth_cred.ts` refresh token works until
  **2026-11-26**, after which a fresh login is needed for probing. Do not
  commit real tokens.
- Permission model for staff vs tenant users is undocumented.
- Duplicate-email behavior on create is undocumented (409? 422? reuse?) —
  note `POST /v1/employees {}` currently succeeds and creates a draft.

## 7. Required endpoints in active use

| Method | Path                                         | Expected Contract / Scope                                                                         |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| GET    | `/v1/employees`                              | List employees                                                                                    |
| GET    | `/v1/employees/banks`                        | List supported banks (`name`, `code`) for employee compensation                                   |
| POST   | `/v1/employees/bank-account/validate`        | Validate bank account (`bankCode`, `accountNumber`, `firstName`, `middleName?`, `lastName`)       |
| GET    | `/v1/staffs`                                 | List staffs                                                                                       |
| GET    | `/v1/employees/:id`                          | Retrieve single employee record                                                                   |
| GET    | `/v1/employees/organization`                 | Organization hierarchy (`{ departments, positions }`)                                             |
| GET    | `/v1/employees/recent-activity`              | Activity audit log                                                                                |
| GET    | `/v1/employees/upcoming-milestones`          | Upcoming employee milestones (birthdays, work anniversaries)                                      |
| GET    | `/v1/employees/:id/compensation`             | Employee salary/compensation data                                                                 |
| POST   | `/v1/employees`                              | Create employee record (accepts `roleId`, `bankCode`, personal/employment/compensation/documents) |
| PATCH  | `/v1/employees/:id`                          | Update employee record (status must be in verified enum; accepts `roleId`, `bankCode`)            |
| PATCH  | `/v1/employees/:id/compensation`             | Update employee compensation (accepts `bankCode`)                                                 |
| PATCH  | `/v1/employees/:id/contract-renewal`         | Renew employee contract                                                                           |
| POST   | `/v1/employees/organization/departments`     | Create department (`name`, `code`, `status`)                                                      |
| PATCH  | `/v1/employees/organization/departments/:id` | Update department status (`active`/`inactive`)                                                    |
| POST   | `/v1/employees/organization/positions`       | Create position (`title`, `departmentId`, optional `approvedHeadcount`, `status`)                 |
| PATCH  | `/v1/employees/organization/positions/:id`   | Update position details                                                                           |

Onboarding & Probation:

| Method | Path                                                 | Expected Contract / Scope                              |
| ------ | ---------------------------------------------------- | ------------------------------------------------------ |
| GET    | `/v1/employees/:id/onboarding/tasks`                 | List employee onboarding tasks                         |
| GET    | `/v1/employees/:id/probation/reviews`                | List probation review schedule                         |
| POST   | `/v1/employees/:id/onboarding/start`                 | Start employee onboarding                              |
| PATCH  | `/v1/employees/onboarding/tasks/:taskId/complete`    | Complete task (`notes` string required)                |
| PATCH  | `/v1/employees/onboarding/tasks/:taskId/assignment`  | Reassign task (`assignedTo` UUID required)             |
| PATCH  | `/v1/employees/probation/reviews/:reviewId/complete` | Complete review (`notes` string required)              |
| POST   | `/v1/employees/:id/probation/decision`               | Finalize probation (`decision: "confirm" \| "extend"`) |

Training & Development:

| Method | Path                                     | Expected Contract / Scope                                                |
| ------ | ---------------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/v1/training/dashboard`                 | Main training overview: courses list + upcoming sessions                 |
| GET    | `/v1/training/courses`                   | Complete course catalog                                                  |
| GET    | `/v1/training/courses/:id`               | Retrieve single course detail                                            |
| POST   | `/v1/training/courses`                   | Create course draft (validated category, deliveryMode, cost, objectives) |
| PATCH  | `/v1/training/courses/:id`               | Update course details                                                    |
| POST   | `/v1/training/courses/:id/publish`       | Publish course (requires ≥1 scheduled session)                           |
| POST   | `/v1/training/courses/:id/archive`       | Archive course                                                           |
| POST   | `/v1/training/courses/:id/sessions`      | Create scheduled session for course                                      |
| PATCH  | `/v1/training/sessions/:id/status`       | Advance session status (`in_progress` or `completed`)                    |
| POST   | `/v1/training/sessions/:id/cancel`       | Cancel scheduled session (`reason` string required)                      |
| GET    | `/v1/training/sessions/:id/participants` | Retrieve enrolled participants for session                               |

Also in active use:

- Recruitment: `/v1/recruitment/*`
- Attendance: `/v1/attendance/*`
- Leave: `/v1/leave/types`, `/v1/leave/requests`, `/v1/leave/requests/mine`, `/v1/leave/balances/mine`, `POST /v1/leave/requests`, `PATCH /v1/leave/requests/:id/decision`, `PATCH /v1/leave/requests/:id/cancel`, `PUT /v1/leave/types`.
- Payroll: `/v1/payroll/*` (Settings, statutory rules, compensations, runs, payslips).

## 8. Organization module — partial implementation

| Method   | Endpoint                                                        | Status                                                   | Contract                                                                                                                                                       |
| -------- | --------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/v1/employees/organization`                                    | **Working** — `200` `{ departments: [], positions: [] }` | —                                                                                                                                                              |
| `POST`   | `/v1/employees/organization/departments`                        | Working route; `400` unless payload matches              | `name` (≤ 120), `code` (≤ 30), lowercase `active`/`inactive` status; rejects `id`, `head`, `count`, `parent`, `location`                                       |
| `PATCH`  | `/v1/employees/organization/departments/:id`                    | Route exists                                             | Status updates — lowercase `active`/`inactive`                                                                                                                 |
| `POST`   | `/v1/employees/organization/positions`                          | Working route; `400` unless payload matches              | **Verified:** `title` (≤ 160) + `departmentId` (existing UUID) required; optional `approvedHeadcount` (≥ 0), `status` (`active`/`inactive`), `gradeId` (UUID). |
| `PATCH`  | `/v1/employees/organization/positions/:id`                      | Route exists                                             | Fields unverified                                                                                                                                              |
| `DELETE` | `/v1/employees/organization/departments/:id` / `/positions/:id` | **Missing** (404)                                        | Delete endpoints missing; status deactivation used as workaround                                                                                               |

## 9. Re-verification checklist (remaining)

1. Fill in real request/response examples for the `/v1/employees` family in
   the Postman collection (shapes in section 1 are a starting point, plus
   `GET /v1/employees/banks` and `POST /v1/employees/bank-account/validate`).
2. Add the missing endpoints from section 3 or document intended replacements.
3. Align `employmentStatus` enum across documentation and validator (section 5).
4. Confirm the `/v1/employees` ↔ `/v1/staffs` relationship.
5. Re-verify position PATCH fields and the probation `extend` payload
   (`newEndDate` required?) with a complete employee record.
6. Renew probing credentials after 2026-11-26.
