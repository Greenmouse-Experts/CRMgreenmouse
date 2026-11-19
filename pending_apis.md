# Pending / Problematic APIs

Verified against the current `Greenmouse CRM API.postman_collection.json`
(479 requests) and live probes run **2026-11-19** with the token in
`auth_cred.ts`. That token is now **expired** (later probes returned `401`), so
anything marked "probe" below should be re-checked with a fresh token before
the backend team acts on it.

## 1. Confirmed broken (HTTP 500 on live probe)

| Method | Endpoint | Observed | Expected | Impact |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/employees` | `500` | `200` + employee list | Main employee list unusable |
| `GET` | `/v1/employees/upcoming-milestones` | `500` | `200` + milestones | Dashboard milestones unusable |
| `GET` | `/v1/employees/:id/onboarding/tasks` | `500` | `200` + tasks | Also 500 with a real staff ID |
| `GET` | `/v1/employees/:id/probation/reviews` | `500` | `200` + reviews | Also 500 with a real staff ID |
| `POST` | `/v1/employees/:id/onboarding/start` | `500` | `201` | Cannot start onboarding |
| `POST` | `/v1/employees` | `500` (probe with `{}` got validation, no success path verified) | `201` | Employee creation unverified |
| `PATCH` | `/v1/staffs/:id` | `500` for a missing UUID | `404` | Missing record should not be a 500 |

The `/v1/employees` module appears broken as a whole. Until it is fixed, the
working alternative is `/v1/staffs` (see below).

## 2. Working alternatives verified in the same session

| Method | Endpoint | Result |
| --- | --- | --- |
| `GET` | `/v1/staffs` | `200`, array (empty for the test tenant) |
| `POST` | `/v1/staffs` | `201`; accepts only `email`, `firstName`, `lastName`, `phoneNumber`, optional `roleId`/`profilePic` |
| `DELETE` | `/v1/staffs/:id` | `200` — `"Staff deleted successfully"` |
| `GET` | `/v1/employees/organization` | `200` — `{ departments: [], positions: [] }` |
| `GET` | `/v1/employees/recent-activity` | `200` — `{ items, total, page, limit, totalPages }` |
| `GET` | `/v1/recruitment/dashboard` | `200` — `{ openVacancies, applicants, interviewsThisWeek, offersOut, pipeline, vacancies }` |
| `GET` | `/v1/recruitment/vacancies`, `/applications`, `/offers`, `/interviews` | `200`, arrays |
| `GET` | `/v1/recruitment/approvers` | `200`, array containing the tenant owner |

**Code impact:** `src/routes/hr/staffs` currently uses `src/api/employeesApi.ts`
(`/v1/employees`), which is the broken module. The previous integration used
`useStaffs` / `useCreateStaff` / `useDeleteStaff` from `tenantApi.ts`
(`/v1/staffs`), which worked. Switching back is the safest fix until the
employees module returns real data.

## 3. Collection documentation gaps (corrected counts)

Earlier notes said "every body is `{}`" and "every response body is `null`" —
those were overstatements. Current collection:

- **413 of 479** requests have no response example (`"body": null`), not all.
- **376 of 479** request bodies are empty or literally `{}`.
- For the **`/v1/employees`** family specifically, the "empty `{}`" statement
  **is** accurate — every write endpoint has a `{}` body and every response has
  no example.
- `POST` / `PATCH` on **`/v1/staffs` now do have documented bodies** with
  `<string>` placeholders, so `/staffs` is also the better-documented API.

| Endpoint | Method | Undocumented body |
| --- | --- | --- |
| `/v1/employees` | POST | creation fields |
| `/v1/employees/:id` | PATCH | updatable fields |
| `/v1/employees/:id/compensation` | PATCH | compensation fields |
| `/v1/employees/:id/contract-renewal` | PATCH | renewal fields |
| `/v1/employees/:id/probation/decision` | POST | decision payload + allowed values |
| `/v1/employees/probation/reviews/:reviewId/complete` | PATCH | completion payload |
| `/v1/employees/onboarding/tasks/:taskId/assignment` | PATCH | assignee id |
| `/v1/employees/organization/departments` | POST | department fields |
| `/v1/employees/organization/departments/:id` | PATCH | department fields |
| `/v1/employees/organization/positions` | POST | position fields |
| `/v1/employees/organization/positions/:id` | PATCH | position fields |

Needed: real example bodies, required markers, and enum values.

## 4. Documented contract vs. validation contradictions

Empty `{}` examples hide requirements that the live API actually enforces:

| Endpoint | Collection body | Validation error revealed |
| --- | --- | --- |
| `PATCH /v1/employees/onboarding/tasks/:taskId/complete` | empty | `notes` must be a string |
| `PATCH /v1/employees/probation/reviews/:reviewId/complete` | `{}` | `notes` must be a string |
| `PATCH /v1/employees/onboarding/tasks/:taskId/assignment` | `{}` | `assignedTo` must be a UUID |
| `POST /v1/employees/:id/probation/decision` | `{}` | `decision` must be `confirm` or `extend` |
| `POST /v1/employees/organization/departments` | `{}` | `name` must be a string |
| `POST /v1/recruitment/vacancies` (reference) | `{}` | `jobTitle`, `departmentId`, `openings`, `employmentType`, `reasonForHire`, `jobDescription`, `closingDate`, `hiringManagerId`, `approverId` |

The collection should be updated to include these fields.

## 5. Missing endpoints (verified absent from the collection)

1. `DELETE /v1/employees/:id` — no delete or archive/terminate endpoint. The
   client currently fakes removal with `PATCH { status: "inactive" }`.
2. Manager lookup — no endpoint to list candidate managers, and no `managerId`
   write path.
3. Locations / grades — no list endpoints to populate those fields.
4. `POST /v1/employees/:id/probation/reviews` — only list and complete exist.
5. `POST` onboarding task creation — start/tasks/complete/assignment exist, but
   tasks cannot be added individually.
6. Bank details / documents — nothing exposed for payroll or compliance.
7. `POST /v1/employees/import` — imports exist for companies, contacts,
   products, services and leads, but not employees.
8. `DELETE` department / position — create and update exist without delete.
9. Dedicated status-change action for employees — status is only a generic
   PATCH field.

## 6. Query / pagination gaps (corrected)

Earlier note: "`GET /v1/employees` accepts no query parameters." That is now
outdated — the collection documents
`GET /v1/employees?sort=lastName&order=desc`. Still missing:

- `search` / `q`, `status`, `departmentId`, `positionId`
- `page` / `limit` / `cursor`
- Explicit sortable-field enumeration

`GET /v1/employees/recent-activity` and `/upcoming-milestones` still have no
limit/window parameter.

## 7. Contract and status ambiguities

- Status values are not enumerated. The client guesses `active`, `probation`,
  `notice`, `notice_period`, `suspended`, `inactive`; a rename breaks the UI
  silently.
- `inactive` vs `suspended` both map to "Suspended" in the UI but mean
  different things.
- Contract renewal has no documented fields and no contract read endpoint.
- Compensation PATCH cannot express an effective date or revision history.

## 8. Auth and error handling

- The token in `auth_cred.ts` is expired; the refresh token expires too, so a
  stale session silently logs out. Do not commit real tokens.
- `src/api/employeesApi.ts` currently imports `auth_cred` directly — remove
  that dependency; all auth must go through the Axios interceptor.
- Permission model for staff vs tenant users is undocumented.
- Duplicate-email behavior on create is undocumented (409? 422? reuse?).

## 9. Endpoints currently wired in the app

| Method | Path | Client hook |
| --- | --- | --- |
| GET | `/v1/employees` | `useEmployees` |
| GET | `/v1/employees/:id` | `useEmployee` |
| GET | `/v1/employees/organization` | `useEmployeeOrganization` |
| GET | `/v1/employees/recent-activity` | `useEmployeeRecentActivity` |
| GET | `/v1/employees/upcoming-milestones` | `useUpcomingMilestones` |
| GET | `/v1/employees/:id/compensation` | `useEmployeeCompensation` |
| GET | `/v1/employees/:id/onboarding/tasks` | `useEmployeeOnboardingTasks` |
| GET | `/v1/employees/:id/probation/reviews` | `useEmployeeProbationReviews` |
| POST | `/v1/employees` | `useCreateEmployee` |
| PATCH | `/v1/employees/:id` | `useUpdateEmployee` |
| PATCH | `/v1/employees/:id` (`status: inactive`) | `useRemoveEmployee` |
| PATCH | `/v1/employees/:id/compensation` | `useUpdateCompensation` |
| PATCH | `/v1/employees/:id/contract-renewal` | `useRenewContract` |
| POST | `/v1/employees/:id/probation/decision` | `useDecideProbation` |
| PATCH | `/v1/employees/probation/reviews/:reviewId/complete` | `useCompleteProbationReview` |
| POST | `/v1/employees/:id/onboarding/start` | `useStartOnboarding` |
| PATCH | `/v1/employees/onboarding/tasks/:taskId/complete` | `useCompleteOnboardingTask` |
| PATCH | `/v1/employees/onboarding/tasks/:taskId/assignment` | `useReassignOnboardingTask` |
| POST | `/v1/employees/organization/departments` | `useCreateDepartment` |
| PATCH | `/v1/employees/organization/departments/:id` | `useUpdateDepartment` |
| POST | `/v1/employees/organization/positions` | `useCreatePosition` |
| PATCH | `/v1/employees/organization/positions/:id` | `useUpdatePosition` |

Also wired elsewhere:

- Recruitment: `src/api/recruitmentApi.ts` (`/v1/recruitment/*`)
- HR onboarding: `src/api/onboardingApi.ts` (`/v1/employees/:id/onboarding/*`,
  `/probation/*`) — affected by the section 1 failures
- Staff directory fallback: `src/api/tenantApi.ts` (`/v1/staffs`)

## 10. Re-verification checklist

1. Obtain a fresh bearer token (do not reuse `auth_cred.ts`).
2. Re-run GET on every endpoint in section 1 and record status codes.
3. Confirm whether `/v1/employees` and `/v1/staffs` are meant to be the same
   resource; if not, document the relationship.
4. Fill in real request/response examples for the `/v1/employees` family.
5. Add the missing endpoints from section 5 or document the intended
   replacements.
