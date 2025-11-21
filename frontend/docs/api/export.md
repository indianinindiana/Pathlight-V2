# Export API

Export user data, scenarios, and reports in various formats for backup and portability.

---

## Overview

The Export API provides endpoints for exporting user data, debt information, scenarios, and reports in multiple formats including JSON, CSV, and PDF.

**Base Path:** `/export`

---

## Endpoints

### Export All Data

Exports complete user data including profile, debts, scenarios, and analytics.

**Endpoint:** `GET /export/all`

**Authentication:** Required

**Query Parameters:**
- `format` (string) - Export format: `json`, `zip` (default: json)
- `includeAnalytics` (boolean) - Include analytics data (default: false)

**Response:** `200 OK`

**JSON Format:**
```json
{
  "exportDate": "2024-01-15T10:30:00Z",
  "version": "1.0",
  "session": {
    "sessionId": "session-550e8400",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "profile": {
    "ageRange": "25-34",
    "employmentStatus": "full-time",
    "monthlyIncome": 5000,
    "monthlyExpenses": 3500,
    "liquidSavings": 2000,
    "creditScoreRange": "670-739",
    "primaryGoal": "pay-faster",
    "stressLevel": 3
  },
  "debts": [
    {
      "id": "debt-1",
      "type": "credit-card",
      "name": "Chase Visa",
      "balance": 5000,
      "apr": 18.99,
      "minimumPayment": 150,
      "nextPaymentDate": "2024-02-01T00:00:00Z"
    }
  ],
  "scenarios": [
    {
      "id": "scenario-1",
      "name": "Avalanche Strategy",
      "strategy": "avalanche",
      "monthlyPayment": 800,
      "totalMonths": 36,
      "totalInterest": 3200
    }
  ],
  "analytics": {
    "eventsCount": 25,
    "milestonesReached": 2,
    "sessionDuration": 1800
  }
}
```

**ZIP Format:**
Contains multiple files:
- `profile.json` - User profile
- `debts.csv` - Debt list
- `scenarios.json` - All scenarios
- `analytics.json` - Analytics data
- `README.txt` - Export information

**Example:**
```bash
curl -X GET "https://api.debtpathfinder.com/v1/export/all?format=json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o export.json
```

---

### Export Debts

Exports debt information in CSV or JSON format.

**Endpoint:** `GET /export/debts`

**Authentication:** Required

**Query Parameters:**
- `format` (string) - Export format: `json`, `csv` (default: csv)
- `includeCalculated` (boolean) - Include calculated fields (default: false)

**Response:** `200 OK`

**CSV Format:**
```csv
type,name,balance,apr,minimumPayment,nextPaymentDate,isDelinquent
credit-card,Chase Visa,5000.00,18.99,150.00,2024-02-01,false
auto-loan,Car Loan,15000.00,5.99,350.00,2024-02-15,false
```

**JSON Format:**
```json
{
  "exportDate": "2024-01-15T10:30:00Z",
  "debts": [
    {
      "type": "credit-card",
      "name": "Chase Visa",
      "balance": 5000,
      "apr": 18.99,
      "minimumPayment": 150,
      "nextPaymentDate": "2024-02-01T00:00:00Z",
      "isDelinquent": false
    }
  ],
  "summary": {
    "totalDebts": 2,
    "totalBalance": 20000,
    "totalMinimumPayment": 500,
    "weightedAPR": 12.49
  }
}
```

**Example:**
```bash
curl -X GET "https://api.debtpathfinder.com/v1/export/debts?format=csv" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o debts.csv
```

---

### Export Scenario

Exports a specific scenario with detailed payment schedule.

**Endpoint:** `GET /export/scenarios/{scenarioId}`

**Authentication:** Required

**Path Parameters:**
- `scenarioId` (string, required) - The scenario ID

**Query Parameters:**
- `format` (string) - Export format: `json`, `csv`, `pdf` (default: json)
- `includeSchedule` (boolean) - Include payment schedule (default: true)

**Response:** `200 OK`

**JSON Format:**
```json
{
  "exportDate": "2024-01-15T10:30:00Z",
  "scenario": {
    "id": "scenario-550e8400",
    "name": "Avalanche Strategy",
    "strategy": "avalanche",
    "monthlyPayment": 800,
    "totalMonths": 36,
    "totalInterest": 3200,
    "payoffDate": "2027-02-01T00:00:00Z"
  },
  "schedule": [
    {
      "month": 1,
      "date": "2024-02-01",
      "totalPayment": 800,
      "totalPrincipal": 646,
      "totalInterest": 154,
      "remainingBalance": 19354
    }
  ],
  "summary": {
    "totalPaid": 28800,
    "totalPrincipal": 20000,
    "totalInterest": 3200,
    "interestSavedVsMinimum": 4800
  }
}
```

**CSV Format:**
```csv
month,date,payment,principal,interest,remainingBalance
1,2024-02-01,800.00,646.00,154.00,19354.00
2,2024-03-01,800.00,656.00,144.00,18698.00
```

