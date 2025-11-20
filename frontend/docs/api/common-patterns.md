# Common Patterns

This document describes common patterns, conventions, and best practices used throughout the Debt PathFinder API.

---

## Error Handling

### Error Response Format

All error responses follow a consistent structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "fieldName",
      "additionalInfo": "value"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "uuid"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Request data is invalid or malformed |
| `VALIDATION_ERROR` | 400 | Data validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication token |
| `FORBIDDEN` | 403 | Authenticated but not authorized for this resource |
| `NOT_FOUND` | 404 | Requested resource doesn't exist |
| `CONFLICT` | 409 | Request conflicts with current state |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Error Handling Examples

**Invalid Input:**
```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Monthly payment must be at least the minimum payment",
    "details": {
      "field": "monthlyPayment",
      "minimumRequired": 150,
      "provided": 100
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Validation Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Multiple validation errors occurred",
    "details": {
      "errors": [
        {
          "field": "apr",
          "message": "APR must be between 0 and 100"
        },
        {
          "field": "balance",
          "message": "Balance must be greater than 0"
        }
      ]
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Rate Limit Exceeded:**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "details": {
      "limit": 1000,
      "remaining": 0,
      "resetAt": "2024-01-15T11:00:00Z"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## Rate Limiting

### Rate Limit Tiers

| Tier | Requests per Hour | Use Case |
|------|-------------------|----------|
| Anonymous | 100 | Unauthenticated requests |
| Authenticated | 1,000 | Standard user sessions |
| Premium | 10,000 | High-volume applications |

### Rate Limit Headers

Every response includes rate limit information:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705320600
X-RateLimit-Used: 1
```

### Handling Rate Limits

When you exceed the rate limit, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "details": {
      "retryAfter": 3600
    }
  }
}
```

**Best Practices:**
- Monitor `X-RateLimit-Remaining` header
- Implement exponential backoff
- Cache responses when possible
- Use webhooks instead of polling

---

## Pagination

### Request Parameters

For endpoints that return lists:

```http
GET /api/v1/debts?page=1&limit=20&sortBy=balance&order=desc
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 20 | Items per page (max 100) |
| `sortBy` | string | - | Field to sort by |
| `order` | string | asc | Sort order: `asc` or `desc` |

### Response Format

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Link Headers

Pagination links are also provided in headers:

```http
Link: <https://api.debtpathfinder.com/v1/debts?page=2>; rel="next",
      <https://api.debtpathfinder.com/v1/debts?page=3>; rel="last"
```

---

## Filtering

### Query Parameters

Most list endpoints support filtering:

```http
GET /api/v1/debts?type=credit-card&minBalance=1000&maxAPR=20
```

### Common Filters

| Filter | Type | Description |
|--------|------|-------------|
| `type` | string | Filter by debt type |
| `minBalance` | number | Minimum balance |
| `maxBalance` | number | Maximum balance |
| `minAPR` | number | Minimum APR |
| `maxAPR` | number | Maximum APR |
| `isDelinquent` | boolean | Filter delinquent debts |

### Multiple Values

Use comma-separated values for multiple filters:

```http
GET /api/v1/debts?type=credit-card,personal-loan
```

---

## Sorting

### Sort Parameters

```http
GET /api/v1/debts?sortBy=balance&order=desc
```

### Sortable Fields

Common sortable fields:
- `balance` - Debt balance
- `apr` - Interest rate
- `minimumPayment` - Minimum payment amount
- `name` - Debt name (alphabetical)
- `nextPaymentDate` - Next payment due date
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### Multiple Sort Fields

Sort by multiple fields using comma separation:

```http
GET /api/v1/debts?sortBy=apr,balance&order=desc,asc
```

---

## Timestamps

### Format

All timestamps use ISO 8601 format with UTC timezone:

```
2024-01-15T10:30:00Z
```

### Common Timestamp Fields

| Field | Description |
|-------|-------------|
| `createdAt` | When the resource was created |
| `updatedAt` | When the resource was last updated |
| `expiresAt` | When the resource expires |
| `deletedAt` | When the resource was soft-deleted |

---

## Idempotency

### Idempotency Keys

For POST requests that create resources, use idempotency keys to prevent duplicate operations:

```http
POST /api/v1/debts
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "type": "credit-card",
  "name": "Chase Visa",
  "balance": 5000
}
```

### How It Works

1. First request with key creates the resource
2. Subsequent requests with same key return the original response
3. Keys expire after 24 hours

### Generating Keys

Use UUIDs or other unique identifiers:

```javascript
const idempotencyKey = crypto.randomUUID();
```

