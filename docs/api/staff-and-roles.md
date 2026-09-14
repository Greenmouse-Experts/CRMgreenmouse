# Staff and Roles

Reference for staff account management and role-based access control. Staff
members are platform users; each one can be assigned a role that carries a set
of permissions.

## Staff

### Get all staff members

`GET /staffs`

Get all staff members.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create a new staff member

`POST /staffs`

Create a new staff member.

- **Auth:** Bearer

**Body**

```json
{
  "email": "staff@greenmouse.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phoneNumber": "+2348012345678",
  "roleId": "110e8400-e29b-41d4-a716-446655440000",
  "profilePic": "https://res.cloudinary.com/..."
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get a staff member by ID

`GET /staffs/:id`

Get a staff member by ID.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update a staff member

`PATCH /staffs/:id`

Update a staff member.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

```json
{
  "email": "staff@greenmouse.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phoneNumber": "+2348012345678",
  "roleId": "110e8400-e29b-41d4-a716-446655440000",
  "status": "active",
  "profilePic": "https://res.cloudinary.com/..."
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Delete a staff member

`DELETE /staffs/:id`

Delete a staff member.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

## Roles

### Get all roles

`GET /roles`

Get all roles.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create a new role

`POST /roles`

Create a new role.

- **Auth:** Bearer

**Body**

```json
{
  "name": "Sales Rep",
  "description": "Can manage customers and view orders",
  "permissions": ["customers:read", "orders:read"]
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get a role by ID

`GET /roles/:id`

Get a role by ID.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update role name or description

`PATCH /roles/:id`

Update role name or description.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

```json
{
  "name": "Sales Manager",
  "description": "Manages sales team and customer accounts",
  "permissions": ["customers:read", "orders:read"]
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Delete a role

`DELETE /roles/:id`

Delete a role.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Assign permissions to a role

`PATCH /roles/:id/permissions`

Assign permissions to a role.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

```json
{
  "permissions": ["customers:read", "orders:read"]
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._
