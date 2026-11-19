# Pending / broken API endpoints

Issues found while integrating the HR pages against the live backend. Probed on
**2026-11-19** using the test token in `auth_cred.ts` (that token has since
expired, so these need re-verification with a fresh token).

## Returning HTTP 500

| Method | Endpoint | Observed | Expected | Notes / frontend impact |
| --- | --- | --- | --- | --- |
| `GET` | `/v1/employees` | `500 Internal server error` | `200` with employee list | List endpoint is unusable. The people directory uses `/v1/staffs` instead. |
| `GET` | `/v1/employees/upcoming-milestones` | `500 Internal server error` | `200` with milestones list | No milestone data available to the UI. |
| `GET` | `/v1/employees/:id/onboarding/tasks` | `500 Internal server error` | `200` with task list | Also 500 with a **real** staff ID (created and deleted a probe staff record). Onboarding checklist shows an error state. |
| `GET` | `/v1/employees/:id/probation/reviews` | `500 Internal server error` | `200` with reviews list | Also 500 with a real staff ID. Probation tracker cannot load reviews. |
| `POST` | `/v1/employees/:id/onboarding/start` | `500 Internal server error` | `201` with created onboarding | Also 500 with a real staff ID. Starting onboarding from the UI fails until fixed. |
| `PATCH` | `/v1/staffs/:id` | `500 Internal server error` | `404` for unknown ID, `200` for valid ID | Probed with a dummy UUID. A missing record should not be a 500. Update hook exists but is unverified. |

## Missing endpoints

Probed with unauthenticated `curl` against
`https://crmgrenmouse-backend-api.onrender.com/v1/` — `404` means the route is
not registered (verified for any of the common methods).

### Organization module (frontend hooks exist in `src/api/organizationApi.ts`)

| Method | Endpoint | Observed | Expected | Notes |
| --- | --- | --- | --- | --- |
| `POST` | `/v1/departments` | `404` | — | Create department — `useCreateDepartment` |
| `PATCH` | `/v1/departments/:id` | `404` | — | Update department (status) — `useUpdateDepartment` |
| `DELETE` | `/v1/departments/:id` | `404` | — | Delete department — `useDeleteDepartment` |
| `POST` | `/v1/positions` | `404` | — | Create position — `useCreatePosition` |
| `PATCH` | `/v1/positions/:id` | `404` | — | Update position — `useUpdatePosition` |
| `GET` | `/v1/departments` | `404` | — | Organization read — frontend uses `GET /v1/employees/organization` instead |
| `GET` | `/v1/positions` | `404` | — | Same — see above |

### Other organization aliases (unverified, likely same backend work)

| Method | Endpoint | Observed | Expected |
| --- | --- | --- | --- |
| `GET` | `/v1/org` | `404` | — | Organization tree alias |
| `GET` | `/v1/structure` | `404` | — | Organization structure alias |
| `GET` | `/v1/hierarchy` | `404` | — | Organization hierarchy alias |
| `GET` | `/v1/positions/all` | `404` | — | Positions list alias |
| `GET` | `/v1/job-positions` | `404` | — | Positions list alias |

## Working endpoints (for reference)

Verified as responsive during the same session:

| Method | Endpoint | Result |
| --- | --- | --- |
| `GET` | `/v1/staffs` | `200` (array; empty for the test tenant) |
| `POST` | `/v1/staffs` | `201` — accepts only `email`, `firstName`, `lastName`, `phoneNumber`, optional `roleId`/`profilePic` |
| `DELETE` | `/v1/staffs/:id` | `200` — `"Staff deleted successfully"` |
| `GET` | `/v1/employees/organization` | `200` — `{ departments: [], positions: [] }` |
| `GET` | `/v1/employees/recent-activity` | `200` — `{ items, total, page, limit, totalPages }` |
| `GET` | `/v1/recruitment/dashboard` | `200` — `{ openVacancies, applicants, interviewsThisWeek, offersOut, pipeline, vacancies }` |
| `GET` | `/v1/recruitment/vacancies` / `applications` / `offers` / `interviews` | `200` (arrays; empty for the test tenant) |
| `GET` | `/v1/recruitment/approvers` | `200` (array with the tenant owner) |

## Configuration gaps (not endpoint bugs)

- `GET /v1/recruitment/options/department` and `.../grade` return `200` with
  `[]`. Vacancy creation needs real `departmentId`, `hiringManagerId` and
  `approverId` UUIDs, so these options must be seeded before the create-vacancy
  form can persist anything.

## Notes for the backend team

- Nested employee endpoints return 500 rather than 404 when the employee does
  not exist. The staff record used for probing was a valid `/v1/staffs` record,
  which suggests the employees table is a separate resource that the test
  tenant has no rows in — please confirm the intended relationship between
  `staffs` and `employees`.
- Validation errors from write endpoints (`{}` body) are otherwise useful and
  confirmed the required payloads; the full list is documented in
  `integration.md`.
