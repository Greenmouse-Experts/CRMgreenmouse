# Dashboard

Aggregated stat cards and chart data. These endpoints return computed/aggregate payloads; the collection provides no example response bodies.

## Dashboard

### Get dashboard statistics
`GET /dashboard/stats`

Stat cards: total staffs, invoices, pending orders, customers, products.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Get monthly income vs expense
`GET /dashboard/income-expense?year=2026`

Monthly income vs expense chart for a given year.

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `year` | string | Year to chart. |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Get balance summary
`GET /dashboard/balance`

Balance summary: total, today, this month.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Get monthly profit
`GET /dashboard/profit?year=2026`

Monthly profit chart (income − expense) for a given year.

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `year` | string | Year to chart. |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Get user analytics
`GET /dashboard/user-analytics`

User analytics donut chart: users, products, expenses, revenue.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._
