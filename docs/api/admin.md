# Super Admin

Platform-operator routes under `/admin/*`, covering one-time setup, admin
profile, permissions, subscription-plan management, and tenant management.

## Setup and profile

### Create the super admin account (one-time setup)
`POST /admin/setup`

Create the super admin account (one-time setup).

- **Auth:** Public

**Body**

```json
{
  "email": "admin@greenmouse.com",
  "password": "StrongPass123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+2348012345678"
}
```

**Responses**

- `201` — Created

  _No example response body is provided in the collection._

### Get admin profile
`GET /admin/profile`

Get admin profile.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

### Update admin profile
`PATCH /admin/profile`

Update admin profile.

- **Auth:** Bearer

**Body**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@greenmouse.com",
  "phoneNumber": "+2348012345678",
  "bio": "Super Admin / Team Manager",
  "profilePic": "https://res.cloudinary.com/...",
  "country": "Nigeria",
  "cityState": "Lagos, Ikeja",
  "postalCode": "100001",
  "taxId": "AS45645756"
}
```

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

### Change admin account password
`PATCH /admin/change-password`

Change admin account password.

- **Auth:** Bearer

**Body**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmNewPassword": "NewPass456"
}
```

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

### Get all available permissions with descriptions
`GET /admin/permissions`

Get all available permissions with descriptions — use when building roles.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

## Subscription plans (admin)

### List all subscription plans (admin)
`GET /admin/subscriptions`

List all subscription plans (admin view, includes inactive) with pagination.

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `page` | number | Page number (starts from 1) |
  | `limit` | number | Number of items per page (default: 10, max: 100) |
  | `isActive` | boolean | Filter by active status (optional) |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  ```json
  {
    "data": [
      [],
      []
    ],
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
  ```

### Create a new subscription plan
`POST /admin/subscriptions`

Create a new subscription plan.

- **Auth:** Bearer

**Body**

```json
{
  "name": "Starter Plan",
  "description": "Perfect for small teams getting started",
  "priceMonthly": 15000,
  "priceYearly": 150000,
  "trialDays": 14,
  "maxStaff": 3,
  "maxContacts": 50,
  "maxProducts": 10,
  "maxServices": 5,
  "maxInvoicesPerMonth": 10,
  "maxOrdersPerMonth": 30,
  "maxCategories": 5,
  "features": [
    "analytics",
    "data_export"
  ],
  "paystackPlanCodeMonthly": "PLN_abc123",
  "paystackPlanCodeYearly": "PLN_xyz456",
  "isCustomPrice": false,
  "isActive": true
}
```

**Responses**

- `201` — Created

  _No example response body is provided in the collection._

### Get a single subscription plan
`GET /admin/subscriptions/:id`

Get a single subscription plan.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

### Update a subscription plan
`PATCH /admin/subscriptions/:id`

Update a subscription plan.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

```json
{
  "name": "Starter Plan",
  "description": "Perfect for small teams getting started",
  "priceMonthly": 15000,
  "priceYearly": 150000,
  "trialDays": 14,
  "maxStaff": 3,
  "maxContacts": 50,
  "maxProducts": 10,
  "maxServices": 5,
  "maxInvoicesPerMonth": 10,
  "maxOrdersPerMonth": 30,
  "maxCategories": 5,
  "features": [
    "analytics",
    "data_export"
  ],
  "paystackPlanCodeMonthly": "PLN_abc123",
  "paystackPlanCodeYearly": "PLN_xyz456",
  "isCustomPrice": false,
  "isActive": true
}
```

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

### Delete a subscription plan
`DELETE /admin/subscriptions/:id`

Delete a subscription plan.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

## Tenants

### List all tenants
`GET /admin/tenants`

List all tenants.

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `search` | string | — |
  | `subscriptionStatus` | string | — |
  | `status` | string | — |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

### Tenant statistics
`GET /admin/tenants/stats`

Tenant statistics (total, active, suspended, trial).

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

### Get a single tenant
`GET /admin/tenants/:id`

Get a single tenant.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

### Activate or suspend a tenant
`PATCH /admin/tenants/:id/status`

Activate or suspend a tenant.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

### Assign or upgrade a tenant subscription plan
`PATCH /admin/tenants/:id/subscription`

Assign or upgrade a tenant subscription plan.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

```json
{
  "subscriptionPlanId": "110e8400-e29b-41d4-a716-446655440000",
  "billingCycle": "monthly"
}
```

**Responses**

- `200` — OK

  _No example response body is provided in the collection._
