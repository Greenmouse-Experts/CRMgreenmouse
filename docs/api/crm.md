# CRM

Reference for managing companies, contacts, and categories.

## Companies

### Get all companies
`GET /companies`

Get all companies.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create a new company
`POST /companies`

Create a new company.

- **Auth:** Bearer

**Body**
```json
{
  "name": "Acme Corporation",
  "industry": "Technology",
  "federalIdNumber": "12-3456789",
  "groupName": "Marketing",
  "workPhone": "555-000-0000",
  "email": "contact@company.com",
  "website": "https://www.company.com",
  "dateJoined": "2026-04-14",
  "addressLine1": "123 Main Street",
  "addressLine2": "Suite 100",
  "city": "Anytown",
  "state": "California",
  "zipCode": "90210",
  "country": "United States of America"
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get a company by ID
`GET /companies/:id`

Get a company by ID.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update a company
`PATCH /companies/:id`

Update a company.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "name": "Acme Corporation",
  "industry": "Technology",
  "federalIdNumber": "12-3456789",
  "groupName": "Marketing",
  "workPhone": "555-000-0000",
  "email": "contact@company.com",
  "website": "https://www.company.com",
  "dateJoined": "2026-04-14",
  "addressLine1": "123 Main Street",
  "addressLine2": "Suite 100",
  "city": "Anytown",
  "state": "California",
  "zipCode": "90210",
  "country": "United States of America"
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Delete a company
`DELETE /companies/:id`

Delete a company.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

## Contacts

### List all contacts
`GET /contacts`

List all contacts.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create a new contact
`POST /contacts`

Create a new contact.

- **Auth:** Bearer

**Body**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "type": "individual",
  "companyName": "Acme Corp",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "address": "123 Main Street",
  "city": "Lagos",
  "state": "Lagos State",
  "zipCode": "100001",
  "country": "Nigeria",
  "tags": [
    "VIP",
    "Wholesale"
  ],
  "assignedTo": "664f1b2c9d3e4a5b6c7d8e9f",
  "source": "Referral",
  "status": "lead"
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get a contact by ID
`GET /contacts/:id`

Get a contact by ID.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update a contact
`PATCH /contacts/:id`

Update a contact.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "type": "individual",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Acme Corp",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "address": "123 Main Street",
  "city": "Lagos",
  "state": "Lagos State",
  "zipCode": "100001",
  "country": "Nigeria",
  "tags": [
    "VIP",
    "Wholesale"
  ],
  "assignedTo": "664f1b2c9d3e4a5b6c7d8e9f",
  "source": "Referral",
  "status": "lead"
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Delete a contact
`DELETE /contacts/:id`

Delete a contact.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Add a note to a contact
`POST /contacts/:id/notes`

Add a note to a contact.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "content": "Customer called to enquire about pricing."
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

## Categories

### Get all categories
`GET /categories?search=string`

Get all categories.

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `search` | string | Search by category name |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create a new category
`POST /categories`

Create a new category.

- **Auth:** Bearer

**Body**
```json
{
  "name": "Electronics",
  "description": "All electronic products and gadgets"
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get a category by ID
`GET /categories/:id`

Get a category by ID.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update a category
`PATCH /categories/:id`

Update a category.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "name": "Electronics",
  "description": "All electronic products and gadgets"
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Delete a category
`DELETE /categories/:id`

Delete a category.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._
