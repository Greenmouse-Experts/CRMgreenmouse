# Catalog

Products and services, including inventory adjustment.

## Products

### List products
`GET /products?search=string&categoryId=string&isActive=false&type=service`

List products (filter by category, type, stock status).

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `search` | string | — |
  | `categoryId` | string | — |
  | `isActive` | boolean | — |
  | `type` | string | — |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create a product or service
`POST /products`

Create a product or service.

- **Auth:** Bearer

**Body**
```json
{
  "name": "Office Chair",
  "price": 45000,
  "description": "Ergonomic office chair with lumbar support",
  "categoryId": "664f1b2c9d3e4a5b6c7d8e9f",
  "type": "product",
  "cost": 30000,
  "currency": "NGN",
  "stock": 20,
  "trackInventory": true,
  "images": [
    "https://res.cloudinary.com/example/image1.jpg"
  ],
  "isActive": true
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get a product by ID
`GET /products/:id`

Get a product by ID.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update a product
`PATCH /products/:id`

Update a product.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "name": "Electronic Metal Hat v2",
  "categoryId": "664f1b2c9d3e4a5b6c7d8e9f",
  "price": 950,
  "quantity": 20,
  "inStock": true,
  "description": "Updated description"
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Delete a product
`DELETE /products/:id`

Delete a product.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Adjust stock quantity
`PATCH /products/:id/stock`

Adjust stock quantity (positive to add, negative to subtract).

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "adjustment": 10
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

## Services

### Get all services
`GET /services?search=string&categoryId=string&isActive=false`

Get all services.

- **Auth:** Bearer
- **Query params:**

  | Param | Type | Description |
  | --- | --- | --- |
  | `search` | string | Search by service name |
  | `categoryId` | string | — |
  | `isActive` | boolean | — |

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Create a new service
`POST /services`

Create a new service.

- **Auth:** Bearer

**Body**
```json
{
  "name": "Electronic Wooden Fish",
  "price": 324.99,
  "image": "https://res.cloudinary.com/...",
  "categoryId": "664f1b2c9d3e4a5b6c7d8e9f",
  "description": "Premium wooden fish service with electronic components",
  "isActive": true
}
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

### Get a service by ID
`GET /services/:id`

Get a service by ID.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Update a service
`PATCH /services/:id`

Update a service.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**
```json
{
  "name": "Electronic Wooden Fish Pro",
  "image": "https://res.cloudinary.com/...",
  "price": 399.99,
  "categoryId": "664f1b2c9d3e4a5b6c7d8e9f",
  "description": "Updated description",
  "isActive": false
}
```

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Delete a service
`DELETE /services/:id`

Delete a service.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._

### Toggle service active status
`PATCH /services/:id/toggle-active`

Toggle service active status.

- **Auth:** Bearer
- **Path params:** `id` — string

**Body**

_No request body is provided in the collection._

**Responses**

- `200` — OK
  _No example response body is provided in the collection._
