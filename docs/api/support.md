# Support

Support tickets and their message threads.

## Tickets

### List all tickets
`GET /tickets?priority=medium&assignedTo=string&status=in_progress`

List all tickets (filter by status, priority, assigned staff).

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `priority` | string | Filter by priority. |
  | `assignedTo` | string | Filter by staff ID |
  | `status` | string | Filter by status. |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create a new support ticket
`POST /tickets`

Create a new support ticket.

- **Auth:** Bearer

**Body**
```json
{
  "subject": "Unable to process payment",
  "contactId": "664f1b2c9d3e4a5b6c7d8e9f",
  "description": "Payment fails at checkout with error code 500",
  "priority": "medium",
  "attachments": [
    "https://res.cloudinary.com/example/screenshot.png"
  ]
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get ticket detail
`GET /tickets/:id`

Get ticket detail with full message thread.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update a ticket
`PATCH /tickets/:id`

Update ticket subject, description or priority.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "contactId": "664f1b2c9d3e4a5b6c7d8e9f",
  "subject": "Unable to process payment",
  "description": "Payment fails at checkout with error code 500",
  "priority": "medium",
  "attachments": [
    "https://res.cloudinary.com/example/screenshot.png"
  ]
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Delete a ticket
`DELETE /tickets/:id`

Delete a ticket.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Change ticket status
`PATCH /tickets/:id/status`

Change ticket status.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "status": "open"
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Assign ticket to a staff member
`PATCH /tickets/:id/assign`

Assign ticket to a staff member.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "staffId": "664f1b2c9d3e4a5b6c7d8e9f"
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Reply to a ticket thread
`POST /tickets/:id/messages`

Reply to a ticket thread.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "content": "We are looking into this issue and will update you shortly.",
  "attachments": [
    "https://res.cloudinary.com/example/file.pdf"
  ]
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._
