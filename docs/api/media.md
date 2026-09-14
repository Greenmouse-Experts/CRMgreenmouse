# Media

Upload files to Cloudinary through a single multipart form endpoint. The
collection entry has no explicit headers and no stored body. The frontend sends
`multipart/form-data` with a `file` field (`src/api/fileApi.ts` and
`src/api/imageApi.ts`).

The response shape documented below comes from the frontend client types, not
from the collection example. The collection only records that the request
returns `201` with no stored body. The frontend types the response as
`{ data: { url, publicId }, message, ... }` — specifically
`ApiResponse<{ url: string; publicId: string }>`.

## Upload

### Upload a file (image, video, or PDF) to Cloudinary

`POST /multimedia/upload`

Upload a file (image, video, or PDF) to Cloudinary.

- **Auth:** Bearer

**Body**

_No request body is provided in the collection._

The frontend sends a multipart form with a single `file` field:

```ts
const fd = new FormData();
fd.append("file", file);
```

**Responses**

- `201` — Created
  _No example response body is provided in the collection._

Response shape used by the frontend client (`src/api/fileApi.ts`,
`src/api/imageApi.ts`) — not from the collection example:

```json
{
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "greenmouse/..."
  },
  "message": "..."
}
```
