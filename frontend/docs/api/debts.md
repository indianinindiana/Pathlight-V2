# Debts API

Manage user debt accounts including creation, updates, deletion, and bulk operations.

---

## Overview

The Debts API provides endpoints for managing individual debt accounts. It supports CRUD operations, bulk imports, validation, and prioritization.

**Base Path:** `/debts`

---

## Endpoints

### Create Debt

Creates a new debt account.

**Endpoint:** `POST /debts`

**Authentication:** Required

**Request Body:**
```json
{
  "type": "credit-card",
  "name": "Chase Visa",
  "balance": 5000,
  "apr": 18.99,
  "minimumPayment": 150,
  "nextPaymentDate": "2024-02-01",
  "isDelinquent": false
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | enum | Yes | Debt type: `credit-card`, `personal-loan`, `student-loan`, `auto-loan` |
| `name` | string | Yes | User-friendly name (1-100 characters) |
| `balance` | number | Yes | Current balance in USD (> 0) |
| `apr` | number | Yes | Annual Percentage Rate (0-100) |
| `minimumPayment` | number | Yes | Minimum monthly payment in USD |
| `nextPaymentDate` | string | Yes | Next payment due date (ISO 8601) |
| `isDelinquent` | boolean | No | Whether debt is past due (default: false) |
| `customOrder` | number | No | Custom priority order (1-n) |

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "session-uuid",
  "type": "credit-card",
  "name": "Chase Visa",
  "balance": 5000,
  "apr": 18.99,
  "minimumPayment": 150,
  "nextPaymentDate": "2024-02-01T00:00:00Z",
  "isDelinquent": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/debts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "credit-card",
    "name": "Chase Visa",
    "balance": 5000,
    "apr": 18.99,
    "minimumPayment": 150,
    "nextPaymentDate": "2024-02-01"
  }'
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Invalid or expired token
- `422 Unprocessable Entity` - Validation errors

**Validation Error Example:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Minimum payment must cover monthly interest",
    "details": {
      "field": "minimumPayment",
      "provided": 50,
      "minimumRequired": 79.13,
      "monthlyInterest": 79.13,
      "suggestion": "Increase minimum payment to at least $79.13"
    }
  }
}
```

---

### Get All Debts

Retrieves all debts for the current session.

**Endpoint:** `GET /debts`

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by debt type |
| `isDelinquent` | boolean | Filter delinquent debts |
| `minBalance` | number | Minimum balance filter |
| `maxBalance` | number | Maximum balance filter |
| `minAPR` | number | Minimum APR filter |
| `maxAPR` | number | Maximum APR filter |
| `sortBy` | string | Sort field: `balance`, `apr`, `name`, `nextPaymentDate` |
| `order` | string | Sort order: `asc`, `desc` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "credit-card",
      "name": "Chase Visa",
      "balance": 5000,
      "apr": 18.99,
      "minimumPayment": 150,
      "nextPaymentDate": "2024-02-01T00:00:00Z",
      "isDelinquent": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "summary": {
    "totalDebts": 5,
    "totalBalance": 25000,
    "totalMinimumPayment": 750,
    "weightedAPR": 16.5,
    "delinquentCount": 1
  }
}
```

**Example:**
```bash
# Get all debts
curl -X GET https://api.debtpathfinder.com/v1/debts \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get credit cards sorted by APR
curl -X GET "https://api.debtpathfinder.com/v1/debts?type=credit-card&sortBy=apr&order=desc" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get delinquent debts
curl -X GET "https://api.debtpathfinder.com/v1/debts?isDelinquent=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get Single Debt

Retrieves a specific debt by ID.

**Endpoint:** `GET /debts/{debtId}`

**Authentication:** Required

**Path Parameters:**
- `debtId` (string, required) - The debt ID

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "sessionId": "session-uuid",
  "type": "credit-card",
  "name": "Chase Visa",
  "balance": 5000,
  "apr": 18.99,
  "minimumPayment": 150,
  "nextPaymentDate": "2024-02-01T00:00:00Z",
  "isDelinquent": false,
  "customOrder": 1,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "calculated": {
    "monthlyInterest": 79.13,
    "principalPortion": 70.87,
    "payoffMonths": 48
  }
}
```

**Example:**
```bash
curl -X GET https://api.debtpathfinder.com/v1/debts/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - Debt not found

---

### Update Debt

Updates an existing debt. This is a full replacement (PUT).

**Endpoint:** `PUT /debts/{debtId}`

**Authentication:** Required

**Path Parameters:**
- `debtId` (string, required) - The debt ID

