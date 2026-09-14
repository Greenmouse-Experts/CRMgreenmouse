# Subscriptions and Billing

Public plan browsing, tenant subscription and billing, and the Paystack webhook.
Paths are shown relative to the [base URL](./README.md#base-url); responses use the
[standard envelope](./README.md#response-envelopes) unless noted otherwise.

## Public plans

### Browse all active subscription plans
`GET /subscriptions?page=1&limit=10&isActive=true`

Browse all active subscription plans (public).

- **Auth:** Public
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `page` | integer | Page number (starts from 1) |
  | `limit` | integer | Number of items per page (default: 10, max: 100) |
  | `isActive` | boolean | Filter by active status (optional) |

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — Paginated subscription plans
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

### Get a single subscription plan by ID
`GET /subscriptions/:id`

Get a single subscription plan by ID (public).

- **Auth:** Public
- **Path params:** `id` — string

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

## Tenant subscription

### Get current subscription details and plan
`GET /tenant/subscription/current`

Get current subscription details and plan.

- **Auth:** Bearer

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Browse available subscription plans
`GET /tenant/subscription/plans`

Browse available subscription plans.

- **Auth:** Bearer

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Get subscription change history
`GET /tenant/subscription/history?page=1&limit=20`

Get subscription change history (paginated).

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `page` | integer | Page number (starts from 1). |
  | `limit` | integer | Number of items per page. |

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Initiate a subscription upgrade
`POST /tenant/subscription/upgrade`

Initiate a subscription upgrade (creates Paystack payment).

- **Auth:** Bearer

**Body**
```json
{
  "planId": "string",
  "billingCycle": "monthly"
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

## Webhooks

### Paystack webhook
`POST /webhook/paystack`

Paystack webhook endpoint (public; no example body).

- **Auth:** Public

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — Webhook received
  _No example response body is provided in the collection._