**PDF Format:**
Professional report including:
- Scenario summary
- Payment schedule table
- Interest vs principal chart
- Payoff timeline visualization
- Comparison with minimum payments

**Example:**
```bash
curl -X GET "https://api.debtpathfinder.com/v1/export/scenarios/scenario-550e8400?format=pdf" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o scenario-report.pdf
```

---

### Export Scenario Comparison

Exports a comparison of multiple scenarios.

**Endpoint:** `POST /export/comparison`

**Authentication:** Required

**Request Body:**
```json
{
  "scenarioIds": [
    "scenario-1",
    "scenario-2",
    "scenario-3"
  ],
  "format": "pdf"
}
```

**Response:** `200 OK`

**PDF Format:**
Professional comparison report including:
- Side-by-side scenario comparison
- Interest comparison chart
- Timeline comparison chart
- Detailed analysis
- Recommendations

**JSON Format:**
```json
{
  "exportDate": "2024-01-15T10:30:00Z",
  "scenarios": [
    {
      "name": "Minimum Payments",
      "monthlyPayment": 500,
      "totalMonths": 60,
      "totalInterest": 8000
    },
    {
      "name": "Aggressive Payoff",
      "monthlyPayment": 800,
      "totalMonths": 36,
      "totalInterest": 3200
    }
  ],
  "analysis": {
    "fastest": "Aggressive Payoff",
    "cheapest": "Aggressive Payoff",
    "lowestPayment": "Minimum Payments",
    "recommendation": "Aggressive Payoff saves $4,800 and gets you debt-free 24 months faster"
  }
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/export/comparison \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioIds": ["scenario-1", "scenario-2"],
    "format": "pdf"
  }' \
  -o comparison.pdf
```

---

### Export Progress Report

Exports a progress report showing debt reduction over time.

**Endpoint:** `GET /export/progress`

**Authentication:** Required

**Query Parameters:**
- `format` (string) - Export format: `json`, `pdf` (default: pdf)
- `startDate` (string) - Start date (ISO 8601)
- `endDate` (string) - End date (ISO 8601, default: today)

**Response:** `200 OK`

**PDF Format:**
Professional progress report including:
- Executive summary
- Debt reduction chart
- Payment history
- Milestones achieved
- Interest saved
- Projected completion date

**JSON Format:**
```json
{
  "exportDate": "2024-01-15T10:30:00Z",
  "period": {
    "start": "2024-01-01",
    "end": "2024-06-01",
    "months": 6
  },
  "progress": {
    "initialDebt": 20000,
    "currentDebt": 15000,
    "debtReduced": 5000,
    "percentageComplete": 25
  },
  "payments": {
    "totalPaid": 4800,
    "totalPrincipal": 5000,
    "totalInterest": -200,
    "averageMonthlyPayment": 800
  },
  "milestones": [
    {
      "date": "2024-04-15",
      "milestone": "First debt paid off",
      "impact": "Eliminated $5,000 credit card"
    }
  ],
  "projections": {
    "estimatedPayoffDate": "2027-01-01",
    "monthsRemaining": 30,
    "estimatedTotalInterest": 2800
  }
}
```

**Example:**
```bash
curl -X GET "https://api.debtpathfinder.com/v1/export/progress?format=pdf&startDate=2024-01-01" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o progress-report.pdf
```

---

### Import Data

Imports previously exported data to restore a session.

**Endpoint:** `POST /export/import`

**Authentication:** Required

**Content-Type:** `multipart/form-data` or `application/json`

**Form Data (for file upload):**
- `file` (file, required) - Exported JSON or ZIP file

**JSON Body (for direct import):**
```json
{
  "data": {
    "profile": {...},
    "debts": [...],
    "scenarios": [...]
  }
}
```

**Response:** `200 OK`
```json
{
  "imported": true,
  "summary": {
    "profileImported": true,
    "debtsImported": 3,
    "scenariosImported": 2,
    "errors": []
  },
  "warnings": [
    "Some analytics data could not be imported"
  ]
}
```

**Example:**
```bash
# Import from file
curl -X POST https://api.debtpathfinder.com/v1/export/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@export.json"

# Import from JSON
curl -X POST https://api.debtpathfinder.com/v1/export/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {...}
  }'
```

---

### Generate Shareable Link

Creates a shareable link for a scenario (read-only, no authentication required).

**Endpoint:** `POST /export/share`

**Authentication:** Required

**Request Body:**
```json
{
  "scenarioId": "scenario-550e8400",
  "expiresIn": 7,
  "includePersonalInfo": false
}
```

**Field Descriptions:**
- `scenarioId` (string, required) - Scenario to share
- `expiresIn` (number) - Days until link expires (1-30, default: 7)
- `includePersonalInfo` (boolean) - Include user profile data (default: false)