**Request Body:**
```json
{
  "type": "credit-card",
  "name": "Chase Visa",
  "balance": 4500,
  "apr": 18.99,
  "minimumPayment": 140,
  "nextPaymentDate": "2024-03-01",
  "isDelinquent": false
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "credit-card",
  "name": "Chase Visa",
  "balance": 4500,
  "apr": 18.99,
  "minimumPayment": 140,
  "nextPaymentDate": "2024-03-01T00:00:00Z",
  "isDelinquent": false,
  "updatedAt": "2024-01-16T14:20:00Z"
}
```

**Example:**
```bash
curl -X PUT https://api.debtpathfinder.com/v1/debts/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "credit-card",
    "name": "Chase Visa",
    "balance": 4500,
    "apr": 18.99,
    "minimumPayment": 140,
    "nextPaymentDate": "2024-03-01"
  }'
```

---

### Update Debt (Partial)

Updates specific fields of a debt without replacing the entire record.

**Endpoint:** `PATCH /debts/{debtId}`

**Authentication:** Required

**Path Parameters:**
- `debtId` (string, required) - The debt ID

**Request Body:**
```json
{
  "balance": 4500,
  "minimumPayment": 140
}
```

**Response:** `200 OK`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "credit-card",
  "name": "Chase Visa",
  "balance": 4500,
  "apr": 18.99,
  "minimumPayment": 140,
  "nextPaymentDate": "2024-02-01T00:00:00Z",
  "updatedAt": "2024-01-16T14:20:00Z"
}
```

**Example:**
```bash
curl -X PATCH https://api.debtpathfinder.com/v1/debts/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "balance": 4500,
    "minimumPayment": 140
  }'
```

---

### Delete Debt

Deletes a debt account.

**Endpoint:** `DELETE /debts/{debtId}`

**Authentication:** Required

**Path Parameters:**
- `debtId` (string, required) - The debt ID

**Response:** `204 No Content`

**Example:**
```bash
curl -X DELETE https://api.debtpathfinder.com/v1/debts/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired token
- `404 Not Found` - Debt not found

---

### Bulk Create Debts

Creates multiple debts in a single request.

**Endpoint:** `POST /debts/bulk`

**Authentication:** Required

**Request Body:**
```json
{
  "debts": [
    {
      "type": "credit-card",
      "name": "Chase Visa",
      "balance": 5000,
      "apr": 18.99,
      "minimumPayment": 150,
      "nextPaymentDate": "2024-02-01"
    },
    {
      "type": "auto-loan",
      "name": "Car Loan",
      "balance": 15000,
      "apr": 5.99,
      "minimumPayment": 350,
      "nextPaymentDate": "2024-02-15"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "index": 0,
      "status": "success",
      "debt": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Chase Visa",
        "balance": 5000
      }
    },
    {
      "index": 1,
      "status": "success",
      "debt": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Car Loan",
        "balance": 15000
      }
    }
  ]
}
```

**Partial Success Example:**
```json
{
  "successful": 1,
  "failed": 1,
  "results": [
    {
      "index": 0,
      "status": "success",
      "debt": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Chase Visa"
      }
    },
    {
      "index": 1,
      "status": "error",
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Minimum payment must cover monthly interest",
        "field": "minimumPayment"
      }
    }
  ]
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/debts/bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "debts": [
      {
        "type": "credit-card",
        "name": "Chase Visa",
        "balance": 5000,
        "apr": 18.99,
        "minimumPayment": 150,
        "nextPaymentDate": "2024-02-01"
      }
    ]
  }'
```

---

### Import from CSV

Imports debts from a CSV file.

**Endpoint:** `POST /debts/import/csv`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (file, required) - CSV file
- `skipHeader` (boolean, optional) - Skip first row (default: true)

**CSV Format:**
```csv
type,name,balance,apr,minimumPayment,nextPaymentDate,isDelinquent
credit-card,Chase Visa,5000,18.99,150,2024-02-01,false
auto-loan,Car Loan,15000,5.99,350,2024-02-15,false
```

**Response:** `201 Created`
```json
{
  "successful": 2,
  "failed": 0,
  "skipped": 0,
  "results": [
    {
      "row": 2,
      "status": "success",
      "debt": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Chase Visa"
      }
    },
    {
      "row": 3,
      "status": "success",
      "debt": {
        "id": "660e8400-e29b-41d4-a716-446655440001",
        "name": "Car Loan"
      }
    }
  ]
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/debts/import/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@debts.csv" \
  -F "skipHeader=true"
```

---

### Validate Debt

Validates debt data without saving it.

**Endpoint:** `POST /debts/validate`

**Authentication:** Required

**Request Body:**
```json
{
  "type": "credit-card",
  "name": "Chase Visa",
  "balance": 5000,
  "apr": 18.99,
  "minimumPayment": 50,
  "nextPaymentDate": "2024-02-01"
}
```