---

## Versioning

### URL Versioning

The API uses URL-based versioning:

```
https://api.debtpathfinder.com/v1/debts
https://api.debtpathfinder.com/v2/debts
```

### Version Header

Optionally specify version in header:

```http
API-Version: v1
```

### Deprecation

When a version is deprecated:
1. Announcement 6 months in advance
2. Deprecation warnings in responses
3. Migration guide provided
4. Minimum 12 months support after deprecation

---

## Request/Response Format

### Content Type

All requests and responses use JSON:

```http
Content-Type: application/json
Accept: application/json
```

### Request Body

```json
{
  "field": "value",
  "nestedObject": {
    "field": "value"
  },
  "array": [1, 2, 3]
}
```

### Response Body

Success responses include data:

```json
{
  "id": "uuid",
  "field": "value",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

Error responses include error object:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

---

## Partial Updates

### PATCH vs PUT

- **PUT**: Replace entire resource
- **PATCH**: Update specific fields

### PATCH Example

```http
PATCH /api/v1/debts/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "balance": 4500,
  "minimumPayment": 140
}
```

Only specified fields are updated. Other fields remain unchanged.

---

## Bulk Operations

### Bulk Create

```http
POST /api/v1/debts/bulk
Content-Type: application/json

{
  "debts": [
    {
      "type": "credit-card",
      "name": "Chase Visa",
      "balance": 5000
    },
    {
      "type": "auto-loan",
      "name": "Car Loan",
      "balance": 15000
    }
  ]
}
```

### Bulk Update

```http
PATCH /api/v1/debts/bulk
Content-Type: application/json

{
  "updates": [
    {
      "id": "uuid-1",
      "balance": 4500
    },
    {
      "id": "uuid-2",
      "balance": 14500
    }
  ]
}
```

### Bulk Response

```json
{
  "successful": 8,
  "failed": 2,
  "results": [
    {
      "id": "uuid-1",
      "status": "success"
    },
    {
      "id": "uuid-2",
      "status": "error",
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Invalid balance"
      }
    }
  ]
}
```

---

## Caching

### Cache Headers

Responses include caching directives:

```http
Cache-Control: public, max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Mon, 15 Jan 2024 10:30:00 GMT
```

### Conditional Requests

Use ETags for conditional requests:

```http
GET /api/v1/profile
If-None-Match: "33a64df551425fcc55e4d42a148795d9f25f89d4"
```

If unchanged, returns `304 Not Modified`.

---

## CORS

### Allowed Origins

CORS is enabled for:
- `https://app.debtpathfinder.com`
- `http://localhost:*` (development)

### Preflight Requests

The API handles OPTIONS preflight requests:

```http
OPTIONS /api/v1/debts
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

Response:

```http
Access-Control-Allow-Origin: https://app.debtpathfinder.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

---

## Security

### HTTPS Only

All API requests must use HTTPS. HTTP requests are automatically redirected.

### Authentication

See [Sessions API](./sessions.md) for authentication details.

### Input Validation

All inputs are validated and sanitized:
- SQL injection prevention
- XSS prevention
- CSRF protection
- Rate limiting

### Sensitive Data

Sensitive data is:
- Encrypted at rest
- Encrypted in transit
- Never logged
- Automatically redacted in error messages

---

## Best Practices

### 1. Use Appropriate HTTP Methods

- `GET` - Retrieve resources
- `POST` - Create resources
- `PUT` - Replace resources
- `PATCH` - Update resources
- `DELETE` - Delete resources

### 2. Handle Errors Gracefully

```javascript
try {
  const response = await fetch('/api/v1/debts', {
    method: 'POST',
    body: JSON.stringify(debt)
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error.error.message);
    // Handle error appropriately
  }
  
  const data = await response.json();
  // Process successful response
} catch (error) {
  console.error('Network Error:', error);
  // Handle network errors
}
```

### 3. Implement Retry Logic

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        await sleep(retryAfter * 1000);
        continue;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

### 4. Cache Responses

```javascript
const cache = new Map();

async function fetchWithCache(url, options, ttl = 3600000) {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

### 5. Monitor Rate Limits

```javascript
function checkRateLimit(response) {
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  if (remaining < 10) {
    console.warn(`Rate limit low: ${remaining} requests remaining`);
    console.warn(`Resets at: ${new Date(reset * 1000)}`);
  }
}
```

---

## Next Steps

- [Sessions API](./sessions.md) - Authentication and session management
- [Profile API](./profile.md) - User profile operations
- [Debts API](./debts.md) - Debt management
- [Data Models](./data-models.md) - Complete type definitions