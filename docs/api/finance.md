# Finance

Income records, expenses, and invoices.

## Income

### Get all income records
`GET /income?search=string&status=Approved&type=Grant`

Get all income records.

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `search` | string | — |
  | `status` | string | — |
  | `type` | string | — |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create an income record
`POST /income`

Create an income record.

- **Auth:** Bearer

**Body**
```json
{
  "amount": 1500,
  "type": "Salary",
  "source": "Greenmouse Ltd.",
  "description": "Monthly salary for April",
  "status": "Pending"
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get an income record by ID
`GET /income/:id`

Get an income record by ID.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update an income record
`PATCH /income/:id`

Update an income record.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "amount": 2000,
  "type": "Commission",
  "source": "Greenmouse Ltd.",
  "description": "Updated description",
  "status": "Pending"
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Delete an income record
`DELETE /income/:id`

Delete an income record.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update income status
`PATCH /income/:id/status`

Update income status.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

## Expenses

### Get all expense records
`GET /expenses?search=string&status=Approved&category=Software`

Get all expense records.

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `search` | string | — |
  | `status` | string | — |
  | `category` | string | — |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create an expense record
`POST /expenses`

Create an expense record.

- **Auth:** Bearer

**Body**
```json
{
  "amount": 526.15,
  "category": "Travel",
  "paidTo": "Vernon Effertz",
  "description": "Team offsite travel and accommodation",
  "status": "Pending"
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get an expense record by ID
`GET /expenses/:id`

Get an expense record by ID.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update an expense record
`PATCH /expenses/:id`

Update an expense record.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "amount": 750,
  "category": "Insurance",
  "paidTo": "Jane Smith",
  "description": "Updated description",
  "status": "Approved"
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Delete an expense record
`DELETE /expenses/:id`

Delete an expense record.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update expense status
`PATCH /expenses/:id/status`

Update expense status.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

## Invoices

### List all invoices
`GET /invoices?search=string&contactId=string&status=sent`

List all invoices.

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `search` | string | Search by invoice number |
  | `contactId` | string | — |
  | `status` | string | — |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create a new invoice
`POST /invoices`

Create a new invoice (invoice number auto-generated).

- **Auth:** Bearer

**Body**
```json
{
  "issuedDate": "2026-05-25",
  "dueDate": "2026-06-25",
  "items": [
    {
      "description": "Web Design Service",
      "qty": 2,
      "unitPrice": 50000
    },
    {
      "description": "Web Design Service",
      "qty": 2,
      "unitPrice": 50000
    }
  ],
  "orderId": "664f1b2c9d3e4a5b6c7d8e9f",
  "contactId": "664f1b2c9d3e4a5b6c7d8e9f",
  "billingAddress": "15 Marina Road, Lagos, Nigeria",
  "discount": 5000,
  "tax": 3750,
  "currency": "NGN",
  "status": "draft"
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get invoice statistics by status
`GET /invoices/stats`

Get invoice statistics by status.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Get an invoice by ID
`GET /invoices/:id`

Get an invoice by ID.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update a draft invoice
`PATCH /invoices/:id`

Update a draft invoice.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "orderId": "664f1b2c9d3e4a5b6c7d8e9f",
  "contactId": "664f1b2c9d3e4a5b6c7d8e9f",
  "billingAddress": "15 Marina Road, Lagos, Nigeria",
  "issuedDate": "2026-05-25",
  "dueDate": "2026-06-25",
  "items": [
    {
      "description": "Web Design Service",
      "qty": 2,
      "unitPrice": 50000
    },
    {
      "description": "Web Design Service",
      "qty": 2,
      "unitPrice": 50000
    }
  ],
  "discount": 5000,
  "tax": 3750,
  "currency": "NGN",
  "status": "draft",
  "pdfUrl": "https://res.cloudinary.com/example/invoice.pdf"
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Delete an invoice
`DELETE /invoices/:id`

Delete an invoice.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update invoice status
`PATCH /invoices/:id/status`

Update invoice status.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "status": "paid"
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Mark invoice as sent
`PATCH /invoices/:id/send`

Mark invoice as sent.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Mark invoice as paid
`PATCH /invoices/:id/mark-paid`

Mark invoice as paid (records paidAt timestamp).

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._