**Response:** `200 OK`
```json
{
  "valid": false,
  "errors": [
    {
      "field": "minimumPayment",
      "message": "Minimum payment must cover monthly interest",
      "severity": "error",
      "details": {
        "provided": 50,
        "minimumRequired": 79.13,
        "monthlyInterest": 79.13
      }
    }
  ],
  "warnings": [
    {
      "field": "apr",
      "message": "APR is higher than average for this debt type",
      "severity": "warning",
      "details": {
        "provided": 18.99,
        "average": 16.5
      }
    }
  ],
  "suggestions": [
    {
      "field": "minimumPayment",
      "message": "Consider setting minimum payment to $100 (2% of balance)",
      "suggestedValue": 100
    }
  ]
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/debts/validate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "credit-card",
    "balance": 5000,
    "apr": 18.99,
    "minimumPayment": 150
  }'
```

---

### Suggest Minimum Payment

Calculates a suggested minimum payment for a debt.

**Endpoint:** `POST /debts/suggest-payment`

**Authentication:** Required

**Request Body:**
```json
{
  "balance": 5000,
  "apr": 18.99
}
```

**Response:** `200 OK`
```json
{
  "suggestedPayment": 100,
  "breakdown": {
    "monthlyInterest": 79.13,
    "twoPercentOfBalance": 100,
    "interestPlusTwentyFive": 104.13
  },
  "reasoning": "Suggested payment is the greater of 2% of balance or monthly interest plus $25",
  "minimumToAvoidInterestAccrual": 79.13
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/debts/suggest-payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "balance": 5000,
    "apr": 18.99
  }'
```

---

### Update Debt Priority

Updates the custom priority order for debts.

**Endpoint:** `POST /debts/priority`

**Authentication:** Required

**Request Body:**
```json
{
  "priorities": [
    {
      "debtId": "550e8400-e29b-41d4-a716-446655440000",
      "order": 1
    },
    {
      "debtId": "660e8400-e29b-41d4-a716-446655440001",
      "order": 2
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "updated": 2,
  "debts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Chase Visa",
      "customOrder": 1
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Car Loan",
      "customOrder": 2
    }
  ]
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/debts/priority \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priorities": [
      {"debtId": "550e8400-e29b-41d4-a716-446655440000", "order": 1},
      {"debtId": "660e8400-e29b-41d4-a716-446655440001", "order": 2}
    ]
  }'
```

---

## Validation Rules

### Balance
- Must be > 0
- Maximum: $1,000,000
- Precision: 2 decimal places

### APR
- Must be between 0 and 100
- Precision: 2 decimal places
- Warning if > 25% (very high)

### Minimum Payment
- Must be > 0
- Must cover monthly interest: `payment >= (balance * apr / 100) / 12`
- Suggested: Greater of 2% of balance or interest + $25

### Next Payment Date
- Must be a valid date
- Warning if in the past
- Must be in ISO 8601 format

### Name
- Length: 1-100 characters
- Cannot be empty or whitespace only

---

## Calculated Fields

The API automatically calculates additional fields:

```json
{
  "calculated": {
    "monthlyInterest": 79.13,
    "principalPortion": 70.87,
    "payoffMonthsAtMinimum": 48,
    "totalInterestAtMinimum": 2200,
    "effectiveAPR": 19.2
  }
}
```

---

## Best Practices

### 1. Validate Before Creating

```javascript
async function createDebt(debtData) {
  // Validate first
  const validation = await fetch('/api/v1/debts/validate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(debtData)
  }).then(r => r.json());
  
  if (!validation.valid) {
    showErrors(validation.errors);
    return;
  }
  
  // Create if valid
  return fetch('/api/v1/debts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(debtData)
  });
}
```

### 2. Use Bulk Operations for Multiple Debts

```javascript
async function importDebts(debtsArray) {
  return fetch('/api/v1/debts/bulk', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ debts: debtsArray })
  });
}
```

### 3. Handle Partial Updates

```javascript
async function updateBalance(debtId, newBalance) {
  return fetch(`/api/v1/debts/${debtId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ balance: newBalance })
  });
}
```

### 4. Get Suggested Payments

```javascript
async function getSuggestedPayment(balance, apr) {
  const response = await fetch('/api/v1/debts/suggest-payment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ balance, apr })
  }).then(r => r.json());
  
  return response.suggestedPayment;
}
```

---

## Related Documentation

- [Profile API](./profile.md) - User financial context
- [Scenarios API](./scenarios.md) - Payoff simulations
- [Recommendations API](./recommendations.md) - Strategy recommendations
- [Data Models](./data-models.md) - Complete type definitions