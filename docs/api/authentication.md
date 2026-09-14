# System and Platform Authentication

This file covers the system routes (`/`, `/healthcheck`) and the platform
authentication surface used by super admins and staff (`/auth/*`). For
business-account (tenant) authentication, see [`tenant.md`](./tenant.md).

## System

### App root
`GET /`

App root endpoint; returns the app controller greeting.

- **Auth:** Public

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

### Health check
`GET /healthcheck`

Health check endpoint.

- **Auth:** Public

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK

  _No example response body is provided in the collection._

## Platform authentication

### Super admin login
`POST /auth/admin/login`

Super admin login.

- **Auth:** Public

**Body**

```json
{
  "email": "admin@greenmouse.com",
  "password": "password123"
}
```

**Responses**

- `201` — Created

  _No example response body is provided in the collection._

### Staff login
`POST /auth/staff/login`

Staff login.

- **Auth:** Public

**Body**

```json
{
  "email": "admin@greenmouse.com",
  "password": "password123"
}
```

**Responses**

- `201` — Created

  _No example response body is provided in the collection._

### Refresh access token
`POST /auth/refresh`

Refresh access token.

- **Auth:** Public

**Body**

_No request body is provided in the collection._

**Responses**

- `201` — Created

  _No example response body is provided in the collection._

### Logout current user
`POST /auth/logout`

Logout current user.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `201` — Created

  _No example response body is provided in the collection._

### Get current authenticated user
`GET /auth/me`

Get current authenticated user.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK

  _No example response body is provided in the collection._
