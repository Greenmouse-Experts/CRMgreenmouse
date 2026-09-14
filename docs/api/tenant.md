# Tenant

Business (tenant) self-service routes under `/tenant/*`: authentication, onboarding,
and login activity. Paths are shown relative to the [base URL](./README.md#base-url);
responses use the [standard envelope](./README.md#response-envelopes) unless noted
otherwise.

## Tenant authentication

### Register a new business account
`POST /tenant/auth/register`

Create a new business (tenant) account. A verification code is sent to the supplied
email address.

- **Auth:** Public

**Body**
```json
{
  "email": "john@acmecorp.com",
  "password": "StrongPass123!",
  "companyName": "Acme Corp",
  "phoneNumber": "+2348012345678"
}
```

**Responses**

- `201` — Created
  ```json
  {
    "message": "Registration successful. Please check your email for the verification code.",
    "email": "john@acmecorp.com"
  }
  ```
- `409` — An account with this email already exists
  _No example response body is provided in the collection._

### Verify email with OTP
`POST /tenant/auth/verify-email`

Confirm the account email address using the one-time code sent by email.

- **Auth:** Public

**Body**
```json
{
  "email": "john@acmecorp.com",
  "otp": "482910"
}
```

**Responses**

- `200` — OK
  ```json
  {
    "message": "Operation completed successfully."
  }
  ```
- `400` — Invalid or expired OTP
  _No example response body is provided in the collection._

### Resend email verification OTP
`POST /tenant/auth/resend-otp`

Resend the email verification one-time code.

- **Auth:** Public

**Body**
```json
{
  "email": "john@acmecorp.com"
}
```

**Responses**

- `200` — OK
  ```json
  {
    "message": "Operation completed successfully."
  }
  ```

### Change email before verification
`PATCH /tenant/auth/change-email`

Change the account email before verification; a new code is sent to the new address.

- **Auth:** Public

**Body**
```json
{
  "currentEmail": "old@example.com",
  "newEmail": "new@example.com"
}
```

**Responses**

- `200` — OK
  ```json
  {
    "message": "Email updated. A new verification code has been sent to your new email address.",
    "email": "newemail@acmecorp.com"
  }
  ```
- `400` — Email already verified or same as current
  _No example response body is provided in the collection._
- `409` — An account with this email already exists
  _No example response body is provided in the collection._

### Business owner login
`POST /tenant/auth/login`

Authenticate a business owner and receive access and refresh tokens.

- **Auth:** Public

**Body**
```json
{
  "email": "john@acmecorp.com",
  "password": "StrongPass123!"
}
```

**Responses**

- `200` — OK
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "664f1b2c9d3e4a5b6c7d8e9f",
      "email": "john@acmecorp.com",
      "companyName": "Acme Corp",
      "isOnboarded": false,
      "userType": "tenant"
    }
  }
  ```
- `401` — Invalid credentials
  _No example response body is provided in the collection._

### Refresh access token
`POST /tenant/auth/refresh`

Exchange a refresh token for a new access/refresh token pair.

- **Auth:** Public

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — OK
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- `401` — Invalid or expired refresh token
  _No example response body is provided in the collection._

### Request password reset OTP
`POST /tenant/auth/forgot-password`

Request a password-reset one-time code by email.

- **Auth:** Public

**Body**
```json
{
  "email": "john@acmecorp.com"
}
```

**Responses**

- `200` — OK
  ```json
  {
    "message": "Operation completed successfully."
  }
  ```

### Reset password using OTP
`POST /tenant/auth/reset-password`

Set a new password using the one-time reset code.

- **Auth:** Public

**Body**
```json
{
  "email": "john@acmecorp.com",
  "otp": "482910",
  "newPassword": "NewStrongPass123!"
}
```

**Responses**

- `200` — OK
  ```json
  {
    "message": "Operation completed successfully."
  }
  ```
- `400` — Invalid or expired reset code
  _No example response body is provided in the collection._

### Logout current tenant
`POST /tenant/auth/logout`

Invalidate the current tenant session.

- **Auth:** Bearer

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — OK
  ```json
  {
    "message": "Operation completed successfully."
  }
  ```

### Get current tenant profile
`GET /tenant/auth/me`

Return the profile claims of the current tenant.

- **Auth:** Bearer

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — OK
  ```json
  {
    "sub": "664f1b2c9d3e4a5b6c7d8e9f",
    "email": "john@acmecorp.com",
    "companyName": "Acme Corp",
    "userType": "tenant",
    "isOnboarded": false
  }
  ```

## Onboarding

### Get current onboarding status and saved data
`GET /tenant/onboarding`

Return the tenant's onboarding status together with any saved onboarding data.

- **Auth:** Bearer

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — OK
  ```json
  {
    "id": "664f1b2c9d3e4a5b6c7d8e9f",
    "companyName": "Acme Corp",
    "isOnboarded": false,
    "industry": "technology",
    "teamSize": "11-50",
    "logo": "https://res.cloudinary.com/example/logo.png",
    "theme": "light",
    "companyAddress": "15 Marina Road",
    "companyCity": "Lagos",
    "companyState": "Lagos State",
    "companyCountry": "Nigeria",
    "companyWebsite": "https://acmecorp.com",
    "businessType": "Limited Liability Company",
    "isCacRegistered": true,
    "hearAboutUs": "Social Media"
  }
  ```

### Save onboarding step data
`PATCH /tenant/onboarding`

Save onboarding step data; safe to call repeatedly as the user progresses.

- **Auth:** Bearer

**Body**
```json
{
  "industry": "Technology",
  "teamSize": "500+",
  "logo": "https://res.cloudinary.com/...",
  "theme": "light",
  "companyAddress": "15 Marina Road, Lagos",
  "companyCity": "Lagos",
  "companyCountry": "Nigeria",
  "companyWebsite": "https://acmecorp.com",
  "companyState": "Lagos",
  "businessType": "Limited Liability Company",
  "isCacRegistered": true,
  "hearAboutUs": "Social Media"
}
```

**Responses**

- `200` — OK
  ```json
  {
    "id": "664f1b2c9d3e4a5b6c7d8e9f",
    "companyName": "Acme Corp",
    "isOnboarded": false,
    "industry": "technology",
    "teamSize": "11-50",
    "logo": "https://res.cloudinary.com/example/logo.png",
    "theme": "light",
    "companyAddress": "15 Marina Road",
    "companyCity": "Lagos",
    "companyState": "Lagos State",
    "companyCountry": "Nigeria",
    "companyWebsite": "https://acmecorp.com",
    "businessType": "Limited Liability Company",
    "isCacRegistered": true,
    "hearAboutUs": "Social Media"
  }
  ```

### Mark onboarding as complete
`POST /tenant/onboarding/complete`

Mark the tenant's onboarding flow as complete.

- **Auth:** Bearer

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — OK
  ```json
  {
    "message": "Onboarding completed successfully"
  }
  ```

## Login activity

### Get recent login activities
`GET /tenant/login-activity?page=1&limit=20`

Return recent login activity records for the tenant, paginated.

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `page` | integer | Page number (starts from 1). |
  | `limit` | integer | Number of items per page. |

The collection's saved example uses nonsensical placeholder values
(`page=1154.1018899262212&limit=1154.1018899262212`); treat `page` and `limit` as
integers.

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Get latest login activity
`GET /tenant/login-activity/latest`

Return the tenant's most recent login activity record.

- **Auth:** Bearer

**Body**
_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._