**Response:** `200 OK`
```json
{
  "shareId": "share-550e8400",
  "url": "https://app.debtpathfinder.com/shared/share-550e8400",
  "expiresAt": "2024-01-22T10:30:00Z",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Example:**
```bash
curl -X POST https://api.debtpathfinder.com/v1/export/share \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioId": "scenario-550e8400",
    "expiresIn": 7
  }'
```

---

### Get Shared Scenario

Retrieves a shared scenario (no authentication required).

**Endpoint:** `GET /export/shared/{shareId}`

**Authentication:** None

**Path Parameters:**
- `shareId` (string, required) - The share ID

**Response:** `200 OK`
```json
{
  "scenario": {
    "name": "Avalanche Strategy",
    "strategy": "avalanche",
    "monthlyPayment": 800,
    "totalMonths": 36,
    "totalInterest": 3200,
    "payoffDate": "2027-02-01"
  },
  "debts": [
    {
      "type": "credit-card",
      "balance": 5000,
      "apr": 18.99
    }
  ],
  "expiresAt": "2024-01-22T10:30:00Z"
}
```

**Example:**
```bash
curl -X GET https://api.debtpathfinder.com/v1/export/shared/share-550e8400
```

---

## Export Formats

### JSON
- **Use Case**: Data backup, programmatic access
- **Pros**: Complete data, easy to parse
- **Cons**: Not human-readable

### CSV
- **Use Case**: Spreadsheet analysis, data migration
- **Pros**: Universal format, easy to edit
- **Cons**: Limited to tabular data

### PDF
- **Use Case**: Reports, presentations, printing
- **Pros**: Professional formatting, portable
- **Cons**: Not editable, larger file size

### ZIP
- **Use Case**: Complete backup with multiple formats
- **Pros**: Includes all data types
- **Cons**: Requires extraction

---

## PDF Report Customization

### Branding
- Custom logo (coming soon)
- Color scheme
- Footer text

### Content Options
- Include/exclude sections
- Chart types
- Detail level

### Example Request:
```json
{
  "scenarioId": "scenario-550e8400",
  "format": "pdf",
  "options": {
    "includeLogo": true,
    "includeCharts": true,
    "includeSchedule": true,
    "detailLevel": "summary"
  }
}
```

---

## Best Practices

### 1. Regular Backups

```javascript
// Backup data weekly
async function backupData() {
  const response = await fetch('/api/v1/export/all?format=json', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  // Save to local storage or download
  localStorage.setItem('backup', JSON.stringify(data));
  
  // Or trigger download
  downloadFile(data, 'debt-pathfinder-backup.json');
}
```

### 2. Export Before Major Changes

```javascript
async function exportBeforeChange() {
  // Export current state
  const backup = await fetch('/api/v1/export/all?format=json', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }).then(r => r.json());
  
  // Store temporarily
  sessionStorage.setItem('preChangeBackup', JSON.stringify(backup));
  
  // Make changes...
  
  // Clear backup after successful change
  sessionStorage.removeItem('preChangeBackup');
}
```

### 3. Share Scenarios Securely

```javascript
async function shareScenario(scenarioId) {
  const share = await fetch('/api/v1/export/share', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      scenarioId,
      expiresIn: 7,
      includePersonalInfo: false  // Never share personal info
    })
  }).then(r => r.json());
  
  // Copy link to clipboard
  navigator.clipboard.writeText(share.url);
  
  // Show QR code for mobile sharing
  displayQRCode(share.qrCode);
}
```

### 4. Import with Validation

```javascript
async function importData(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await fetch('/api/v1/export/import', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    }).then(r => r.json());
    
    if (result.imported) {
      showSuccess(`Imported ${result.summary.debtsImported} debts and ${result.summary.scenariosImported} scenarios`);
      
      if (result.warnings.length > 0) {
        showWarnings(result.warnings);
      }
    } else {
      showErrors(result.summary.errors);
    }
  } catch (error) {
    showError('Failed to import data');
  }
}
```

---

## Rate Limits

Export endpoints have special rate limits:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `GET /export/all` | 5 | 1 hour |
| `GET /export/debts` | 20 | 1 hour |
| `GET /export/scenarios/{id}` | 20 | 1 hour |
| `POST /export/comparison` | 10 | 1 hour |
| `GET /export/progress` | 10 | 1 hour |
| `POST /export/import` | 5 | 1 hour |
| `POST /export/share` | 10 | 1 hour |

---

## Security Considerations

### Shared Links
- Expire after specified time
- No authentication required (read-only)
- Personal information excluded by default
- Can be revoked at any time

### Data Privacy
- Exports contain sensitive financial data
- Use HTTPS for all transfers
- Encrypt backups if storing locally
- Never share exports publicly

### Import Validation
- All imported data is validated
- Malformed data is rejected
- Partial imports are supported
- Original data is preserved on failure

---

## Related Documentation

- [Sessions API](./sessions.md) - Session management
- [Debts API](./debts.md) - Debt management
- [Scenarios API](./scenarios.md) - Scenario modeling
- [Analytics API](./analytics.md) - Usage tracking
- [Data Models](./data-models.md) - Complete type definitions