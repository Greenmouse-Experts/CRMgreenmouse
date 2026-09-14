# Sales

Orders and quotes raised against contacts and products.

## Orders

### List all orders
`GET /orders?search=string&status=processing`

List all orders.

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `search` | string | Search orders. |
  | `status` | string | Filter by order status. |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create a new order
`POST /orders`

Create a new order.

- **Auth:** Bearer

**Body**
```json
{
  "items": [
    {
      "productId": "664f1b2c9d3e4a5b6c7d8e9f",
      "qty": 2,
      "unitPrice": 15000
    },
    {
      "productId": "664f1b2c9d3e4a5b6c7d8e9f",
      "qty": 2,
      "unitPrice": 15000
    }
  ],
  "contactId": "664f1b2c9d3e4a5b6c7d8e9f",
  "discount": 500,
  "tax": 750,
  "currency": "NGN",
  "status": "pending",
  "paymentStatus": "unpaid",
  "assignedTo": "664f1b2c9d3e4a5b6c7d8e9f",
  "notes": "Deliver before end of month."
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get order statistics by status
`GET /orders/stats`

Get order statistics by status.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Get an order by ID
`GET /orders/:id`

Get an order by ID with full item details.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update an order
`PATCH /orders/:id`

Update an order.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "contactId": "664f1b2c9d3e4a5b6c7d8e9f",
  "items": [
    {
      "productId": "664f1b2c9d3e4a5b6c7d8e9f",
      "qty": 2,
      "unitPrice": 15000
    },
    {
      "productId": "664f1b2c9d3e4a5b6c7d8e9f",
      "qty": 2,
      "unitPrice": 15000
    }
  ],
  "discount": 500,
  "tax": 750,
  "currency": "NGN",
  "status": "pending",
  "paymentStatus": "unpaid",
  "assignedTo": "664f1b2c9d3e4a5b6c7d8e9f",
  "notes": "Deliver before end of month."
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Cancel / delete an order
`DELETE /orders/:id`

Cancel / delete an order.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update order status
`PATCH /orders/:id/status`

Update order status.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "status": "processing"
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

## Quotes

### List all quotes
`GET /quotes?search=string&status=pending`

List all quotes.

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `search` | string | Search by client name |
  | `status` | string | Filter by quote status. |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create a new quote
`POST /quotes`

Create a new quote.

- **Auth:** Bearer

**Body**
```json
{
  "date": "2026-06-15",
  "clientName": "Acme Corp",
  "amount": 150000,
  "description": "Website redesign and SEO optimization",
  "status": "pending"
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get quote statistics by status
`GET /quotes/stats`

Get quote statistics by status.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Get a quote by ID
`GET /quotes/:id`

Get a quote by ID.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update a quote
`PATCH /quotes/:id`

Update a quote.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "date": "2026-06-15",
  "clientName": "Acme Corp",
  "amount": 150000,
  "description": "Website redesign and SEO optimization",
  "status": "pending"
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Delete a quote
`DELETE /quotes/:id`

Delete a quote.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update quote status
`PATCH /quotes/:id/status`

Update quote status.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._
